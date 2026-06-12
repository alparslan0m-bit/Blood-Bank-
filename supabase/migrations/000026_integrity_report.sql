-- V3: Integrity report function for admin auditing

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
      case when dc.status in ('transferred','blood_recorded','patient_served')
            and not exists (select 1 from check_events ce where ce.check_id = dc.id and ce.event_type = 'transferred')
           then 'transferred' end,
      case when dc.status in ('blood_recorded','patient_served')
            and not exists (select 1 from check_events ce where ce.check_id = dc.id and ce.event_type = 'blood_recorded')
           then 'blood_recorded' end,
      case when dc.status = 'patient_served'
            and not exists (select 1 from check_events ce where ce.check_id = dc.id and ce.event_type = 'patient_served')
           then 'patient_served' end
    ], null),

    dc.status = 'patient_served'

  from donation_checks dc
  left join users     receiver    on receiver.id    = dc.created_by
  left join users     distributor on distributor.id = dc.distributor_id
  left join donors    donor       on donor.id       = dc.donor_id
  left join patients  patient     on patient.id     = dc.patient_id
  left join blood_types bt        on bt.id          = dc.blood_type_id
  where dc.created_at between from_date and to_date
  order by dc.created_at desc;
$$;
