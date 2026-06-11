-- Row Level Security for receiver_performance table

alter table receiver_performance enable row level security;
create policy select_receiver_performance on receiver_performance for select using (auth.role() = 'authenticated');
create policy insert_receiver_performance on receiver_performance for insert with check (user_has_role('admin') or user_has_role('receiver'));
create policy update_receiver_performance on receiver_performance for update using (user_has_role('admin')) with check (user_has_role('admin'));
