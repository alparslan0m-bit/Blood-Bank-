-- Donation checks and check images tables

create sequence donation_check_serial_seq minvalue 1;

create function next_check_serial() returns text language sql stable as $$
  select format('BD-%s-%s', to_char(now(), 'YYYY'), lpad(nextval('donation_check_serial_seq')::text, 6, '0'));
$$;

create table donation_checks (
  id uuid primary key default gen_random_uuid(),
  serial text not null unique default next_check_serial(),
  status text not null default 'created',
  donor_id uuid not null references donors(id) on delete restrict,
  patient_id uuid references patients(id) on delete set null,
  blood_type_id int references blood_types(id),
  created_by uuid not null references users(id) on delete restrict,
  distributor_id uuid references users(id) on delete set null,
  transferred_to_distributor_at timestamptz,
  distributed_at timestamptz,
  blood_recorded_by uuid references users(id) on delete set null,
  blood_recorded_at timestamptz,
  check_images jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
