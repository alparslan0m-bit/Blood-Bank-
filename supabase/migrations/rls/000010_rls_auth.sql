-- Row Level Securityy for authentication tables: users and user_roles

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
