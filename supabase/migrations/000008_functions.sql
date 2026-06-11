-- Utility and reporting functions

create or replace function user_has_role(role_name text) returns boolean language sql stable as $$
  select exists(
    select 1
    from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = auth.uid() and r.name = role_name
  );
$$;

create or replace function report_rare_blood_checks(from_date timestamptz, to_date timestamptz)
returns table(blood_type text, department text, count bigint)
language sql stable as $$
  select
    b.code as blood_type,
    coalesce(p.department, 'Unknown') as department,
    count(*)::bigint
  from donation_checks dc
  join blood_types b on b.id = dc.blood_type_id
  left join patients p on p.id = dc.patient_id
  where dc.created_at between from_date and to_date
    and b.is_rare
  group by b.code, p.department
  order by count desc;
$$;
