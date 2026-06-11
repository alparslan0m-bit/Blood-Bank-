-- Row Level Security for distributor_performance table

alter table distributor_performance enable row level security;
create policy select_distributor_performance on distributor_performance for select using (auth.role() = 'authenticated');
create policy insert_distributor_performance on distributor_performance for insert with check (user_has_role('admin') or user_has_role('distributor'));
create policy update_distributor_performance on distributor_performance for update using (user_has_role('admin')) with check (user_has_role('admin'));
