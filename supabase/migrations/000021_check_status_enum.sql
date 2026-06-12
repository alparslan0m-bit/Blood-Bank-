-- V3: Harden check status as enum with transition enforcement

create type check_status as enum (
  'created',
  'transferred',
  'blood_recorded',
  'patient_served'
);

update donation_checks
  set status = 'created'
  where status not in (
    'created', 'transferred', 'blood_recorded', 'patient_served'
  );

alter table donation_checks
  alter column status drop default;

alter table donation_checks
  alter column status type check_status
  using status::check_status;

alter table donation_checks
  alter column status set default 'created';

create or replace function enforce_status_transition()
returns trigger language plpgsql as $$
declare
  allowed_transitions jsonb := '{
    "created":        ["transferred"],
    "transferred":    ["blood_recorded"],
    "blood_recorded": ["patient_served"],
    "patient_served": []
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
