-- Row Level Security for blood_types table

alter table blood_types enable row level security;
create policy select_blood_types on blood_types for select using (auth.role() = 'authenticated');
create policy modify_blood_types on blood_types for all using (user_has_role('admin')) with check (user_has_role('admin'));
