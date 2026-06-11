-- Patients table

create table patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  national_id text not null,
  phone text not null,
  department text not null,
  file_number text not null,
  address text not null,
  social_notes text,
  medical_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
