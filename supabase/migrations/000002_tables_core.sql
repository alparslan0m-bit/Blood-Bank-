-- Core authentication tables: roles and users

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
