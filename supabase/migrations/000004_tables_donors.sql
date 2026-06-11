-- Donors table

create table donors (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  national_id text not null unique,
  phone text not null,
  age int not null,
  gender text not null,
  address text not null,
  blood_type_id int references blood_types(id),
  notes text,
  last_donation_date date,
  total_donations int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
