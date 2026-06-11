-- Blood types reference table

create table blood_types (
  id serial primary key,
  code text not null unique,
  label text not null,
  is_rare boolean not null default false
);
