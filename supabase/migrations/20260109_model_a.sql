-- RescueOS Model A: self-serve signup, verification, reporting, and billing scaffolding

-- Core rescue identity upgrades
alter table public.rescues
    add column if not exists owner_user_id uuid references auth.users(id),
    add column if not exists location text,
    add column if not exists profile_image_url text,
    add column if not exists header_image_url text,
    add column if not exists verification_status text not null default 'unverified' check (verification_status in ('unverified','verified','verified_501c3')),
    add column if not exists verification_submitted_at timestamptz,
    add column if not exists verified_at timestamptz,
    add column if not exists response_time text,
    add column if not exists stripe_customer_id text,
    add column if not exists stripe_subscription_id text,
    add column if not exists plan_tier text not null default 'free' check (plan_tier in ('free','supporter','pro')),
    add column if not exists subscription_status text,
    add column if not exists current_period_end timestamptz,
    add column if not exists disabled boolean not null default false,
    add column if not exists disabled_at timestamptz;

-- Backfill owner, location, and media columns from existing data
update public.rescues r
set owner_user_id = coalesce(
    r.owner_user_id,
    (
        select rm.user_id
        from public.rescue_members rm
        where rm.rescue_id = r.id
        order by case when rm.role = 'owner' then 0 when rm.role = 'admin' then 1 else 2 end, rm.created_at
        limit 1
    )
)
where r.owner_user_id is null;

update public.rescues
set location = coalesce(location, location_text)
where location is null and location_text is not null;

update public.rescues
set profile_image_url = coalesce(profile_image_url, logo_url)
where profile_image_url is null and logo_url is not null;

update public.rescues
set header_image_url = coalesce(header_image_url, cover_url)
where header_image_url is null and cover_url is not null;

-- Enforce owner presence if possible (safe to skip if legacy rows exist)
do $$
begin
    if exists (select 1 from public.rescues where owner_user_id is null) then
        raise warning 'Some rescues are missing owner_user_id; keep column nullable for now.';
    else
        alter table public.rescues alter column owner_user_id set not null;
    end if;
end$$;

-- Inquiry archiving flag (in addition to archived_at/by)
alter table public.inquiries
    add column if not exists archived boolean not null default false;

