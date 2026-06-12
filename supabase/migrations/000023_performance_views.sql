-- V3: Replace performance tables with views derived from check_events

create table receiver_performance_archive as
  select * from receiver_performance;

create table distributor_performance_archive as
  select * from distributor_performance;

drop policy if exists select_receiver_performance on receiver_performance;
drop policy if exists insert_receiver_performance on receiver_performance;
drop policy if exists update_receiver_performance on receiver_performance;

drop policy if exists select_distributor_performance on distributor_performance;
drop policy if exists insert_distributor_performance on distributor_performance;
drop policy if exists update_distributor_performance on distributor_performance;

drop table receiver_performance;
drop table distributor_performance;

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
  where ce.event_type = 'patient_served';
