# Blood Bank Admin — Version 3 Enhancement Plan

> **Prepared for:** Senior Engineering Review  
> **Scope:** Anti-corruption lifecycle enforcement, mobile app handoff model, database hardening, dashboard enhancements  
> **Status:** Pre-implementation planning document

---

## Table of Contents

1. [Context & Goals](#1-context--goals)
2. [Current State Analysis](#2-current-state-analysis)
3. [Phase 1 — Database Redesign](#3-phase-1--database-redesign)
   - 1.1 Harden the Check Status Machine
   - 1.2 Signed Handoff Events Table
   - 1.3 Explicit Signature Columns
   - 1.4 Convert Performance Tables to Views
   - 1.5 Anti-Corruption Views
   - 1.6 Migration Strategy
4. [Phase 2 — Mobile App API Layer](#4-phase-2--mobile-app-api-layer)
   - 2.1 Edge Functions
   - 2.2 RLS Policy Updates
5. [Phase 3 — Dashboard Enhancements](#5-phase-3--dashboard-enhancements)
   - 3.1 Check Lifecycle Dashboard
   - 3.2 Enhanced Check Detail Page
   - 3.3 Check List Enhancements
6. [Phase 4 — Frontend Code Changes](#6-phase-4--frontend-code-changes)
   - 4.1 API Layer
   - 4.2 New Constants
   - 4.3 New Dashboard API
7. [Phase 5 — Integrity & Reporting](#7-phase-5--integrity--reporting)
   - 5.1 Integrity Report Function
   - 5.2 Materialized View for Performance
8. [Execution Order](#8-execution-order)
9. [File Change Manifest](#9-file-change-manifest)

---

## 1. Context & Goals

### Background

The current system tracks donation checks through a lifecycle (`created → transferred → blood_recorded → distributed → completed`) but the status transitions are enforced entirely in application code. A malicious or careless actor could update `donation_checks.status` directly via SQL, skip stages, or backdate timestamps without any record of who did it. The `receiver_performance` and `distributor_performance` tables are independently written tables, not derived from the checks themselves, so they can drift out of sync.

### V3 Goals

| Goal | Mechanism |
|---|---|
| Every check handoff must be attributed to a specific user | `check_events` append-only table |
| Status transitions cannot skip stages or go backward | Postgres trigger + enum type |
| Mobile app roles can only advance to their permitted stages | Edge Functions validate role before any write |
| Admin can detect checks stuck in a stage or never distributed | Anti-corruption views + dashboard KPIs |
| `receiver_performance` and `distributor_performance` are always consistent with check data | Recreated as views over `check_events` |
| Device/app context is captured at each handoff | `device_info` JSONB column on events |

### New Status Lifecycle

```
created → collected → transferred → blood_recorded → distributed → patient_served → completed
```

Two new stages are introduced:

- **`collected`** — Receiver confirms they have physically taken the check from the donor. This is the receiver's first "signature."
- **`patient_served`** — Distributor confirms the blood was delivered to the patient. This is the anti-corruption closure event.

---

## 2. Current State Analysis

### What the schema already has

The `donation_checks` table already carries:

| Column | Purpose |
|---|---|
| `donor_id` | who donated |
| `created_by` | receiver who created the check |
| `distributor_id` | distributor assigned |
| `patient_id` | patient receiving blood |
| `transferred_to_distributor_at` | timestamp of transfer |
| `distributed_at` | timestamp of distribution |
| `blood_recorded_by` | lab staff who verified type |
| `blood_recorded_at` | timestamp of lab verification |
| `status` | free-text lifecycle stage |

### What is missing or weak

1. **No database-level status enforcement.** `status` is a plain `text` column. Any authenticated service-role query can set it to anything.
2. **No event log.** There is no record of *who* changed the status, *when*, or from *what device*. The `activities` table exists but is not reliably written to.
3. **No "collected" stage.** The receiver creates a check but there is no explicit moment where they sign off that they have physically handed it over. The jump from `created` to `transferred` skips the collection confirmation.
4. **No "patient_served" stage.** The current final meaningful stage is `distributed` — but distribution to a distributor is not the same as blood reaching a patient. The distributor must confirm patient delivery.
5. **Performance tables are write targets.** `receiver_performance` and `distributor_performance` are independent tables. Their data can contradict `donation_checks` if writes fail or are done out of order.
6. **Direct table updates from clients.** The current `update_checks` RLS policy allows any of the four non-admin roles to `UPDATE donation_checks` directly. This bypasses all business logic.

---

## 3. Phase 1 — Database Redesign

### 3.1 Harden the Check Status Machine

#### Create the enum type

```sql
-- Migration: 000020_check_status_enum.sql

create type check_status as enum (
  'created',
  'collected',
  'transferred',
  'blood_recorded',
  'distributed',
  'patient_served',
  'completed'
);
```

#### Alter the column

```sql
-- Backfill any nulls or unknown values first
update donation_checks
  set status = 'created'
  where status not in (
    'created','collected','transferred',
    'blood_recorded','distributed','patient_served','completed'
  );

-- Change column type
alter table donation_checks
  alter column status type check_status
  using status::check_status;

-- Set default
alter table donation_checks
  alter column status set default 'created';
```

#### Add the transition enforcement trigger

```sql
create or replace function enforce_status_transition()
returns trigger language plpgsql as $$
declare
  allowed_transitions jsonb := '{
    "created":        ["collected"],
    "collected":      ["transferred"],
    "transferred":    ["blood_recorded"],
    "blood_recorded": ["distributed"],
    "distributed":    ["patient_served"],
    "patient_served": ["completed"],
    "completed":      []
  }';
  allowed_next jsonb;
begin
  if NEW.status = OLD.status then
    return NEW;
  end if;

  allowed_next := allowed_transitions -> OLD.status::text;

  if allowed_next is null or not (allowed_next ? NEW.status::text) then
    raise exception
      'Invalid status transition from % to %. Allowed next states: %',
      OLD.status, NEW.status, allowed_next
      using errcode = 'check_violation';
  end if;

  return NEW;
end;
$$;

create trigger check_status_transition
  before update of status on donation_checks
  for each row execute function enforce_status_transition();
```

> **Rollout note:** During the first week of deployment, replace `raise exception` with `raise warning` and log to a monitoring table. Switch to hard blocking after confirming no legitimate transitions are being rejected.

---

### 3.2 Add Signed Handoff Events Table

This is the core of the anti-corruption model. Every time a role actor advances a check, an immutable event record is created. No updates, no deletes — append only.

```sql
-- Migration: 000021_check_events.sql

create table check_events (
  id           uuid        primary key default gen_random_uuid(),
  check_id     uuid        not null references donation_checks(id) on delete restrict,
  event_type   check_status not null,
  actor_id     uuid        not null references users(id),
  actor_role   text        not null,
  notes        text,
  metadata     jsonb       not null default '{}',
  device_info  jsonb,
  created_at   timestamptz not null default now(),

  constraint no_created_event check (event_type != 'created')
);

-- Every check_id + event_type combination must be unique
-- (a check cannot be "collected" twice by different people)
create unique index uix_check_events_check_event
  on check_events (check_id, event_type);

create index idx_check_events_check_id   on check_events (check_id);
create index idx_check_events_actor_id   on check_events (actor_id);
create index idx_check_events_created_at on check_events (created_at desc);
create index idx_check_events_event_type on check_events (event_type);
```

#### Row Level Security for `check_events`

```sql
alter table check_events enable row level security;

-- All authenticated users can read events for any check they can read
create policy select_check_events on check_events
  for select using (auth.role() = 'authenticated');

-- Only service role (Edge Functions) can insert
-- Direct inserts from client are blocked
create policy insert_check_events on check_events
  for insert with check (false);

-- No updates or deletes ever
-- (no policies created for UPDATE/DELETE = implicit deny)
```

#### Trigger: auto-advance check status after event insert

```sql
create or replace function sync_check_status_from_event()
returns trigger language plpgsql security definer as $$
begin
  update donation_checks
  set
    status = NEW.event_type,

    -- Stamp the relevant actor/timestamp columns
    collected_by              = case when NEW.event_type = 'collected'      then NEW.actor_id else collected_by end,
    collected_at              = case when NEW.event_type = 'collected'      then NEW.created_at else collected_at end,

    transferred_to_distributor_at
                              = case when NEW.event_type = 'transferred'    then NEW.created_at else transferred_to_distributor_at end,

    blood_recorded_by         = case when NEW.event_type = 'blood_recorded' then NEW.actor_id else blood_recorded_by end,
    blood_recorded_at         = case when NEW.event_type = 'blood_recorded' then NEW.created_at else blood_recorded_at end,

    distributed_at            = case when NEW.event_type = 'distributed'    then NEW.created_at else distributed_at end,

    patient_served_by         = case when NEW.event_type = 'patient_served' then NEW.actor_id else patient_served_by end,
    patient_served_at         = case when NEW.event_type = 'patient_served' then NEW.created_at else patient_served_at end,
    patient_served_notes      = case when NEW.event_type = 'patient_served'
                                     then coalesce(NEW.notes, patient_served_notes)
                                     else patient_served_notes end,

    updated_at                = now()
  where id = NEW.check_id;

  return NEW;
end;
$$;

create trigger after_check_event_insert
  after insert on check_events
  for each row execute function sync_check_status_from_event();
```

---

### 3.3 Explicit Signature Columns on `donation_checks`

Add the missing actor reference columns so a single row lookup gives the full chain of custody.

```sql
-- Migration: 000022_check_signature_columns.sql

alter table donation_checks
  add column collected_by          uuid references users(id),
  add column collected_at          timestamptz,
  add column patient_served_by     uuid references users(id),
  add column patient_served_at     timestamptz,
  add column patient_served_notes  text;
```

**Full chain of custody on a single check row:**

| Column | Role | Stage |
|---|---|---|
| `created_by` + `created_at` | Receiver | Created |
| `collected_by` + `collected_at` | Receiver | Collected |
| `distributor_id` + `transferred_to_distributor_at` | Receiver | Transferred |
| `blood_recorded_by` + `blood_recorded_at` | Lab | Blood Recorded |
| `distributed_at` | Distributor | Distributed |
| `patient_served_by` + `patient_served_at` | Distributor | Patient Served |

---

### 3.4 Convert Performance Tables to Views

The old `receiver_performance` and `distributor_performance` tables are dropped as write targets. They become views derived from `check_events`. This guarantees they are always consistent with the actual check data.

```sql
-- Migration: 000023_performance_views.sql

-- Back up existing data before dropping (optional but recommended)
create table receiver_performance_archive as select * from receiver_performance;
create table distributor_performance_archive as select * from distributor_performance;

drop table receiver_performance;
drop table distributor_performance;

-- Receiver performance: events where a receiver acted
create view receiver_performance as
  select
    ce.id,
    ce.actor_id                                    as receiver_id,
    dc.donor_id,
    ce.check_id                                    as donation_check_id,
    dc.blood_type_id,
    ce.event_type                                  as action,
    ce.notes,
    ce.device_info,
    ce.created_at,
    ce.created_at                                  as updated_at
  from check_events ce
  join donation_checks dc on dc.id = ce.check_id
  where ce.event_type in ('collected', 'transferred');

-- Distributor performance: events where a distributor acted
create view distributor_performance as
  select
    ce.id,
    ce.actor_id                                    as distributor_id,
    ce.check_id                                    as donation_check_id,
    dc.patient_id,
    dc.blood_type_id,
    ce.event_type                                  as action,
    (ce.metadata->>'quantity')::int                as quantity,
    ce.notes,
    ce.device_info,
    ce.created_at,
    ce.created_at                                  as updated_at
  from check_events ce
  join donation_checks dc on dc.id = ce.check_id
  where ce.event_type in ('distributed', 'patient_served');
```

> **Compatibility note:** The existing frontend API queries (`getReceiversPerformance`, `getDistributorsPerformance`) will continue to work unchanged because the view returns the same column names the old tables had, plus the new `device_info` column.

---

### 3.5 Anti-Corruption Views for Dashboard

```sql
-- Migration: 000024_lifecycle_views.sql

-- Checks created but not yet collected by any receiver
create view pending_collection as
  select
    dc.*,
    u.full_name   as created_by_name,
    now() - dc.created_at as age
  from donation_checks dc
  join users u on u.id = dc.created_by
  where dc.status = 'created';

-- Checks collected by receiver but not yet transferred to a distributor
create view pending_transfer as
  select
    dc.*,
    u.full_name   as collected_by_name,
    now() - dc.collected_at as age_since_collection
  from donation_checks dc
  join users u on u.id = dc.collected_by
  where dc.status = 'collected';

-- Checks distributed but patient delivery not yet confirmed
create view pending_patient_service as
  select
    dc.*,
    dist.full_name as distributor_name,
    p.full_name    as patient_name,
    p.department,
    now() - dc.distributed_at as age_since_distribution
  from donation_checks dc
  left join users dist on dist.id = dc.distributor_id
  left join patients p  on p.id   = dc.patient_id
  where dc.status in ('blood_recorded', 'distributed');

-- Stale checks: in 'created' status for more than 24 hours
create view stale_checks as
  select
    dc.*,
    u.full_name   as created_by_name,
    now() - dc.created_at as age,
    extract(epoch from (now() - dc.created_at)) / 3600 as hours_stale
  from donation_checks dc
  join users u on u.id = dc.created_by
  where dc.status = 'created'
    and dc.created_at < now() - interval '24 hours'
  order by dc.created_at asc;

-- Full chain of custody summary per check (used for reports page)
create view check_custody_summary as
  select
    dc.id,
    dc.serial,
    dc.status,
    dc.created_at,

    receiver.full_name            as receiver_name,
    collector.full_name           as collector_name,
    dc.collected_at,

    distributor.full_name         as distributor_name,
    dc.transferred_to_distributor_at,

    lab_user.full_name            as lab_name,
    dc.blood_recorded_at,

    dc.distributed_at,

    server.full_name              as patient_server_name,
    dc.patient_served_at,
    dc.patient_served_notes,

    donor.full_name               as donor_name,
    patient.full_name             as patient_name,
    patient.department,

    bt.code                       as blood_type_code,
    bt.is_rare                    as blood_type_is_rare

  from donation_checks dc
  left join users receiver    on receiver.id    = dc.created_by
  left join users collector   on collector.id   = dc.collected_by
  left join users distributor on distributor.id = dc.distributor_id
  left join users lab_user    on lab_user.id    = dc.blood_recorded_by
  left join users server      on server.id      = dc.patient_served_by
  left join donors donor      on donor.id       = dc.donor_id
  left join patients patient  on patient.id     = dc.patient_id
  left join blood_types bt    on bt.id          = dc.blood_type_id;
```

---

### 3.6 Migration Strategy

Run in this exact order to avoid data loss or constraint violations.

| Step | Action | Rollback if fails |
|---|---|---|
| 1 | Add nullable new columns to `donation_checks` | `alter table ... drop column` |
| 2 | Create `check_status` enum | `drop type check_status` |
| 3 | Deploy trigger as WARN mode (logs only) | Remove trigger |
| 4 | Backfill `check_events` from existing timestamp columns | Truncate `check_events` |
| 5 | Run integrity check: all checks have events matching their status | Fix stragglers manually |
| 6 | Switch trigger to BLOCK mode | Revert to WARN |
| 7 | Alter `donation_checks.status` to use the enum type | Revert column type |
| 8 | Drop `receiver_performance` and `distributor_performance` tables | Restore from archive |
| 9 | Create views | `drop view` |
| 10 | Add NOT NULL constraints on new columns where appropriate | `alter column ... drop not null` |
| 11 | Update RLS policies | Restore old policies |

**Backfill script for `check_events` (Step 4):**

```sql
-- Insert 'collected' events for all checks past 'created' that have no collected event
insert into check_events (check_id, event_type, actor_id, actor_role, notes, created_at)
  select
    dc.id,
    'collected',
    dc.created_by,
    'receiver',
    'Backfilled during v3 migration',
    coalesce(dc.transferred_to_distributor_at, dc.created_at + interval '1 minute')
  from donation_checks dc
  where dc.status not in ('created')
    and not exists (
      select 1 from check_events ce
      where ce.check_id = dc.id and ce.event_type = 'collected'
    );

-- Insert 'transferred' events
insert into check_events (check_id, event_type, actor_id, actor_role, notes, created_at)
  select
    dc.id, 'transferred', dc.created_by, 'receiver',
    'Backfilled during v3 migration',
    dc.transferred_to_distributor_at
  from donation_checks dc
  where dc.transferred_to_distributor_at is not null
    and not exists (
      select 1 from check_events ce
      where ce.check_id = dc.id and ce.event_type = 'transferred'
    );

-- Insert 'blood_recorded' events
insert into check_events (check_id, event_type, actor_id, actor_role, notes, created_at)
  select
    dc.id, 'blood_recorded', dc.blood_recorded_by, 'lab',
    'Backfilled during v3 migration',
    dc.blood_recorded_at
  from donation_checks dc
  where dc.blood_recorded_at is not null
    and dc.blood_recorded_by is not null
    and not exists (
      select 1 from check_events ce
      where ce.check_id = dc.id and ce.event_type = 'blood_recorded'
    );

-- Insert 'distributed' events
insert into check_events (check_id, event_type, actor_id, actor_role, notes, created_at)
  select
    dc.id, 'distributed', dc.distributor_id, 'distributor',
    'Backfilled during v3 migration',
    dc.distributed_at
  from donation_checks dc
  where dc.distributed_at is not null
    and dc.distributor_id is not null
    and not exists (
      select 1 from check_events ce
      where ce.check_id = dc.id and ce.event_type = 'distributed'
    );
```

---

## 4. Phase 2 — Mobile App API Layer

### 4.1 Edge Functions

All status mutations from mobile app clients go through Edge Functions. Direct `UPDATE` on `donation_checks` is blocked for non-admin roles. Edge Functions use the service role key internally.

#### `POST /functions/v1/collect-check`

**Actor:** Receiver role  
**Advances:** `created → collected`

```typescript
// supabase/functions/collect-check/index.ts

import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const { check_id, notes, device_info } = await req.json()

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } }
  )

  // Get the calling user from their JWT
  const authHeader = req.headers.get('Authorization')!
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // Verify role
  const { data: roles } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', user.id)
  
  const roleNames = roles?.flatMap((r: any) => r.roles?.name) ?? []
  if (!roleNames.includes('receiver') && !roleNames.includes('admin')) {
    return new Response(JSON.stringify({ error: 'Forbidden: receiver role required' }), { status: 403 })
  }

  // Verify check is in 'created' status
  const { data: check } = await supabase
    .from('donation_checks')
    .select('id, status')
    .eq('id', check_id)
    .single()

  if (!check || check.status !== 'created') {
    return new Response(
      JSON.stringify({ error: `Check must be in 'created' status, currently: ${check?.status}` }),
      { status: 422 }
    )
  }

  // Insert event — trigger will advance the status automatically
  const { data: event, error: eventError } = await supabase
    .from('check_events')
    .insert({
      check_id,
      event_type: 'collected',
      actor_id: user.id,
      actor_role: 'receiver',
      notes,
      device_info
    })
    .select()
    .single()

  if (eventError) {
    return new Response(JSON.stringify({ error: eventError.message }), { status: 500 })
  }

  // Return updated check
  const { data: updatedCheck } = await supabase
    .from('donation_checks')
    .select('*, donors(*), patients(*), blood_types(*)')
    .eq('id', check_id)
    .single()

  return new Response(JSON.stringify({ check: updatedCheck, event }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
```

#### `POST /functions/v1/transfer-check`

**Actor:** Receiver role  
**Advances:** `collected → transferred`

```typescript
// Key validation logic (same shell as collect-check):
// - Caller must have 'receiver' role
// - check.status must be 'collected'
// - distributor_id must reference a user with 'distributor' role
// - Insert event_type = 'transferred'
// - Also update donation_checks.distributor_id = distributor_id from request body
```

Request body:
```json
{
  "check_id": "uuid",
  "distributor_id": "uuid",
  "notes": "optional",
  "device_info": { "platform": "ios", "version": "1.0.0" }
}
```

#### `POST /functions/v1/record-blood`

**Actor:** Lab role  
**Advances:** `transferred → blood_recorded`

```typescript
// Key validation:
// - Caller must have 'lab' role
// - check.status must be 'transferred'
// - blood_type_id must reference a valid blood_types row
// - Insert event_type = 'blood_recorded'
// - Also update donation_checks.blood_type_id = blood_type_id from request body
```

Request body:
```json
{
  "check_id": "uuid",
  "blood_type_id": 1,
  "notes": "Lab notes",
  "device_info": {}
}
```

#### `POST /functions/v1/distribute-check`

**Actor:** Distributor role  
**Advances:** `blood_recorded → distributed`

Request body:
```json
{
  "check_id": "uuid",
  "notes": "optional",
  "device_info": {}
}
```

#### `POST /functions/v1/serve-patient`

**Actor:** Distributor role  
**Advances:** `distributed → patient_served`  
**This is the critical anti-corruption event.**

```typescript
// Key validation:
// - Caller must have 'distributor' role
// - check.status must be 'distributed'
// - check.distributor_id must equal auth.uid() (distributor can only close their own checks)
// - patient_id must match check.patient_id (cannot reassign patient at this stage)
// - notes are required (distributor must write delivery confirmation)
// - Insert event_type = 'patient_served' with metadata including patient confirmation details
```

Request body:
```json
{
  "check_id": "uuid",
  "notes": "Patient confirmed receipt. Ward 3, Bed 12.",
  "metadata": {
    "patient_confirmed": true,
    "ward": "3",
    "nurse_name": "optional"
  },
  "device_info": { "platform": "android", "version": "1.0.0", "device_id": "abc123" }
}
```

---

### 4.2 RLS Policy Updates

Remove direct update access from non-admin roles. All mutations go through Edge Functions.

```sql
-- Migration: 000025_rls_harden_checks.sql

-- Drop the broad update policy
drop policy update_checks on donation_checks;

-- Admin can still update directly (for corrections)
create policy update_checks_admin on donation_checks
  for update using (user_has_role('admin'))
  with check (user_has_role('admin'));

-- Insert remains for receivers creating new checks from the admin dashboard
-- (this path does not use Edge Functions)
-- The existing insert_checks policy is unchanged

-- check_events: block all direct inserts from non-service-role
-- (already handled by the policy created in Phase 1)
```

---

## 5. Phase 3 — Dashboard Enhancements

### 3.1 Check Lifecycle Dashboard

Add a dedicated lifecycle section to the existing Dashboard page (or a new `/lifecycle` route).

#### New KPI Cards

| Card Title | Query source | Accent | Alert threshold |
|---|---|---|---|
| Awaiting Collection | `count(*) from pending_collection` | coral | > 0 |
| Awaiting Transfer | `count(*) from pending_transfer` | amber | > 0 |
| Awaiting Patient Service | `count(*) from pending_patient_service` | indigo | > 0 |
| Stale Checks (>24h) | `count(*) from stale_checks` | error | > 0 |
| Completed Today | existing monthly query with today filter | teal | — |

#### New Component: `CheckLifecycleFunnel`

A horizontal `FunnelChart` (Recharts) showing volume at each stage. When one stage has significantly more checks than the next, the funnel shape makes the bottleneck visually obvious. Placed between the KPI grid and the existing analytics section.

```
[created: 45] → [collected: 38] → [transferred: 31] → [blood_recorded: 28] → [distributed: 22] → [patient_served: 20] → [completed: 18]
```

#### New Component: `StaleChecksAlert`

Appears only when `stale_checks` count > 0. A red-bordered warning card listing the top 5 stale checks with their age and the receiver who created them, with a direct link to the filtered checks page (`/checks?status=created&sort=age_desc`).

---

### 3.2 Enhanced Check Detail Page

#### Replace `CheckAuditTrail` with `CheckEventLog`

The existing `CheckAuditTrail` queries the `activities` table which is often empty. Replace it with a component that queries `check_events` directly — this table is guaranteed to have data for every lifecycle step.

**Component: `src/features/checks/components/check-event-log.tsx`**

Each event row shows:
- Stage badge (colored by status)
- Actor full name + role
- Timestamp (absolute + relative)
- Device info summary (platform, app version)
- Notes (if present)
- Event ID (last 8 chars) — visible proof the record is database-generated

#### Update `CheckTimeline`

Add the two new stages (`collected`, `patient_served`) to the 5-step timeline. The timeline becomes 7 steps. On mobile (the main consumer), render as a vertical stepper instead of horizontal to avoid overflow.

#### Add "Chain of Custody" section

A compact read-only table showing the complete handoff chain:

```
Stage            | Actor          | Role        | Timestamp           | Device
-----------------|----------------|-------------|---------------------|--------
Created          | Jane Foster    | Receiver    | Jun 10 2026 09:12   | —
Collected        | Jane Foster    | Receiver    | Jun 10 2026 09:15   | iOS 1.0
Transferred      | Jane Foster    | Receiver    | Jun 10 2026 10:30   | iOS 1.0
Blood Recorded   | Lab User       | Lab         | Jun 10 2026 14:22   | Web
Distributed      | Sam Patel      | Distributor | Jun 11 2026 08:00   | Android 1.0
Patient Served   | Sam Patel      | Distributor | Jun 11 2026 08:47   | Android 1.0
```

---

### 3.3 Check List Page Enhancements

#### New filter: "Bottleneck Stage"

Replace the existing "Filter Status" select with an updated one that includes the two new statuses. Add a visual grouping: the first group is "Active Stages" (all except completed), the second is "Completed."

#### New column: "Time in Stage"

Computed client-side from the check's `updated_at` vs now. Shows as a compact relative time (`2d`, `4h`, `15m`). Color-coded:
- Green: < 4 hours
- Amber: 4–24 hours
- Red: > 24 hours (stale)

#### New URL filter support

Add `?bottleneck=true` URL param that pre-filters to checks in `created`, `collected`, or `distributed` status (the three stages where checks are most commonly stuck). The admin can bookmark this view.

---

## 6. Phase 4 — Frontend Code Changes

### 4.1 API Layer Changes

#### New file: `src/features/checks/api/check-events-api.ts`

```typescript
import { supabase } from '@/lib/supabase'

export interface CheckEvent {
  id: string
  check_id: string
  event_type: string
  actor_id: string
  actor_role: string
  notes: string | null
  metadata: Record<string, unknown>
  device_info: Record<string, unknown> | null
  created_at: string
  actor?: { full_name: string | null; username: string }
}

export async function fetchCheckEvents(checkId: string): Promise<CheckEvent[]> {
  const { data, error } = await supabase
    .from('check_events')
    .select('*, actor:users(full_name, username)')
    .eq('check_id', checkId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as CheckEvent[]
}

// Called from admin dashboard — uses direct Supabase insert
// Mobile app calls the Edge Functions instead
export async function createCheckEvent(
  checkId: string,
  eventType: string,
  actorId: string,
  actorRole: string,
  notes?: string,
  metadata?: Record<string, unknown>
): Promise<CheckEvent> {
  const { data, error } = await supabase
    .from('check_events')
    .insert({ check_id: checkId, event_type: eventType, actor_id: actorId, actor_role: actorRole, notes, metadata })
    .select()
    .single()

  if (error) throw error
  return data as CheckEvent
}
```

#### Updated: `src/features/checks/api/checks-api.ts`

Update `fetchCheck` and `fetchChecks` select strings to include the two new columns:

```typescript
// Add to the select string:
// collected_by_user:users!donation_checks_collected_by_fkey(full_name, username),
// patient_server:users!donation_checks_patient_served_by_fkey(full_name, username)
```

#### New hook: `src/features/checks/hooks/use-check-events.ts`

```typescript
import { useQuery } from '@tanstack/react-query'
import { fetchCheckEvents } from '@/features/checks/api/check-events-api'

export function useCheckEvents(checkId: string) {
  return useQuery({
    queryKey: ['checks', checkId, 'events'],
    queryFn: () => fetchCheckEvents(checkId),
    enabled: !!checkId,
  })
}
```

#### Updated: `src/features/checks/hooks/use-check-status-actions.ts`

Add handlers for the two new stages:

```typescript
const handleCollect = () =>
  runAction({ status: 'collected', collected_by: currentUser?.id, collected_at: new Date().toISOString() })

const handleServePatient = (notes: string) =>
  runAction({ status: 'patient_served', patient_served_by: currentUser?.id, patient_served_at: new Date().toISOString(), patient_served_notes: notes })
```

---

### 4.2 New Constants

#### Updated: `src/constants/check-statuses.ts`

```typescript
export const CHECK_STATUSES = [
  { value: 'all',            label: 'All Statuses' },
  { value: 'created',        label: 'Created' },
  { value: 'collected',      label: 'Collected' },
  { value: 'transferred',    label: 'Transferred' },
  { value: 'blood_recorded', label: 'Blood Recorded' },
  { value: 'distributed',    label: 'Distributed' },
  { value: 'patient_served', label: 'Patient Served' },
  { value: 'completed',      label: 'Completed' },
] as const
```

#### Updated: `src/lib/utils.ts` — `CHECK_STATUSES` map

```typescript
export const CHECK_STATUSES: Record<string, { label: string; color: string }> = {
  created:        { label: 'Created',        color: 'bg-coral-soft text-coral-deep' },
  collected:      { label: 'Collected',      color: 'bg-cyan-soft text-cyan-deep' },
  transferred:    { label: 'Transferred',    color: 'bg-indigo-soft text-indigo-deep' },
  blood_recorded: { label: 'Blood Recorded', color: 'bg-teal-soft text-teal-deep' },
  distributed:    { label: 'Distributed',    color: 'bg-amber-soft text-amber-deep' },
  patient_served: { label: 'Patient Served', color: 'bg-violet-soft text-violet' },
  completed:      { label: 'Completed',      color: 'bg-canvas-soft-2 text-ink' },
}
```

#### Updated: `src/features/checks/constants/kanban-statuses.ts`

Add `collected` and `patient_served` to the kanban column definitions.

#### Updated: `src/types/database.ts`

```typescript
export interface DonationCheck {
  // ... existing fields ...
  collected_by:           string | null
  collected_at:           string | null
  patient_served_by:      string | null
  patient_served_at:      string | null
  patient_served_notes:   string | null
}

export interface CheckWithRelations extends DonationCheck {
  // ... existing joins ...
  collected_by_user:   User | null
  patient_server:      User | null
}
```

---

### 4.3 New Dashboard API

#### Updated: `src/features/dashboard/api/dashboard-api.ts`

Add four new fetch functions:

```typescript
export async function fetchPendingCollection() {
  const { count } = await supabase
    .from('pending_collection')
    .select('*', { count: 'exact', head: true })
  return count ?? 0
}

export async function fetchPendingTransfer() {
  const { count } = await supabase
    .from('pending_transfer')
    .select('*', { count: 'exact', head: true })
  return count ?? 0
}

export async function fetchPendingPatientService() {
  const { count } = await supabase
    .from('pending_patient_service')
    .select('*', { count: 'exact', head: true })
  return count ?? 0
}

export async function fetchStaleChecks() {
  const { data, count } = await supabase
    .from('stale_checks')
    .select('id, serial, created_by_name, age', { count: 'exact' })
    .limit(5)
  return { count: count ?? 0, items: data ?? [] }
}

export async function fetchLifecycleCounts() {
  // Returns count per status — used for funnel chart
  const { data } = await supabase
    .from('donation_checks')
    .select('status')
  
  if (!data) return []
  const counts: Record<string, number> = {}
  for (const row of data) {
    counts[row.status] = (counts[row.status] ?? 0) + 1
  }
  return Object.entries(counts).map(([status, count]) => ({ status, count }))
}
```

#### Updated: `src/features/dashboard/hooks/use-dashboard.ts`

Add corresponding hooks for each new API function.

---

## 7. Phase 5 — Integrity & Reporting

### 5.1 Integrity Report Function

A SQL function that returns a complete integrity report for any date range. Callable from a new admin `/reports` page or exportable as CSV.

```sql
-- Migration: 000026_integrity_report.sql

create or replace function report_check_integrity(
  from_date timestamptz,
  to_date   timestamptz
)
returns table (
  check_id              uuid,
  serial                text,
  status                check_status,
  donor_name            text,
  receiver_name         text,
  distributor_name      text,
  patient_name          text,
  blood_type            text,
  created_at            timestamptz,
  age_in_current_stage  interval,
  missing_events        text[],
  is_complete           boolean
)
language sql stable as $$
  select
    dc.id,
    dc.serial,
    dc.status,
    donor.full_name,
    receiver.full_name,
    distributor.full_name,
    patient.full_name,
    bt.code,
    dc.created_at,
    now() - dc.updated_at,

    -- Detect which expected events are missing given the current status
    array_remove(array[
      case when dc.status != 'created'
            and not exists (select 1 from check_events ce where ce.check_id = dc.id and ce.event_type = 'collected')
           then 'collected' end,
      case when dc.status in ('transferred','blood_recorded','distributed','patient_served','completed')
            and not exists (select 1 from check_events ce where ce.check_id = dc.id and ce.event_type = 'transferred')
           then 'transferred' end,
      case when dc.status in ('distributed','patient_served','completed')
            and not exists (select 1 from check_events ce where ce.check_id = dc.id and ce.event_type = 'distributed')
           then 'distributed' end,
      case when dc.status in ('patient_served','completed')
            and not exists (select 1 from check_events ce where ce.check_id = dc.id and ce.event_type = 'patient_served')
           then 'patient_served' end
    ], null),

    dc.status = 'completed'

  from donation_checks dc
  left join users     receiver    on receiver.id    = dc.created_by
  left join users     distributor on distributor.id = dc.distributor_id
  left join donors    donor       on donor.id       = dc.donor_id
  left join patients  patient     on patient.id     = dc.patient_id
  left join blood_types bt        on bt.id          = dc.blood_type_id
  where dc.created_at between from_date and to_date
  order by dc.created_at desc;
$$;
```

---

### 5.2 Materialized View for Performance

Once event volume grows to thousands of rows, the lifecycle funnel queries will become slow. Add a materialized view refreshed on a schedule.

```sql
-- Migration: 000027_materialized_lifecycle.sql

create materialized view check_lifecycle_summary as
  select
    status,
    count(*)                                    as total,
    count(*) filter (where created_at >= now() - interval '24 hours') as last_24h,
    count(*) filter (where created_at >= now() - interval '7 days')   as last_7d,
    avg(extract(epoch from (now() - updated_at))) / 3600              as avg_hours_in_stage
  from donation_checks
  group by status;

create unique index on check_lifecycle_summary (status);

-- Refresh function (called by pg_cron every 15 minutes)
create or replace function refresh_lifecycle_summary()
returns void language sql security definer as $$
  refresh materialized view concurrently check_lifecycle_summary;
$$;
```

If `pg_cron` is enabled on the Supabase project:

```sql
select cron.schedule(
  'refresh-lifecycle-summary',
  '*/15 * * * *',
  'select refresh_lifecycle_summary()'
);
```

---

## 8. Execution Order

Run phases in sequence. Do not start Phase 2 until Phase 1 is deployed and validated in production.

| Week | Work | Owner |
|---|---|---|
| **Week 1** | Write all migrations. Deploy to staging. Run backfill script. Validate all existing checks have correct events. | Backend |
| **Week 1** | Update `src/types/database.ts`, `check-statuses.ts`, `utils.ts` constants | Frontend |
| **Week 2** | Deploy migrations to production (trigger in WARN mode) | Backend + DevOps |
| **Week 2** | Monitor WARN logs for 5 days. Fix any legitimate transitions being flagged | Backend |
| **Week 3** | Switch trigger to BLOCK mode. Drop old performance tables. Create views. | Backend |
| **Week 3** | Build and deploy all five Edge Functions | Backend |
| **Week 3** | Update admin dashboard API layer and hooks. No visible UI changes yet. | Frontend |
| **Week 4** | Build `CheckEventLog`, update `CheckTimeline` (7 stages), add "Chain of Custody" section | Frontend |
| **Week 4** | Build `CheckLifecycleFunnel`, `StaleChecksAlert`, new lifecycle KPI cards | Frontend |
| **Week 4** | Update check list filters and columns (time in stage, bottleneck filter) | Frontend |
| **Week 5** | Mobile app team builds against Edge Functions (parallel track) | Mobile |
| **Week 5** | Run `report_check_integrity()` across all historical data. Review output with stakeholders. | All |
| **Week 6** | Buffer for fixes, edge cases, load testing | All |

---

## 9. File Change Manifest

### New files

| Path | Type | Purpose |
|---|---|---|
| `supabase/migrations/000020_check_status_enum.sql` | SQL | Enum type + column alteration |
| `supabase/migrations/000021_check_events.sql` | SQL | Events table + RLS + triggers |
| `supabase/migrations/000022_check_signature_columns.sql` | SQL | New actor columns on checks |
| `supabase/migrations/000023_performance_views.sql` | SQL | Replace tables with views |
| `supabase/migrations/000024_lifecycle_views.sql` | SQL | Anti-corruption views |
| `supabase/migrations/000025_rls_harden_checks.sql` | SQL | Remove direct update access |
| `supabase/migrations/000026_integrity_report.sql` | SQL | Report function |
| `supabase/migrations/000027_materialized_lifecycle.sql` | SQL | Materialized summary view |
| `supabase/functions/collect-check/index.ts` | Edge Function | Receiver collects check |
| `supabase/functions/transfer-check/index.ts` | Edge Function | Receiver transfers to distributor |
| `supabase/functions/record-blood/index.ts` | Edge Function | Lab records blood type |
| `supabase/functions/distribute-check/index.ts` | Edge Function | Distributor marks distributed |
| `supabase/functions/serve-patient/index.ts` | Edge Function | Distributor confirms patient delivery |
| `src/features/checks/api/check-events-api.ts` | TypeScript | API calls for events table |
| `src/features/checks/hooks/use-check-events.ts` | TypeScript | TanStack Query hook |
| `src/features/checks/components/check-event-log.tsx` | React | Event log UI on check detail |
| `src/features/dashboard/components/check-lifecycle-funnel.tsx` | React | Funnel chart component |
| `src/features/dashboard/components/stale-checks-alert.tsx` | React | Alert card for stale checks |

### Modified files

| Path | Change |
|---|---|
| `src/types/database.ts` | Add `collected_by/at`, `patient_served_by/at/notes` to `DonationCheck`; add new join types to `CheckWithRelations` |
| `src/constants/check-statuses.ts` | Add `collected` and `patient_served` |
| `src/lib/utils.ts` | Add color configs for two new statuses |
| `src/features/checks/constants/kanban-statuses.ts` | Add two new statuses |
| `src/features/checks/api/checks-api.ts` | Extend select strings for new join columns |
| `src/features/checks/hooks/use-check-status-actions.ts` | Add `handleCollect` and `handleServePatient` |
| `src/features/checks/components/check-status-actions.tsx` | Add UI for two new action stages |
| `src/features/checks/components/check-timeline.tsx` | Expand from 5 to 7 stages |
| `src/features/checks/pages/check-detail-page.tsx` | Add `CheckEventLog`, chain of custody section |
| `src/features/checks/pages/checks-page.tsx` | Add bottleneck filter, time-in-stage column |
| `src/features/dashboard/api/dashboard-api.ts` | Add 5 new fetch functions |
| `src/features/dashboard/hooks/use-dashboard.ts` | Add 5 new hooks |
| `src/features/dashboard/pages/dashboard-page.tsx` | Add lifecycle section with funnel and stale alert |

---

*End of V3 Enhancement Plan*
