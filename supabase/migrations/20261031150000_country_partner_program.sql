-- Country partner program schema; apply to staging before production.
create table if not exists public.partner_countries (
 code text primary key check (code ~ '^[A-Z]{2}$'),
 name text not null,
 public_status text not null default 'open' check (public_status in ('open','qualifying','exclusive','paused')),
 qualification_gyms integer not null default 10 check (qualification_gyms>0),
 qualification_days integer not null default 90 check (qualification_days>0),
 annual_new_gyms_target integer check (annual_new_gyms_target>0),
 target_approved boolean not null default false,
 updated_at timestamptz not null default now()
);
create table if not exists public.partner_applications (
 id uuid primary key default gen_random_uuid(),
 country_code text not null references public.partner_countries(code),
 contact_name text not null,
 company text,
 email text not null,
 phone text not null,
 experience text not null,
 message text,
 privacy_accepted_at timestamptz not null,
 status text not null default 'new' check (status in ('new','reviewing','contacted','accepted','rejected')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists partner_applications_created_idx on public.partner_applications(created_at desc);
create index if not exists partner_applications_country_status_idx on public.partner_applications(country_code,status);
create table if not exists public.country_partners (
 id uuid primary key default gen_random_uuid(),
 country_code text not null references public.partner_countries(code),
 application_id uuid references public.partner_applications(id),
 legal_entity text not null,
 contract_signed_at timestamptz,
 qualification_started_at timestamptz,
 qualification_ends_at timestamptz,
 exclusivity_started_at timestamptz,
 exclusivity_ends_at timestamptz,
 status text not null default 'qualifying' check (status in ('qualifying','exclusive','expired','terminated')),
 terms_version text not null default 'v1',
 created_at timestamptz not null default now()
);
create unique index if not exists country_partners_one_exclusive on public.country_partners(country_code) where status='exclusive';
alter table public.partner_countries enable row level security;
alter table public.partner_applications enable row level security;
alter table public.country_partners enable row level security;
revoke all on public.partner_applications from anon,authenticated;
revoke all on public.country_partners from anon,authenticated;
insert into public.partner_countries(code,name,annual_new_gyms_target) values
 ('PL','Poland',120),('CZ','Czech Republic',70),('SK','Slovakia',40),('HU','Hungary',70),('RO','Romania',100),('DE','Germany',200),('AT','Austria',60),('GB','United Kingdom',180),('FR','France',170),('ES','Spain',130),('IT','Italy',150),('NL','Netherlands',90),('BE','Belgium',65),('PT','Portugal',60),('HR','Croatia',40),('SI','Slovenia',30),('BG','Bulgaria',50),('SE','Sweden',70),('IE','Ireland',40)
on conflict (code) do nothing;
