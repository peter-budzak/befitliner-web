begin;

-- Delivery credentials remain in Edge Function secrets. Only trusted operators
-- can enable sending or change the destination; the console has read-only status.
create table public.gym_admin_alert_settings (
  id boolean primary key default true check(id),
  enabled boolean not null default false,
  recipient text check(recipient ~ '^\+[1-9][0-9]{7,14}$'),
  starts_at timestamptz not null default now(),
  last_error text,
  checked_at timestamptz
);
insert into public.gym_admin_alert_settings(id) values(true);

create table public.gym_admin_order_alerts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.gym_module_orders(id),
  status text not null default 'pending' check(status in ('pending','sending','accepted','delivered','failed','unknown','canceled')),
  attempts integer not null default 0,
  provider_sid text unique,
  last_error text,
  available_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index gym_admin_order_alerts_pending_idx on public.gym_admin_order_alerts(status,available_at);
alter table public.gym_admin_alert_settings enable row level security;
alter table public.gym_admin_order_alerts enable row level security;
revoke all on public.gym_admin_alert_settings,public.gym_admin_order_alerts from public,anon,authenticated;
grant all on public.gym_admin_alert_settings,public.gym_admin_order_alerts to service_role;

create function public.gym_admin_queue_order_alert() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  -- The existing importer verifies the live Stripe account, link, product and charge.
  -- Historical paid orders are not backfilled when alerts are first installed.
  if new.payment_status='paid' and new.paid_at is not null
     and new.currency='EUR' and new.amount_minor=1500::bigint*new.quantity
     and new.paid_at >= (select starts_at from public.gym_admin_alert_settings where id=true) then
    insert into public.gym_admin_order_alerts(order_id) values(new.id)
    on conflict(order_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function public.gym_admin_queue_order_alert() from public,anon,authenticated;
create trigger gym_admin_paid_order_alert after insert or update of payment_status,paid_at
on public.gym_module_orders for each row execute function public.gym_admin_queue_order_alert();

create function public.gym_admin_claim_order_alerts() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare result jsonb;
begin
  if not exists(select 1 from public.gym_admin_alert_settings where id=true and enabled and recipient is not null) then return '[]'::jsonb; end if;
  -- A process can die after the provider accepted an SMS. Never resend these
  -- uncertain attempts automatically: that could charge for duplicate messages.
  update public.gym_admin_order_alerts set status='unknown',last_error='Odoslanie nebolo potvrdené. Overte správu u poskytovateľa.',updated_at=now()
  where status='sending' and updated_at<now()-interval '10 minutes';
  update public.gym_admin_order_alerts a set status='canceled',updated_at=now()
  from public.gym_module_orders o where o.id=a.order_id and a.status='pending'
    and (o.payment_status<>'paid' or o.refunded_minor<>0);
  with candidates as (
    select a.id from public.gym_admin_order_alerts a
    join public.gym_module_orders o on o.id=a.order_id
    where a.status='pending' and a.available_at<=now() and a.attempts<5
      and o.payment_status='paid' and o.refunded_minor=0
    order by a.created_at limit 3 for update of a skip locked
  ), claimed as (
    update public.gym_admin_order_alerts a set status='sending',attempts=attempts+1,updated_at=now()
    from candidates c where a.id=c.id returning a.*
  ) select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'order_id',a.order_id,'attempts',a.attempts,
      'quantity',o.quantity,'amount_minor',o.amount_minor,'currency',o.currency)),'[]'::jsonb)
    into result from claimed a join public.gym_module_orders o on o.id=a.order_id;
  return result;
end;
$$;
revoke all on function public.gym_admin_claim_order_alerts() from public,anon,authenticated;
grant execute on function public.gym_admin_claim_order_alerts() to service_role;

create function public.gym_admin_alert_status() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_gym_console_admin() then raise exception 'Forbidden' using errcode='42501'; end if;
  return jsonb_build_object(
    'enabled',(select enabled from public.gym_admin_alert_settings where id=true),
    'recipient_suffix',(select right(recipient,4) from public.gym_admin_alert_settings where id=true),
    'last_error',(select last_error from public.gym_admin_alert_settings where id=true),
    'pending',(select count(*) from public.gym_admin_order_alerts where status in ('pending','sending')),
    'accepted',(select count(*) from public.gym_admin_order_alerts where status='accepted'),
    'delivered',(select count(*) from public.gym_admin_order_alerts where status='delivered'),
    'attention',(select count(*) from public.gym_admin_order_alerts where status in ('failed','unknown'))
  );
end;
$$;
revoke all on function public.gym_admin_alert_status() from public,anon;
grant execute on function public.gym_admin_alert_status() to authenticated;
commit;
