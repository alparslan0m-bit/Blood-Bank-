-- Row Level Security for patients table

alter table patients enable row level security;
create policy select_patients on patients for select using (auth.role() = 'authenticated');
create policy insert_patients on patients for insert with check (user_has_role('distributor') or user_has_role('admin'));
create policy update_patients on patients for update using (user_has_role('distributor') or user_has_role('admin')) with check (user_has_role('distributor') or user_has_role('admin'));
