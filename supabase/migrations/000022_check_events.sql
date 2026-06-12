-- V3: Append-only signed handoff events

create table check_events (
  id           uuid         primary key default gen_random_uuid(),
  check_id     uuid         not null references donation_checks(id) on delete restrict,
  event_type   check_status not null,
  actor_id     uuid         not null references users(id),
  actor_role   text         not null,
  notes        text,
  metadata     jsonb        not null default '{}',
  device_info  jsonb,
  created_at   timestamptz  not null default now(),

  constraint no_created_event check (event_type != 'created')
);

create unique index uix_check_events_check_event
  on check_events (check_id, event_type);

create index idx_check_events_check_id   on check_events (check_id);
create index idx_check_events_actor_id   on check_events (actor_id);
create index idx_check_events_created_at on check_events (created_at desc);
create index idx_check_events_event_type on check_events (event_type);

alter table check_events enable row level security;

create policy select_check_events on check_events
  for select using (auth.role() = 'authenticated');

create policy insert_check_events_admin on check_events
  for insert with check (user_has_role('admin'));

create or replace function sync_check_status_from_event()
returns trigger language plpgsql security definer as $$
declare
  cur_status   check_status;
  cur_rank     int;
  new_rank     int;
  status_order constant text[] := array[
    'created', 'transferred', 'blood_recorded', 'patient_served'
  ];
begin
  select status into cur_status
  from donation_checks
  where id = NEW.check_id;

  cur_rank := array_position(status_order, cur_status::text);
  new_rank := array_position(status_order, NEW.event_type::text);

  update donation_checks
  set
    -- Only advance status forward (live handoffs). Backfill inserts for
    -- earlier stages stamp custody columns without regressing status.
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

create trigger after_check_event_insert
  after insert on check_events
  for each row execute function sync_check_status_from_event();

-- Backfill events from existing timestamp columns
insert into check_events (check_id, event_type, actor_id, actor_role, notes, metadata, created_at)
  select
    dc.id,
    'transferred',
    dc.created_by,
    'receiver',
    'Backfilled during v3 migration',
    jsonb_build_object('distributor_id', dc.distributor_id),
    dc.transferred_to_distributor_at
  from donation_checks dc
  where dc.transferred_to_distributor_at is not null
    and not exists (
      select 1 from check_events ce
      where ce.check_id = dc.id and ce.event_type = 'transferred'
    );

insert into check_events (check_id, event_type, actor_id, actor_role, notes, metadata, created_at)
  select
    dc.id,
    'blood_recorded',
    dc.blood_recorded_by,
    'lab',
    'Backfilled during v3 migration',
    jsonb_build_object('blood_type_id', dc.blood_type_id),
    dc.blood_recorded_at
  from donation_checks dc
  where dc.blood_recorded_at is not null
    and dc.blood_recorded_by is not null
    and not exists (
      select 1 from check_events ce
      where ce.check_id = dc.id and ce.event_type = 'blood_recorded'
    );

insert into check_events (check_id, event_type, actor_id, actor_role, notes, created_at)
  select
    dc.id,
    'patient_served',
    dc.patient_served_by,
    'distributor',
    coalesce(dc.patient_served_notes, 'Backfilled during v3 migration'),
    dc.patient_served_at
  from donation_checks dc
  where dc.patient_served_at is not null
    and dc.patient_served_by is not null
    and not exists (
      select 1 from check_events ce
      where ce.check_id = dc.id and ce.event_type = 'patient_served'
    );
