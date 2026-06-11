-- Receiver performance tracking table
-- Tracks all receiver activities and related data for performance analysis

create table receiver_performance (
  id uuid primary key default gen_random_uuid(),
  receiver_id uuid not null references users(id) on delete cascade,
  donor_id uuid not null references donors(id) on delete cascade,
  donation_check_id uuid not null references donation_checks(id) on delete cascade,
  blood_type_id int references blood_types(id),
  action text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_receiver_performance_receiver_id on receiver_performance(receiver_id);
create index idx_receiver_performance_created_at on receiver_performance(created_at);
create index idx_receiver_performance_donor_id on receiver_performance(donor_id);
