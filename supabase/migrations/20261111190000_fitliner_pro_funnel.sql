begin;

create table public.fitliner_pro_funnel (
  id uuid primary key,
  step smallint not null default 1 check (step between 1 and 10),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  name text,
  email text,
  submitted_at timestamptz,
  user_id uuid references auth.users(id) on delete cascade,
  verified_at timestamptz,
  consent_at timestamptz,
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null unique default gen_random_uuid(),
  purchased_at timestamptz
);
create index fitliner_pro_funnel_email_idx on public.fitliner_pro_funnel(email, submitted_at desc);
create index fitliner_pro_funnel_user_idx on public.fitliner_pro_funnel(user_id);
create index fitliner_pro_funnel_campaign_idx on public.fitliner_pro_funnel(submitted_at)
  where consent_at is not null and verified_at is not null and unsubscribed_at is null and purchased_at is null;

create table public.fitliner_pro_funnel_mail (
  funnel_id uuid not null references public.fitliner_pro_funnel(id) on delete cascade,
  sequence smallint not null check (sequence between 1 and 3),
  token uuid not null unique default gen_random_uuid(),
  status text not null default 'sending' check (status in ('sending','sent','failed','skipped')),
  claimed_at timestamptz not null default now(),
  sent_at timestamptz,
  provider_id text,
  primary key (funnel_id, sequence)
);
alter table public.fitliner_pro_funnel enable row level security;
alter table public.fitliner_pro_funnel_mail enable row level security;
revoke all on public.fitliner_pro_funnel, public.fitliner_pro_funnel_mail from public, anon, authenticated;
grant select, update on public.fitliner_pro_funnel, public.fitliner_pro_funnel_mail to service_role;

create function public.record_fitliner_pro_funnel(p_id uuid, p_step smallint, p_name text default null,
  p_email text default null, p_consent boolean default false)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare clean_name text := btrim(p_name); clean_email text := lower(btrim(p_email));
begin
  if p_id is null or p_step is null or p_step not between 1 and 8 then return false; end if;
  if p_name is not null or p_email is not null then
    if p_step <> 7 or clean_name is null or char_length(clean_name) not between 2 and 100
      or clean_name ~ '[[:cntrl:]]' or clean_email is null or char_length(clean_email) > 254
      or clean_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then return false; end if;
    perform pg_advisory_xact_lock(hashtextextended(clean_email, 728));
    if (select count(*) from public.fitliner_pro_funnel
        where email = clean_email and submitted_at > now() - interval '1 hour' and id <> p_id) >= 4 then
      return false;
    end if;
    insert into public.fitliner_pro_funnel (id, step, name, email, submitted_at, consent_at)
    values (p_id, 7, clean_name, clean_email, now(), case when p_consent then now() end)
    on conflict (id) do update set
      step = greatest(fitliner_pro_funnel.step, 7),
      name = case when fitliner_pro_funnel.submitted_at is null then excluded.name else fitliner_pro_funnel.name end,
      email = case when fitliner_pro_funnel.submitted_at is null then excluded.email else fitliner_pro_funnel.email end,
      submitted_at = coalesce(fitliner_pro_funnel.submitted_at, excluded.submitted_at),
      consent_at = case when fitliner_pro_funnel.submitted_at is null then excluded.consent_at else fitliner_pro_funnel.consent_at end,
      last_seen_at = now()
    where fitliner_pro_funnel.submitted_at is null or fitliner_pro_funnel.email = excluded.email;
    return found;
  end if;
  insert into public.fitliner_pro_funnel (id, step) values (p_id, p_step)
  on conflict (id) do update set step = greatest(fitliner_pro_funnel.step, excluded.step), last_seen_at = now()
    where fitliner_pro_funnel.step < excluded.step;
  return true;
end;
$$;

create function public.bind_fitliner_pro_funnel(p_id uuid)
returns boolean language plpgsql security definer set search_path = ''
as $$
declare actor uuid := auth.uid(); lead public.fitliner_pro_funnel%rowtype;
begin
  if actor is null then return false; end if;
  update public.fitliner_pro_funnel f
     set user_id = actor, verified_at = coalesce(f.verified_at, now())
    from auth.users u
   where f.id = p_id and u.id = actor and u.email_confirmed_at is not null
     and lower(u.email) = f.email and (f.user_id is null or f.user_id = actor)
  returning f.* into lead;
  if not found then return false; end if;

  insert into public.profiles (id, first_name, email) values (actor, lead.name, lead.email)
  on conflict (id) do update
    set first_name = excluded.first_name
    where nullif(btrim(profiles.first_name), '') is null;
  return true;
end;
$$;

create function public.get_fitliner_pro_funnel_status(p_id uuid default null, p_offer uuid default null)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object('purchased', f.purchased_at is not null,
    'discount', coalesce((select case m.sequence when 2 then 20 when 3 then 30 else 0 end
      from public.fitliner_pro_funnel_mail m
      where m.funnel_id = f.id and m.token = p_offer and m.status = 'sent'
        and m.sent_at > now() - interval '7 days' and f.purchased_at is null), 0))
  from public.fitliner_pro_funnel f
  where f.user_id = auth.uid() and (p_id is null or f.id = p_id)
  order by f.purchased_at desc nulls last, f.submitted_at desc
  limit 1;
$$;

create function public.unsubscribe_fitliner_pro_funnel(p_token uuid)
returns void language sql security definer set search_path = ''
as $$
  update public.fitliner_pro_funnel target set unsubscribed_at = now()
  from public.fitliner_pro_funnel source
  where source.unsubscribe_token = p_token and target.email = source.email and target.unsubscribed_at is null;
$$;

