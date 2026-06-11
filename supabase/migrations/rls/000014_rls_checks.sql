-- Row Level Security for donation checks table

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
