-- Fitliner operations console. Additive: existing payment and access flows stay authoritative.
begin;
create table public.gym_admin_access (
  user_id uuid primary key references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.gym_admin_access enable row level security;
revoke all on public.gym_admin_access from anon, authenticated;
insert into public.gym_admin_access(user_id)
select id from auth.users where lower(email) = 'peter@peterbudzak.com' and email_confirmed_at is not null;

create function public.is_gym_console_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.gym_admin_access a join auth.users u on u.id=a.user_id
    where a.user_id=auth.uid() and lower(u.email)='peter@peterbudzak.com' and u.email_confirmed_at is not null);
$$;
revoke all on function public.is_gym_console_admin() from public, anon;
grant execute on function public.is_gym_console_admin() to authenticated;

create table public.gym_admin_notes (
  gym_id uuid primary key references public.gyms(id),
  note text not null default '' check(length(note)<=10000),
  updated_at timestamptz not null default now()
);
create table public.gym_module_orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  stripe_payment_intent_id text,
  gym_id uuid references public.gyms(id),
  customer_name text,
  customer_email text,
  customer_phone text,
  shipping_address jsonb not null default '{}',
  quantity integer not null check(quantity>0),
  amount_minor bigint not null check(amount_minor>=0),
  refunded_minor bigint not null default 0 check(refunded_minor>=0 and refunded_minor<=amount_minor),
  currency text not null check(currency ~ '^[A-Z]{3}$'),
  payment_status text not null check(payment_status in ('unpaid','processing','paid','expired','partially_refunded','refunded','disputed')),
  fulfillment_status text not null default 'new' check(fulfillment_status in ('new','preparing','shipped','delivered','on_hold','canceled')),
  tracking_number text not null default '' check(length(tracking_number)<=200),
  note text not null default '' check(length(note)<=10000),
  created_at timestamptz not null,
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  synced_at timestamptz not null default now(),
  revision integer not null default 1
);
create index gym_module_orders_gym_created_idx on public.gym_module_orders(gym_id,created_at desc);
create table public.gym_admin_activity (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create table public.gym_admin_sync_state (
  id boolean primary key default true check(id),
  last_success_at timestamptz,
  last_error text,
  imported_count integer not null default 0,
  webhook_endpoint_id text,
  webhook_secret text,
  cron_secret text not null default encode(extensions.gen_random_bytes(32),'hex'),
  sync_cursor text
);
insert into public.gym_admin_sync_state(id) values(true);
alter table public.gym_admin_notes enable row level security;
alter table public.gym_module_orders enable row level security;
alter table public.gym_admin_activity enable row level security;
alter table public.gym_admin_sync_state enable row level security;
revoke all on public.gym_admin_notes, public.gym_module_orders, public.gym_admin_activity, public.gym_admin_sync_state from anon, authenticated;
grant all on public.gym_admin_notes, public.gym_module_orders, public.gym_admin_activity, public.gym_admin_sync_state to service_role;

-- Report only recorded receipts; old ThriveCart rows have no provable Fitliner fee.
-- Stripe fulfillment also writes user_membership_payments: never count these twice.
create view public.gym_admin_receipts with (security_invoker=true) as
select p.id,p.gym_id,p.paid_at,p.currency,p.gross_minor,
 p.fitliner_fee_minor, 'commerce'::text source
from public.commerce_payments p
where p.paid_at is not null and p.status in ('succeeded','partially_refunded','refunded','disputed')
union all
select p.id,p.gym_id,p.paid_at,upper(coalesce(p.currency,'UNKNOWN')),
 round(p.amount*100)::bigint,null::bigint,'legacy'::text
from public.user_membership_payments p
where p.provider='thrivecart' and p.amount is not null
 and not exists(select 1 from public.commerce_payments c where c.provider=p.provider and
   (c.id::text=p.raw_payload->>'commerce_payment_id' or c.order_id::text=p.raw_payload->>'commerce_order_id'
    or c.provider_payment_id=p.provider_event_id));
revoke all on public.gym_admin_receipts from public,anon,authenticated;

create function public.gym_admin_dashboard(p_month date default current_date) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare result jsonb; v_month date := date_trunc('month',p_month)::date;
begin
 if not public.is_gym_console_admin() then raise exception 'Prístup zamietnutý.' using errcode='42501'; end if;
 if p_month is null then raise exception 'Vyberte mesiac.'; end if;
 with members as (
   select m.gym_id,count(distinct m.user_id) members_total,
    count(distinct m.user_id) filter(where m.active and m.status='active'
      and m.valid_from<=now() and (m.valid_to is null or m.valid_to>now())
      and (m.valid_until is null or m.valid_until>now())
      and (m.membership_kind<>'entries' or m.entries_left>0)) members_active
   from public.memberships m group by m.gym_id
 ), modules as (
   select gym_id,count(*) modules_total,count(*) filter(where status='active') modules_active
   from public.locks group by gym_id
 ), orders as (
   select gym_id,sum(quantity) ordered_modules,
    sum(quantity) filter(where payment_status in ('paid','partially_refunded','disputed')) paid_modules,
    max(created_at) last_order_at from public.gym_module_orders group by gym_id
 ), monthly as (
   select r.gym_id,date_trunc('month',r.paid_at at time zone 'Europe/Bratislava')::date as month,
    r.currency,sum(r.gross_minor)::bigint gross_minor,
    sum(coalesce(r.fitliner_fee_minor,0))::bigint fee_minor,
    count(*) payment_count,count(*) filter(where r.fitliner_fee_minor is null) unknown_fee_count,
    0::bigint refunds_minor,0::bigint fee_refunds_minor
   from public.gym_admin_receipts r group by 1,2,3
   union all
   select r.gym_id,date_trunc('month',r.refunded_at at time zone 'Europe/Bratislava')::date,
    r.currency,0,0,0,0,sum(r.amount_minor)::bigint,sum(r.application_fee_refund_minor)::bigint
   from public.commerce_refunds r where r.status='succeeded' and r.refunded_at is not null group by 1,2,3
 ), finance as (
   select gym_id,month,currency,sum(gross_minor)::bigint gross_minor,sum(fee_minor)::bigint fee_minor,
    sum(payment_count)::bigint payment_count,sum(unknown_fee_count)::bigint unknown_fee_count,
    sum(refunds_minor)::bigint refunds_minor,sum(fee_refunds_minor)::bigint fee_refunds_minor
   from monthly group by 1,2,3
 )
 select jsonb_build_object(
  'generated_at',now(),'month',v_month,
  'gyms',coalesce((select jsonb_agg(to_jsonb(t) order by t.created_at desc) from (
    select g.id,g.name,g.slug,g.address,g.contact_email,g.contact_phone,g.currency,g.created_at,
    u.email owner_email,coalesce(n.note,'') note,n.updated_at note_updated_at,
    coalesce(m.members_total,0) members_total,coalesce(m.members_active,0) members_active,
    coalesce(l.modules_total,0) modules_total,coalesce(l.modules_active,0) modules_active,
    coalesce(o.ordered_modules,0) ordered_modules,coalesce(o.paid_modules,0) paid_modules,o.last_order_at,
    coalesce(s.fitliner_fee_bps_override,1000) fee_bps,s.fitliner_fee_bps_override fee_override,
    s.payment_provider,coalesce(s.stripe_live_mode_enabled,false) stripe_live,
    coalesce(a.charges_enabled,false) charges_enabled
    from public.gyms g left join auth.users u on u.id=g.owner_id
    left join members m on m.gym_id=g.id left join modules l on l.gym_id=g.id
    left join orders o on o.gym_id=g.id left join public.gym_admin_notes n on n.gym_id=g.id
    left join public.gym_payment_settings s on s.gym_id=g.id
    left join public.stripe_connected_accounts a on a.gym_id=g.id
  )t),'[]'::jsonb),
  'finance',coalesce((select jsonb_agg(to_jsonb(f) order by month desc) from finance f),'[]'::jsonb),
  'modules',coalesce((select jsonb_agg(jsonb_build_object('id',l.id,'gym_id',l.gym_id,'name',coalesce(l.name,l.label),
    'status',l.status,'created_at',l.created_at) order by l.created_at desc) from public.locks l),'[]'::jsonb),
  'orders',coalesce((select jsonb_agg(to_jsonb(t) order by t.created_at desc) from (
    select * from public.gym_module_orders order by created_at desc
  )t),'[]'::jsonb),
  'order_count',(select count(*) from public.gym_module_orders),
  'module_finance',coalesce((select jsonb_agg(to_jsonb(t) order by month desc) from (
    select date_trunc('month',paid_at at time zone 'Europe/Bratislava')::date as month,currency,
      sum(amount_minor)::bigint gross_minor,sum(refunded_minor)::bigint refunded_minor,sum(quantity)::bigint quantity
    from public.gym_module_orders where paid_at is not null group by 1,2
  )t),'[]'::jsonb),
  'leads',coalesce((select jsonb_agg(to_jsonb(t) order by created_at desc) from (
    select id,gym_name,address,contact_name,email,phone,created_at,completed_step,checkout_clicked,checkout_clicked_at
    from public.gym_funnel_submissions order by created_at desc limit 500
  )t),'[]'::jsonb),
  'activity',coalesce((select jsonb_agg(to_jsonb(t) order by created_at desc) from (
    select id,entity_type,entity_id,action,details,created_at from public.gym_admin_activity order by created_at desc limit 100
  )t),'[]'::jsonb),
  'sync',(select jsonb_build_object('last_success_at',last_success_at,'last_error',last_error,'imported_count',imported_count,
    'webhook_configured',webhook_endpoint_id is not null) from public.gym_admin_sync_state where id=true)
 ) into result;
 return result;
end;
$$;
revoke all on function public.gym_admin_dashboard(date) from public,anon;
grant execute on function public.gym_admin_dashboard(date) to authenticated;

create function public.gym_admin_update_order(p_id uuid,p_revision integer,p_gym_id uuid,
 p_status text,p_tracking text,p_note text) returns void
language plpgsql security definer set search_path = '' as $$
declare old public.gym_module_orders%rowtype;
begin
 if not public.is_gym_console_admin() then raise exception 'Prístup zamietnutý.' using errcode='42501'; end if;
 select * into old from public.gym_module_orders where id=p_id for update;
 if not found then raise exception 'Objednávka neexistuje.'; end if;
 if old.revision<>p_revision then raise exception 'Objednávka sa zmenila. Obnovte údaje a skúste znova.'; end if;
 if p_status in ('preparing','shipped','delivered') and old.payment_status not in ('paid','partially_refunded') then
   raise exception 'Expedovať možno len zaplatenú objednávku.'; end if;
 if p_status in ('shipped','delivered') and nullif(trim(p_tracking),'') is null then
   raise exception 'Doplňte číslo zásielky alebo spôsob osobného odovzdania.'; end if;
 update public.gym_module_orders set gym_id=p_gym_id,fulfillment_status=p_status,
  tracking_number=trim(p_tracking),note=trim(p_note),revision=revision+1,
  shipped_at=case when p_status in ('shipped','delivered') then coalesce(shipped_at,now()) else shipped_at end,
  delivered_at=case when p_status='delivered' then coalesce(delivered_at,now()) else delivered_at end where id=p_id;
 insert into public.gym_admin_activity(actor_id,entity_type,entity_id,action,details)
 values(auth.uid(),'order',p_id,'order_updated',jsonb_build_object('from',old.fulfillment_status,'to',p_status,
   'gym_id',p_gym_id,'tracking_number',trim(p_tracking),'note_changed',old.note is distinct from trim(p_note)));
end;
$$;
revoke all on function public.gym_admin_update_order(uuid,integer,uuid,text,text,text) from public,anon;
grant execute on function public.gym_admin_update_order(uuid,integer,uuid,text,text,text) to authenticated;

create function public.gym_admin_save_gym(p_id uuid,p_note text,p_expected_note_updated_at timestamptz,
 p_change_fee boolean default false,p_fee_bps integer default null,p_expected_fee integer default null,p_reason text default '') returns void
language plpgsql security definer set search_path = '' as $$
declare v_updated timestamptz; v_fee integer;
begin
 if not public.is_gym_console_admin() then raise exception 'Prístup zamietnutý.' using errcode='42501'; end if;
 perform 1 from public.gyms where id=p_id for update;
 if not found then raise exception 'Gym neexistuje.'; end if;
 select updated_at into v_updated from public.gym_admin_notes where gym_id=p_id;
 if v_updated is distinct from p_expected_note_updated_at then raise exception 'Poznámka sa zmenila. Obnovte údaje.'; end if;
 if p_change_fee then
   select fitliner_fee_bps_override into v_fee from public.gym_payment_settings where gym_id=p_id for update;
   if v_fee is distinct from p_expected_fee then raise exception 'Poplatok sa zmenil. Obnovte údaje.'; end if;
   perform public.set_fitliner_fee_override(p_id,p_fee_bps,p_reason,auth.uid(),'{"source":"gym_admin_console"}'::jsonb);
 end if;
 insert into public.gym_admin_notes(gym_id,note) values(p_id,trim(p_note))
 on conflict(gym_id) do update set note=excluded.note,updated_at=clock_timestamp();
 insert into public.gym_admin_activity(actor_id,entity_type,entity_id,action,details)
 values(auth.uid(),'gym',p_id,'gym_updated',jsonb_build_object('fee_changed',p_change_fee,'fee_bps',p_fee_bps,'reason',p_reason));
end;
$$;
revoke all on function public.gym_admin_save_gym(uuid,text,timestamptz,boolean,integer,integer,text) from public,anon;
grant execute on function public.gym_admin_save_gym(uuid,text,timestamptz,boolean,integer,integer,text) to authenticated;

-- Only the verified Stripe importer can write monetary/payment fields.
create function public.gym_admin_import_order(p_order jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
 insert into public.gym_module_orders(stripe_session_id,stripe_payment_intent_id,customer_name,customer_email,customer_phone,
 shipping_address,quantity,amount_minor,refunded_minor,currency,payment_status,created_at,paid_at,synced_at)
 select stripe_session_id,stripe_payment_intent_id,customer_name,customer_email,customer_phone,
 coalesce(shipping_address,'{}'::jsonb),quantity,amount_minor,refunded_minor,currency,payment_status,created_at,paid_at,synced_at
 from jsonb_to_record(p_order) as x(stripe_session_id text,stripe_payment_intent_id text,customer_name text,customer_email text,
 customer_phone text,shipping_address jsonb,quantity integer,amount_minor bigint,refunded_minor bigint,currency text,
 payment_status text,created_at timestamptz,paid_at timestamptz,synced_at timestamptz)
 on conflict(stripe_session_id) do update set
 stripe_payment_intent_id=excluded.stripe_payment_intent_id,customer_name=excluded.customer_name,
 customer_email=excluded.customer_email,customer_phone=excluded.customer_phone,shipping_address=excluded.shipping_address,
 quantity=excluded.quantity,amount_minor=excluded.amount_minor,refunded_minor=excluded.refunded_minor,
 currency=excluded.currency,payment_status=excluded.payment_status,paid_at=coalesce(gym_module_orders.paid_at,excluded.paid_at),
 synced_at=excluded.synced_at,revision=gym_module_orders.revision+1
 where excluded.synced_at>gym_module_orders.synced_at;
end;
$$;
revoke all on function public.gym_admin_import_order(jsonb) from public,anon,authenticated;
grant execute on function public.gym_admin_import_order(jsonb) to service_role;
commit;
