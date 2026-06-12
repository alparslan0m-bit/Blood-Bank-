-- Remove the collected stage: created goes directly to transferred

-- 1. Migrate data
update donation_checks set status = 'created' where status::text = 'collected';
delete from check_events where event_type::text = 'collected';

-- 2. Drop all objects that depend on status / check_status enum
drop materialized view if exists check_lifecycle_summary;
drop function if exists refresh_lifecycle_summary();
drop function if exists report_check_integrity(timestamptz, timestamptz);

drop view if exists pending_collection;
drop view if exists pending_transfer;
drop view if exists pending_patient_service;
drop view if exists stale_checks;
drop view if exists check_custody_summary;
drop view if exists receiver_performance;
drop view if exists distributor_performance;

drop trigger if exists check_status_transition on donation_checks;
drop trigger if exists after_check_event_insert on check_events;

-- Constraints/indexes on check_events.event_type block enum type swap
alter table check_events drop constraint if exists no_created_event;
drop index if exists uix_check_events_check_event;
drop index if exists idx_check_events_event_type;

-- 3. Replace enum without 'collected'
drop type if exists check_status_v2;

create type check_status_v2 as enum (
  'created',
  'transferred',
  'blood_recorded',
  'distributed',
  'patient_served',
  'completed'
);

alter table donation_checks
  alter column status drop default;

alter table donation_checks
  alter column status type check_status_v2
  using status::text::check_status_v2;

alter table donation_checks
  alter column status set default 'created';

alter table check_events
  alter column event_type type check_status_v2
  using event_type::text::check_status_v2;

drop type check_status;
alter type check_status_v2 rename to check_status;

alter table check_events
  add constraint no_created_event check (event_type <> 'created');

create unique index uix_check_events_check_event
  on check_events (check_id, event_type);

create index idx_check_events_event_type on check_events (event_type);

-- 4. Transition rules: created → transferred
create or replace function enforce_status_transition()
returns trigger language plpgsql as $$
declare
  allowed_transitions jsonb := '{
    "created":        ["transferred"],
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

-- 5. Sync trigger without collected columns
create or replace function sync_check_status_from_event()
returns trigger language plpgsql security definer as $$
declare
  cur_status   check_status;
  cur_rank     int;
  new_rank     int;
  status_order constant text[] := array[
    'created', 'transferred', 'blood_recorded',
    'distributed', 'patient_served', 'completed'
  ];
begin
  select status into cur_status
  from donation_checks
  where id = NEW.check_id;

  cur_rank := array_position(status_order, cur_status::text);
  new_rank := array_position(status_order, NEW.event_type::text);

  update donation_checks
  set
    status = case
      when new_rank is not null
       and cur_rank is not null
       and new_rank > cur_rank
      then NEW.event_type
      else status
    end,

    distributor_id  = case when NEW.event_type = 'transferred'
                           then coalesce((NEW.metadata->>'distributor_id')::uuid, distributor_id)
                           else distributor_id end,
    transferred_to_distributor_at
                    = case when NEW.event_type = 'transferred'    then NEW.created_at else transferred_to_distributor_at end,

    blood_type_id   = case when NEW.event_type = 'blood_recorded'
                           then coalesce((NEW.metadata->>'blood_type_id')::int, blood_type_id)
                           else blood_type_id end,
    blood_recorded_by
                    = case when NEW.event_type = 'blood_recorded' then NEW.actor_id else blood_recorded_by end,
    blood_recorded_at
                    = case when NEW.event_type = 'blood_recorded' then NEW.created_at else blood_recorded_at end,

    distributed_at  = case when NEW.event_type = 'distributed'    then NEW.created_at else distributed_at end,

    patient_served_by
                    = case when NEW.event_type = 'patient_served' then NEW.actor_id else patient_served_by end,
    patient_served_at
                    = case when NEW.event_type = 'patient_served' then NEW.created_at else patient_served_at end,
    patient_served_notes
                    = case when NEW.event_type = 'patient_served'
                           then coalesce(NEW.notes, patient_served_notes)
                           else patient_served_notes end,

    updated_at      = now()
  where id = NEW.check_id;

  return NEW;
