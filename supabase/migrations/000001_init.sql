-- Emergency Blood Bank Management System schema

create extension if not exists pgcrypto;

create table roles (
  id serial primary key,
  name text not null unique,
  label text not null
);

create table users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  email text not null unique,
  full_name text,
  phone text,
  disabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table user_roles (
  user_id uuid not null references users(id) on delete cascade,
  role_id int not null references roles(id) on delete cascade,
  primary key(user_id, role_id)
);

create table blood_types (
  id serial primary key,
  code text not null unique,
  label text not null,
  is_rare boolean not null default false
);

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table check_images (
  id uuid primary key default gen_random_uuid(),
  donation_check_id uuid not null references donation_checks(id) on delete cascade,
  file_path text not null,
  type text not null,
  uploaded_at timestamptz not null default now()
);


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

create or replace function user_has_role(role_name text) returns boolean language sql stable as $$
  select exists(
    select 1
    from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name = role_name
  );
$$;

create or replace function report_rare_blood_checks(from_date timestamptz, to_date timestamptz)
returns table(blood_type text, department text, count bigint)
language sql stable as $$
  select
    b.code as blood_type,
    coalesce(p.department, 'Unknown') as department,
    count(*)::bigint
  from donation_checks dc
  join blood_types b on b.id = dc.blood_type_id
  left join patients p on p.id = dc.patient_id
  where dc.created_at between from_date and to_date
    and b.is_rare
  group by b.code, p.department
  order by count desc;
$$;

-- Row level security policies

alter table users enable row level security;
create policy select_users on users for select using (
  auth.role() = 'authenticated' and (user_has_role('admin') or id = auth.uid())
);
create policy insert_users on users for insert with check (user_has_role('admin'));
create policy update_users on users for update using (user_has_role('admin')) with check (user_has_role('admin'));

alter table user_roles enable row level security;
create policy select_user_roles on user_roles for select using (
  auth.role() = 'authenticated' and user_id = auth.uid()
);
create policy manage_user_roles on user_roles for all using (user_has_role('admin')) with check (user_has_role('admin'));

alter table blood_types enable row level security;
create policy select_blood_types on blood_types for select using (auth.role() = 'authenticated');
create policy modify_blood_types on blood_types for all using (user_has_role('admin')) with check (user_has_role('admin'));

alter table donors enable row level security;
create policy select_donors on donors for select using (auth.role() = 'authenticated');
create policy insert_donors on donors for insert with check (user_has_role('receiver') or user_has_role('admin'));
create policy update_donors on donors for update using (user_has_role('admin') or user_has_role('receiver') or user_has_role('lab')) with check (user_has_role('admin') or user_has_role('receiver') or user_has_role('lab'));

alter table patients enable row level security;
create policy select_patients on patients for select using (auth.role() = 'authenticated');
create policy insert_patients on patients for insert with check (user_has_role('distributor') or user_has_role('admin'));
create policy update_patients on patients for update using (user_has_role('distributor') or user_has_role('admin')) with check (user_has_role('distributor') or user_has_role('admin'));

alter table donation_checks enable row level security;
create policy select_checks on donation_checks for select using (auth.role() = 'authenticated');
create policy insert_checks on donation_checks for insert with check (user_has_role('receiver') or user_has_role('admin'));
create policy update_checks on donation_checks for update using (
  user_has_role('admin')
  or user_has_role('receiver')
  or user_has_role('lab')
  or user_has_role('distributor')
) with check (
  user_has_role('admin')
  or user_has_role('receiver')
  or user_has_role('lab')
  or user_has_role('distributor')
);

alter table check_images enable row level security;
create policy select_check_images on check_images for select using (auth.role() = 'authenticated');
create policy insert_check_images on check_images for insert with check (auth.role() = 'authenticated');

alter table notifications enable row level security;
create policy select_notifications on notifications for select using (auth.role() = 'authenticated');
create policy insert_notifications on notifications for insert with check (user_has_role('admin'));
create policy update_notifications on notifications for update using (user_has_role('admin')) with check (user_has_role('admin'));

alter table audit_logs enable row level security;
create policy select_audit_logs on audit_logs for select using (user_has_role('admin'));
create policy insert_audit_logs on audit_logs for insert with check (user_has_role('admin'));

alter table activities enable row level security;
create policy select_activities on activities for select using (user_has_role('admin'));
create policy insert_activities on activities for insert with check (user_has_role('admin'));
