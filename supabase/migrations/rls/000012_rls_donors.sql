-- Row Level Security for donors table

alter table donors enable row level security;
create policy select_donors on donors for select using (auth.role() = 'authenticated');
create policy insert_donors on donors for insert with check (user_has_role('receiver') or user_has_role('admin'));
create policy update_donors on donors for update using (user_has_role('admin') or user_has_role('receiver') or user_has_role('lab')) with check (user_has_role('admin') or user_has_role('receiver') or user_has_role('lab'));