create function public.fitliner_pro_record_purchase()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.status = 'active' and exists (
    select 1 from public.health_subscription_plans where id = new.plan_id
      and code in ('fitliner_pro_monthly_eur','fitliner_pro_annual_eur')
  ) then
    update public.fitliner_pro_funnel set purchased_at = now(), step = 10
     where user_id = new.user_id and purchased_at is null;
  end if;
  return new;
end;
$$;
create trigger fitliner_pro_funnel_purchase
after insert or update of status on public.health_subscriptions
for each row execute function public.fitliner_pro_record_purchase();

create function public.claim_fitliner_pro_funnel_mail()
returns table (funnel_id uuid, sequence smallint, token uuid, email text, unsubscribe_token uuid)
language sql security definer set search_path = ''
as $$
  with due as (
    select f.id, schedule.sequence
    from public.fitliner_pro_funnel f
    cross join lateral (
      select case
        when f.submitted_at <= now() - interval '72 hours' then 3
        when f.submitted_at <= now() - interval '24 hours' then 2
        when f.submitted_at <= now() - interval '30 minutes' then 1 end::smallint as sequence
    ) schedule
    where f.verified_at is not null and f.consent_at is not null
      and f.unsubscribed_at is null and f.purchased_at is null
      and f.submitted_at > now() - interval '7 days' and schedule.sequence is not null
      and not public.has_active_fitliner_pro(f.user_id)
      and not exists (
        select 1 from public.health_subscription_checkout_attempts a
        join public.health_subscription_plans p on p.id = a.plan_id
        where a.user_id = f.user_id and a.status in ('open','pending')
          and a.created_at > now() - interval '36 minutes'
          and p.code in ('fitliner_pro_monthly_eur','fitliner_pro_annual_eur')
      )
      and not exists (select 1 from public.fitliner_pro_funnel newer
        where newer.user_id = f.user_id and newer.verified_at is not null
          and (newer.submitted_at, newer.id) > (f.submitted_at, f.id))
      and not exists (select 1 from public.fitliner_pro_funnel_mail m
        where m.funnel_id = f.id and m.sequence >= schedule.sequence)
    order by f.submitted_at
    limit 25 for update of f skip locked
  ), claimed as (
    insert into public.fitliner_pro_funnel_mail (funnel_id, sequence)
      select id, sequence from due on conflict do nothing
    returning fitliner_pro_funnel_mail.funnel_id, fitliner_pro_funnel_mail.sequence, fitliner_pro_funnel_mail.token
  )
  select c.funnel_id, c.sequence, c.token, f.email, f.unsubscribe_token
    from claimed c join public.fitliner_pro_funnel f on f.id = c.funnel_id;
$$;

alter table public.health_subscription_checkout_attempts
  add column fitliner_pro_discount smallint check (fitliner_pro_discount in (0, 20, 30));

create function public.reserve_fitliner_pro_funnel_checkout(p_user_id uuid, p_plan_id uuid, p_discount smallint)
returns setof public.health_subscription_checkout_attempts
language plpgsql security definer set search_path = ''
as $$
declare attempt public.health_subscription_checkout_attempts%rowtype;
begin
  if p_discount is null or p_discount not in (0, 20, 30) then return; end if;
  select * into attempt from public.reserve_fitliner_pro_checkout(p_user_id, p_plan_id);
  if not found then return; end if;
  if attempt.fitliner_pro_discount is null and attempt.provider_checkout_id is null then
    update public.health_subscription_checkout_attempts set fitliner_pro_discount = p_discount
      where id = attempt.id returning * into attempt;
  end if;
  return next attempt;
end;
$$;
revoke all on function public.reserve_fitliner_pro_funnel_checkout(uuid,uuid,smallint) from public, anon, authenticated;
grant execute on function public.reserve_fitliner_pro_funnel_checkout(uuid,uuid,smallint) to service_role;

create function public.admin_fitliner_pro_funnel()
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
begin
  if not coalesce(public.is_gym_console_admin(), false) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'steps', (select coalesce(jsonb_object_agg(step, total),'{}'::jsonb) from (
      select step, count(*) total from public.fitliner_pro_funnel
      where created_at > now() - interval '30 days' group by step
    ) totals),
    'leads', (select coalesce(jsonb_agg(to_jsonb(lead) order by lead.submitted_at desc),'[]'::jsonb) from (
      select f.id, f.name, f.email, f.step, f.submitted_at, f.verified_at, f.purchased_at, f.consent_at, f.unsubscribed_at,
        (select coalesce(jsonb_agg(jsonb_build_object('sequence', m.sequence, 'status', m.status) order by m.sequence),'[]'::jsonb)
           from public.fitliner_pro_funnel_mail m where m.funnel_id = f.id) mail
      from public.fitliner_pro_funnel f where f.submitted_at is not null
      order by f.submitted_at desc limit 100
    ) lead)
  );
end;
$$;

revoke all on function public.record_fitliner_pro_funnel(uuid,smallint,text,text,boolean),
  public.bind_fitliner_pro_funnel(uuid), public.get_fitliner_pro_funnel_status(uuid,uuid),
  public.unsubscribe_fitliner_pro_funnel(uuid), public.fitliner_pro_record_purchase(),
  public.claim_fitliner_pro_funnel_mail(), public.admin_fitliner_pro_funnel() from public, anon, authenticated;
grant execute on function public.record_fitliner_pro_funnel(uuid,smallint,text,text,boolean),
  public.unsubscribe_fitliner_pro_funnel(uuid) to anon, authenticated;
grant execute on function public.bind_fitliner_pro_funnel(uuid), public.get_fitliner_pro_funnel_status(uuid,uuid),
  public.admin_fitliner_pro_funnel() to authenticated;
grant execute on function public.claim_fitliner_pro_funnel_mail() to service_role;

commit;
