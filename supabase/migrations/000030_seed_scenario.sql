-- Mock scenario: receiver collected 4 checks, distributor received 3, and served 2

-- Clean up any previous scenario data.
delete from check_events
where check_id in (
  '30000000-0000-0000-0000-000000030001',
  '30000000-0000-0000-0000-000000030002',
  '30000000-0000-0000-0000-000000030003',
  '30000000-0000-0000-0000-000000030004'
)
or actor_id in (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102'
);

delete from donation_checks
where id in (
  '30000000-0000-0000-0000-000000030001',
  '30000000-0000-0000-0000-000000030002',
  '30000000-0000-0000-0000-000000030003',
  '30000000-0000-0000-0000-000000030004'
);

delete from user_roles
where user_id in (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102'
);

delete from users
where id in (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000102'
);

delete from donors
where id in (
  '10000000-0000-0000-0000-000000010001',
  '10000000-0000-0000-0000-000000010002',
  '10000000-0000-0000-0000-000000010003',
  '10000000-0000-0000-0000-000000010004'
);

delete from patients
where id in (
  '20000000-0000-0000-0000-000000020001',
  '20000000-0000-0000-0000-000000020002'
);

-- Insert the receiver and distributor.
insert into users (id, username, email, full_name, phone, disabled)
values
  ('00000000-0000-0000-0000-000000000101', 'receiver.alex', 'alex.receiver@example.com', 'Alex Rivera', '+256700000101', false),
  ('00000000-0000-0000-0000-000000000102', 'distributor.kate', 'kate.distributor@example.com', 'Kate Morgan', '+256700000102', false);

insert into user_roles (user_id, role_id)
values
  ('00000000-0000-0000-0000-000000000101', (select id from roles where name = 'receiver')),
  ('00000000-0000-0000-0000-000000000102', (select id from roles where name = 'distributor'));

-- Insert four donors.
insert into donors (id, full_name, national_id, phone, age, gender, address, blood_type_id, notes, last_donation_date, total_donations)
values
  ('10000000-0000-0000-0000-000000010001', 'Lina Abbas', 'DNR-01001', '+256701000001', 29, 'Female', '12 Market Road', (select id from blood_types where code = 'A+'), 'First-time donor.', null, 0),
  ('10000000-0000-0000-0000-000000010002', 'Tariq Musa', 'DNR-01002', '+256701000002', 36, 'Male', '24 Lakeview Ave', (select id from blood_types where code = 'O-'), 'Available for urgent requests.', '2026-06-01', 4),
  ('10000000-0000-0000-0000-000000010003', 'Nadia Omar', 'DNR-01003', '+256701000003', 27, 'Female', '7 Riverside Blvd', (select id from blood_types where code = 'B+'), 'Healthy donor.', '2026-05-15', 2),
  ('10000000-0000-0000-0000-000000010004', 'Bilal Said', 'DNR-01004', '+256701000004', 42, 'Male', '31 Hill Street', (select id from blood_types where code = 'AB-'), 'Rare group donor.', '2026-05-20', 5);

-- Insert two patients.
insert into patients (id, full_name, national_id, phone, department, file_number, address, social_notes, medical_notes)
values
  ('20000000-0000-0000-0000-000000020001', 'Maya Yusuf', 'PT-02001', '+256702000001', 'Surgery', 'S-1001', '18 Greenway', 'Family notified.', 'Requires A+ blood for scheduled surgery.'),
  ('20000000-0000-0000-0000-000000020002', 'Hassan Khalid', 'PT-02002', '+256702000002', 'Emergency', 'E-1002', '45 Freedom Lane', 'Urgent care required.', 'Needs O- blood for trauma support.');

-- Create four donation checks collected by the receiver.
insert into donation_checks (id, donor_id, patient_id, blood_type_id, created_by, distributor_id, transferred_to_distributor_at, created_at)
values
  ('30000000-0000-0000-0000-000000030001', '10000000-0000-0000-0000-000000010001', '20000000-0000-0000-0000-000000020001', (select id from blood_types where code = 'A+'), '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102', now() - interval '3 days', now() - interval '4 days'),
  ('30000000-0000-0000-0000-000000030002', '10000000-0000-0000-0000-000000010002', '20000000-0000-0000-0000-000000020002', (select id from blood_types where code = 'O-'), '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102', now() - interval '2 days', now() - interval '3 days'),
  ('30000000-0000-0000-0000-000000030003', '10000000-0000-0000-0000-000000010003', '20000000-0000-0000-0000-000000020001', (select id from blood_types where code = 'B+'), '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102', now() - interval '1 day', now() - interval '2 days'),
  ('30000000-0000-0000-0000-000000030004', '10000000-0000-0000-0000-000000010004', null, (select id from blood_types where code = 'AB-'), '00000000-0000-0000-0000-000000000101', null, null, now() - interval '1 day');

-- Add lifecycle events for the three distributed checks.
insert into check_events (check_id, event_type, actor_id, actor_role, notes, metadata, created_at)
values
  ('30000000-0000-0000-0000-000000030001', 'transferred', '00000000-0000-0000-0000-000000000101', 'receiver', 'Transferred to distributor Kate.', jsonb_build_object('distributor_id', '00000000-0000-0000-0000-000000000102'), now() - interval '3 days'),
  ('30000000-0000-0000-0000-000000030002', 'transferred', '00000000-0000-0000-0000-000000000101', 'receiver', 'Transferred to distributor Kate.', jsonb_build_object('distributor_id', '00000000-0000-0000-0000-000000000102'), now() - interval '2 days'),
  ('30000000-0000-0000-0000-000000030003', 'transferred', '00000000-0000-0000-0000-000000000101', 'receiver', 'Transferred to distributor Kate.', jsonb_build_object('distributor_id', '00000000-0000-0000-0000-000000000102'), now() - interval '1 day');

-- The distributor serves two of the three distributed checks.
insert into check_events (check_id, event_type, actor_id, actor_role, notes, created_at)
values
  ('30000000-0000-0000-0000-000000030001', 'blood_recorded', '00000000-0000-0000-0000-000000000102', 'distributor', 'Blood type confirmed before serving.', now() - interval '2 days'),
  ('30000000-0000-0000-0000-000000030001', 'patient_served', '00000000-0000-0000-0000-000000000102', 'distributor', 'Served the patient in surgery.', now() - interval '1 day'),
  ('30000000-0000-0000-0000-000000030002', 'blood_recorded', '00000000-0000-0000-0000-000000000102', 'distributor', 'Blood type confirmed before serving.', now() - interval '1 day'),
  ('30000000-0000-0000-0000-000000030002', 'patient_served', '00000000-0000-0000-0000-000000000102', 'distributor', 'Served the patient in emergency care.', now() - interval '20 hours');
