-- V3: Chain-of-custody signature columns (patient served)

alter table donation_checks
  add column if not exists patient_served_by    uuid references users(id),
  add column if not exists patient_served_at    timestamptz,
  add column if not exists patient_served_notes text;