end;
$$;

create trigger check_status_transition
  before update of status on donation_checks
  for each row execute function enforce_status_transition();

create trigger after_check_event_insert
  after insert on check_events
  for each row execute function sync_check_status_from_event();

-- 6. Drop collected signature columns
alter table donation_checks
  drop column if exists collected_by,
  drop column if exists collected_at;

-- 7. Recreate views
create view receiver_performance
with (security_invoker = true) as
  select
    ce.id,
    ce.actor_id         as receiver_id,
    dc.donor_id,
    ce.check_id         as donation_check_id,
    dc.blood_type_id,
    ce.event_type::text as action,
    ce.notes,
    ce.device_info,
    ce.created_at,
    ce.created_at       as updated_at
  from check_events ce
  join donation_checks dc on dc.id = ce.check_id
  where ce.event_type = 'transferred';

create view distributor_performance
with (security_invoker = true) as
  select
    ce.id,
    ce.actor_id         as distributor_id,
    ce.check_id         as donation_check_id,
    dc.patient_id,
    dc.blood_type_id,
    ce.event_type::text as action,
    (ce.metadata->>'quantity')::int as quantity,
    ce.notes,
    ce.device_info,
    ce.created_at,
    ce.created_at       as updated_at
  from check_events ce
  join donation_checks dc on dc.id = ce.check_id
  where ce.event_type in ('distributed', 'patient_served');

create view pending_transfer
with (security_invoker = true) as
  select
    dc.*,
    u.full_name as created_by_name,
    now() - dc.created_at as age_since_creation
  from donation_checks dc
  join users u on u.id = dc.created_by
  where dc.status = 'created';

create view pending_patient_service
with (security_invoker = true) as
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

create view stale_checks
with (security_invoker = true) as
  select
    dc.*,
    u.full_name as created_by_name,
    now() - dc.created_at as age,
    extract(epoch from (now() - dc.created_at)) / 3600 as hours_stale
  from donation_checks dc
  join users u on u.id = dc.created_by
  where dc.status = 'created'
    and dc.created_at < now() - interval '24 hours'
  order by dc.created_at asc;

create view check_custody_summary
with (security_invoker = true) as
  select
    dc.id,
    dc.serial,
    dc.status,
    dc.created_at,

    receiver.full_name    as receiver_name,
    distributor.full_name as distributor_name,
    dc.transferred_to_distributor_at,

    lab_user.full_name    as lab_name,
    dc.blood_recorded_at,

    dc.distributed_at,

    server.full_name      as patient_server_name,
    dc.patient_served_at,
    dc.patient_served_notes,

    donor.full_name       as donor_name,
    patient.full_name     as patient_name,
    patient.department,

    bt.code               as blood_type_code,
    bt.is_rare            as blood_type_is_rare

  from donation_checks dc
  left join users receiver    on receiver.id    = dc.created_by
  left join users distributor on distributor.id = dc.distributor_id
  left join users lab_user    on lab_user.id    = dc.blood_recorded_by
  left join users server      on server.id      = dc.patient_served_by
  left join donors donor      on donor.id       = dc.donor_id
  left join patients patient  on patient.id     = dc.patient_id
  left join blood_types bt    on bt.id          = dc.blood_type_id;

-- 8. Recreate materialized view and integrity report
create materialized view check_lifecycle_summary as
  select
    status,
    count(*)                                                          as total,
    count(*) filter (where created_at >= now() - interval '24 hours') as last_24h,
    count(*) filter (where created_at >= now() - interval '7 days')   as last_7d,
    avg(extract(epoch from (now() - updated_at))) / 3600              as avg_hours_in_stage
  from donation_checks
  group by status;

create unique index uix_check_lifecycle_summary_status on check_lifecycle_summary (status);

create or replace function refresh_lifecycle_summary()
returns void language sql security definer as $$
  refresh materialized view concurrently check_lifecycle_summary;
$$;

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

    array_remove(array[
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
