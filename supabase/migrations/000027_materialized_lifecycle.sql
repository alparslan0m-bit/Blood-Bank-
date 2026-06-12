-- V3: Materialized lifecycle summary for dashboard performance

create materialized view check_lifecycle_summary as
  select
    status,
    count(*)                                                          as total,
    count(*) filter (where created_at >= now() - interval '24 hours') as last_24h,
    count(*) filter (where created_at >= now() - interval '7 days') as last_7d,
    avg(extract(epoch from (now() - updated_at))) / 3600              as avg_hours_in_stage
  from donation_checks
  group by status;

create unique index uix_check_lifecycle_summary_status on check_lifecycle_summary (status);

create or replace function refresh_lifecycle_summary()
returns void language sql security definer as $$
  refresh materialized view concurrently check_lifecycle_summary;
$$;
