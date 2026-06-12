-- V3: Block direct status updates from non-admin roles

drop policy if exists update_checks on donation_checks;

create policy update_checks_admin on donation_checks
  for update using (user_has_role('admin'))
  with check (user_has_role('admin'));
