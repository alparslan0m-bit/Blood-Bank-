-- Initial seed data: roles and blood types

insert into roles (name, label) values
  ('receiver', 'Receiver'),
  ('lab', 'Lab Staff'),
  ('distributor', 'Distributor'),
  ('admin', 'Admin');

insert into blood_types (code, label, is_rare) values
  ('A+', 'A+', false),
  ('A-', 'A-', false),
  ('B+', 'B+', false),
  ('B-', 'B-', false),
  ('AB+', 'AB+', true),
  ('AB-', 'AB-', true),
  ('O+', 'O+', false),
  ('O-', 'O-', true);