-- Verification requests (manual review)
create table if not exists public.verification_requests (
    id uuid primary key default gen_random_uuid(),
    rescue_id uuid references public.rescues(id) on delete cascade,
    submitted_by uuid references auth.users(id),
    website_url text,
    instagram_url text,
    facebook_url text,
    ein text,
    legal_name text,
    notes text,
    status text not null default 'pending' check (status in ('pending','approved','rejected')),
    reviewer_user_id uuid references auth.users(id),
    reviewed_at timestamptz,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_verification_requests_rescue on public.verification_requests(rescue_id, created_at desc);
create index if not exists idx_verification_requests_status on public.verification_requests(status, created_at desc);

-- Abuse reports (public input, admin triage)
create table if not exists public.abuse_reports (
    id uuid primary key default gen_random_uuid(),
    reporter_email text,
    reporter_name text,
    type text not null check (type in ('rescue','animal','inquiry')),
    rescue_id uuid references public.rescues(id) on delete set null,
    animal_id uuid references public.animals(id) on delete set null,
    inquiry_id uuid references public.inquiries(id) on delete set null,
    message text not null,
    status text not null default 'open' check (status in ('open','triaged','closed')),
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_abuse_reports_type on public.abuse_reports(type, created_at desc);
create index if not exists idx_abuse_reports_rescue on public.abuse_reports(rescue_id, created_at desc);

-- Partner leads (sponsorship intake)
create table if not exists public.partner_leads (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null,
    org text,
    message text,
    created_at timestamptz not null default timezone('utc', now())
);

-- Optional support payments log (one-time sponsor)
create table if not exists public.support_payments (
    id uuid primary key default gen_random_uuid(),
    email text,
    amount_cents integer,
    currency text default 'usd',
    stripe_payment_intent_id text,
    created_at timestamptz not null default timezone('utc', now())
);

-- Profiles expansion (avatar/full name/role)
alter table public.profiles
    add column if not exists full_name text,
    add column if not exists avatar_url text,
    add column if not exists role text;

-- Public view refresh with verification + imagery + location
drop view if exists public.public_rescues;
create or replace view public.public_rescues as
select
    id,
    name,
    slug,
    tagline,
    location as location_text,
    mission_statement,
    adoption_process,
    response_time_enum,
    response_time_text,
    adoption_steps,
    website_url,
    facebook_url,
    instagram_url,
    donation_url,
    logo_url,
    cover_url,
    profile_image_url,
    header_image_url,
    verification_status,
    is_public,
    disabled,
    created_at,
    updated_at
from public.rescues;

alter view public.public_rescues owner to postgres;

-- RLS enablement
alter table public.verification_requests enable row level security;
alter table public.abuse_reports enable row level security;
alter table public.partner_leads enable row level security;
alter table public.support_payments enable row level security;
alter table public.rescues enable row level security;

-- Updated RLS policies for rescues (drop old to avoid duplicates)
drop policy if exists "Public rescue read" on public.rescues;
drop policy if exists "Members read their rescue" on public.rescues;
drop policy if exists "Members manage their rescue rows" on public.rescues;
drop policy if exists "Authenticated users can create rescues" on public.rescues;

create policy "Public rescue read" on public.rescues
    for select using (is_public is true and disabled is false and slug is not null);

create policy "Members read their rescue" on public.rescues
    for select using (
        exists (
            select 1 from public.rescue_members rm
            where rm.rescue_id = rescues.id
              and rm.user_id = auth.uid()
        )
    );

create policy "Members manage their rescue rows" on public.rescues
    for update using (
        auth.uid() = owner_user_id or exists (
            select 1 from public.rescue_members rm
            where rm.rescue_id = rescues.id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    )
    with check (
        auth.uid() = owner_user_id or exists (
            select 1 from public.rescue_members rm
            where rm.rescue_id = rescues.id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    );

create policy "Users create rescues as owner" on public.rescues
    for insert with check (auth.uid() is not null and owner_user_id = auth.uid());

-- Profiles: self and teammates
drop policy if exists "Profiles select own" on public.profiles;
drop policy if exists "Profiles insert own" on public.profiles;
drop policy if exists "Profiles update own" on public.profiles;

create policy "Profiles select self or teammates" on public.profiles
    for select using (
        auth.uid() = id
        or id in (
            select rm.user_id
            from public.rescue_members rm
            where rm.rescue_id in (
                select rescue_id from public.rescue_members where user_id = auth.uid()
            )
        )
    );

create policy "Profiles insert own" on public.profiles
    for insert with check (auth.uid() = id);

create policy "Profiles update own" on public.profiles
    for update using (auth.uid() = id) with check (auth.uid() = id);

-- Verification requests policies
drop policy if exists "Verification select" on public.verification_requests;
drop policy if exists "Verification insert" on public.verification_requests;
drop policy if exists "Verification update" on public.verification_requests;

create policy "Verification select own rescue" on public.verification_requests
    for select using (
        exists (
            select 1 from public.rescue_members rm
            where rm.rescue_id = verification_requests.rescue_id
              and rm.user_id = auth.uid()
        )
        or auth.role() = 'service_role'
    );

create policy "Verification insert by rescue admin" on public.verification_requests
    for insert with check (
        exists (
            select 1 from public.rescue_members rm
            where rm.rescue_id = verification_requests.rescue_id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    );

create policy "Verification admin update" on public.verification_requests
    for update using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- Abuse reports policies
drop policy if exists "Abuse reports insert" on public.abuse_reports;
drop policy if exists "Abuse reports admin" on public.abuse_reports;

create policy "Abuse reports public insert" on public.abuse_reports
    for insert with check (true);

create policy "Abuse reports admin access" on public.abuse_reports
    for select using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

create policy "Abuse reports admin update" on public.abuse_reports
    for update using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- Partner leads policies
drop policy if exists "Partner leads insert" on public.partner_leads;
drop policy if exists "Partner leads admin" on public.partner_leads;

create policy "Partner leads public insert" on public.partner_leads
    for insert with check (true);

create policy "Partner leads admin read" on public.partner_leads
    for select using (auth.role() = 'service_role');

-- Support payments policies
drop policy if exists "Support payments insert" on public.support_payments;
drop policy if exists "Support payments admin" on public.support_payments;

create policy "Support payments public insert" on public.support_payments
    for insert with check (true);

create policy "Support payments admin read" on public.support_payments
    for select using (auth.role() = 'service_role');

