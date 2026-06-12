-- V3: Anti-corruption lifecycle views for dashboard monitoring

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
    now() - coalesce(dc.blood_recorded_at, dc.updated_at) as age_since_blood_recorded
  from donation_checks dc
  left join users dist on dist.id = dc.distributor_id
  left join patients p  on p.id   = dc.patient_id
  where dc.status = 'blood_recorded';

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
