-- Distributor performance tracking table
-- Tracks all distributor activities and related data for performance analysis

create table distributor_performance (
  id uuid primary key default gen_random_uuid(),
  distributor_id uuid not null references users(id) on delete cascade,
  donation_check_id uuid not null references donation_checks(id) on delete cascade,
  patient_id uuid references patients(id) on delete set null,
  blood_type_id int references blood_types(id),
  action text not null,
  quantity int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_distributor_performance_distributor_id on distributor_performance(distributor_id);
create index idx_distributor_performance_created_at on distributor_performance(created_at);
create index idx_distributor_performance_patient_id on distributor_performance(patient_id);
