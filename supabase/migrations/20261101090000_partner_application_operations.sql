begin;
alter table public.partner_applications
 add column if not exists request_id uuid unique,
 add column if not exists request_hash text,
 add column if not exists ip_hash text,
 add column if not exists notification_status text not null default 'pending'
  check (notification_status in ('pending','sending','accepted','failed','unknown','delivered','rejected')),
 add column if not exists notification_attempts integer not null default 0,
 add column if not exists notification_message_id text,
 add column if not exists notification_error text,
 add column if not exists notification_updated_at timestamptz;
create index if not exists partner_applications_ip_created on public.partner_applications(ip_hash,created_at);
grant select on public.partner_countries to anon, authenticated;
create policy partner_countries_read on public.partner_countries for select to anon,authenticated using (true);
grant select on public.partner_applications to authenticated;
create policy partner_applications_admin_read on public.partner_applications for select to authenticated using (public.is_gym_console_admin());
-- Only the server may execute this transactional submission gate. No public write grants.
create or replace function public.submit_partner_application(p_data jsonb, p_request_id uuid, p_hash text, p_ip text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare existing public.partner_applications; result_id uuid;
begin
 perform pg_advisory_xact_lock(78329104);
 select * into existing from public.partner_applications where request_id=p_request_id;
 if found then
  if existing.request_hash <> p_hash then raise exception 'idempotency_conflict'; end if;
  return jsonb_build_object('id',existing.id,'duplicate',true);
 end if;
 if (select count(*) from public.partner_applications where created_at>now()-interval '1 hour')>=100
 or (select count(*) from public.partner_applications where ip_hash=p_ip and created_at>now()-interval '1 hour')>=5
 or (select count(*) from public.partner_applications where email=p_data->>'email' and created_at>now()-interval '1 day')>=3
 then raise exception 'rate_limited'; end if;
 if not exists(select 1 from public.partner_countries where code=p_data->>'country_code' and public_status in ('open','qualifying')) then raise exception 'country_unavailable'; end if;
 insert into public.partner_applications(country_code,contact_name,company,email,phone,experience,message,privacy_accepted_at,request_id,request_hash,ip_hash)
 values(p_data->>'country_code',p_data->>'contact_name',p_data->>'company',p_data->>'email',p_data->>'phone',p_data->>'experience',p_data->>'message',now(),p_request_id,p_hash,p_ip)
 returning id into result_id;
 return jsonb_build_object('id',result_id,'duplicate',false);
end $$;
revoke all on function public.submit_partner_application(jsonb,uuid,text,text) from public,anon,authenticated;
grant execute on function public.submit_partner_application(jsonb,uuid,text,text) to service_role;
commit;
