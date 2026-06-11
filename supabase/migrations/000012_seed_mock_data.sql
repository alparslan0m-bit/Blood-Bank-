-- Mock data for admin dashboard testing

insert into users (id, username, email, full_name, phone, disabled)
values
  ('00000000-0000-0000-0000-000000000001', 'receiver.jane', 'jane.receiver@example.com', 'Jane Foster', '+256700000001', false),
  ('00000000-0000-0000-0000-000000000002', 'receiver.daniel', 'daniel.receiver@example.com', 'Daniel Kim', '+256700000002', false),
  ('00000000-0000-0000-0000-000000000003', 'distributor.maria', 'maria.distributor@example.com', 'Maria Ruiz', '+256700000003', false),
  ('00000000-0000-0000-0000-000000000004', 'distributor.sam', 'sam.distributor@example.com', 'Sam Patel', '+256700000004', false);

insert into user_roles (user_id, role_id)
values
  ('00000000-0000-0000-0000-000000000001', (select id from roles where name = 'receiver')),
  ('00000000-0000-0000-0000-000000000002', (select id from roles where name = 'receiver')),
  ('00000000-0000-0000-0000-000000000003', (select id from roles where name = 'distributor')),
  ('00000000-0000-0000-0000-000000000004', (select id from roles where name = 'distributor'));

insert into donors (id, full_name, national_id, phone, age, gender, address, blood_type_id, notes, last_donation_date, total_donations)
values
  ('10000000-0000-0000-0000-000000000001', 'Amina Hassan', 'DNR-1001', '+201234567890', 34, 'Female', '16 Nile Plaza, Cairo', (select id from blood_types where code='A+'), 'Regular donor with stable health.', '2026-05-24', 7),
  ('10000000-0000-0000-0000-000000000002', 'Omar Nasser', 'DNR-1002', '+201098765432', 41, 'Male', '92 Garden Street, Cairo', (select id from blood_types where code='O-'), 'Rare group donor, high priority.', '2026-05-30', 12);

insert into patients (id, full_name, national_id, phone, department, file_number, address, social_notes, medical_notes)
values
  ('20000000-0000-0000-0000-000000000001', 'Mona Abdel', 'PT-2001', '+201112223334', 'Surgery', 'F-1024', '28 Tahrir Rd, Cairo', 'Family contact available.', 'Requires urgent O- transfusion before surgery.'),
  ('20000000-0000-0000-0000-000000000002', 'Karim Saleh', 'PT-2002', '+201155667788', 'Emergency', 'F-1025', '40 Ramses Ave, Cairo', 'No known allergies.', 'Needs A+ units for trauma care.');

insert into donation_checks (id, donor_id, patient_id, blood_type_id, created_by, distributor_id, status, transferred_to_distributor_at, distributed_at, blood_recorded_by, blood_recorded_at)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', (select id from blood_types where code='A+'), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'distributed', now() - interval '3 days', now() - interval '2 days', '00000000-0000-0000-0000-000000000003', now() - interval '2 days'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', (select id from blood_types where code='O-'), '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'distributed', now() - interval '4 days', now() - interval '3 days', '00000000-0000-0000-0000-000000000004', now() - interval '3 days');

insert into receiver_performance (receiver_id, donor_id, donation_check_id, blood_type_id, action, notes)
values
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', (select id from blood_types where code='A+'), 'Collected donor details', 'Completed first screening and donor intake.'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', (select id from blood_types where code='O-'), 'Validated donor data', 'Reviewed donor history and approved collection.');

insert into distributor_performance (distributor_id, donation_check_id, patient_id, blood_type_id, action, quantity, notes)
values
  ('00000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', (select id from blood_types where code='A+'), 'Delivered blood units', 2, 'Delivered to surgery ward on schedule.'),
  ('00000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', (select id from blood_types where code='O-'), 'Assigned blood pack', 1, 'Delivered to emergency department immediately.');
