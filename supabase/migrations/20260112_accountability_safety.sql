-- Accountability & Safety: verification enforcement, moderation outcomes, and billing guardrails

-- Rescue enforcement + billing guardrails
alter table public.rescues
    add column if not exists enforcement_state text not null default 'active' check (enforcement_state in ('active','warned','unlisted','suspended')),
    add column if not exists enforcement_reason text,
    add column if not exists suspended_until timestamptz,
    add column if not exists grace_period_ends_at timestamptz;

-- Verification workflow enrichment
alter table public.verification_requests
    add column if not exists requested_level text not null default 'identity' check (requested_level in ('identity','501c3')),
    add column if not exists decision_notes text;

alter table public.verification_requests
    alter column status drop default;
alter table public.verification_requests
    drop constraint if exists verification_requests_status_check;
alter table public.verification_requests
    add constraint verification_requests_status_check check (status in ('pending','in_review','needs_info','approved','rejected'));
alter table public.verification_requests
    alter column status set default 'pending';

create table if not exists public.verification_audit_log (
    id uuid primary key default gen_random_uuid(),
    verification_request_id uuid references public.verification_requests(id) on delete cascade,
    from_status text,
    to_status text not null,
    changed_by uuid references auth.users(id),
    notes text,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_verification_audit_request on public.verification_audit_log (verification_request_id, created_at desc);

-- Moderation and enforcement actions
create table if not exists public.moderation_actions (
    id uuid primary key default gen_random_uuid(),
    rescue_id uuid references public.rescues(id) on delete cascade,
    animal_id uuid references public.animals(id) on delete cascade,
    inquiry_id uuid references public.inquiries(id) on delete cascade,
    report_id uuid references public.abuse_reports(id) on delete set null,
    action_type text not null check (action_type in ('warn','hide','unlist','suspend','reinstate','dismiss','note')),
    reason text,
    details text,
    expires_at timestamptz,
    resolved boolean not null default false,
    resolved_at timestamptz,
    resolved_by uuid references auth.users(id),
    created_by uuid references auth.users(id),
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_moderation_actions_rescue on public.moderation_actions (rescue_id, created_at desc);
create index if not exists idx_moderation_actions_active on public.moderation_actions (rescue_id, action_type, expires_at, resolved) where resolved = false;

-- Abuse report outcomes
alter table public.abuse_reports
    add column if not exists outcome text check (outcome in ('pending','dismissed','warned','hidden','suspended')),
    add column if not exists resolved_at timestamptz,
    add column if not exists resolved_by uuid references auth.users(id),
    add column if not exists resolution_notes text;

-- Helper to block suspended/unlisted rescues from public surfacing
create or replace function public.rescue_is_blocked(p_rescue_id uuid)
returns boolean
security definer
set search_path = public
language sql
stable
as $$
    select exists (
        select 1
        from public.moderation_actions ma
        where ma.rescue_id = p_rescue_id
          and ma.resolved = false
          and ma.action_type in ('unlist','suspend','hide')
          and (ma.expires_at is null or ma.expires_at > timezone('utc', now()))
    );
$$;

-- Guard verification state changes to trusted actors only
create or replace function public.guard_verification_fields()
returns trigger
language plpgsql
as $$
begin
    if (new.verification_status is distinct from old.verification_status
        or new.verified_at is distinct from old.verified_at)
        and auth.role() <> 'service_role' then
        raise exception 'verification fields are managed by RescueOS trust & safety';
    end if;
    return new;
end;
$$;

drop trigger if exists trg_guard_rescue_verification on public.rescues;
create trigger trg_guard_rescue_verification
before update on public.rescues
for each row
execute procedure public.guard_verification_fields();

-- Billing guardrails: keep paid tiers tied to an active subscription or grace period
create or replace function public.guard_billing_fields()
returns trigger
language plpgsql
as $$
begin
    if new.plan_tier <> 'free' and coalesce(new.subscription_status, '') not in ('active','trialing','past_due') then
        new.plan_tier := 'free';
    end if;

    if new.plan_tier <> 'free' and new.subscription_status = 'past_due' and new.grace_period_ends_at is null then
        new.grace_period_ends_at := timezone('utc', now()) + interval '7 days';
    end if;

    if new.plan_tier <> 'free' and new.grace_period_ends_at is not null and new.grace_period_ends_at <= timezone('utc', now()) then
        new.plan_tier := 'free';
        new.subscription_status := null;
    end if;

    return new;
end;
$$;

drop trigger if exists trg_guard_billing on public.rescues;
create trigger trg_guard_billing
before update on public.rescues
for each row
execute procedure public.guard_billing_fields();

-- Verification request bookkeeping and audit trail
create or replace function public.mark_rescue_verification_submitted()
returns trigger
language plpgsql
as $$
begin
    if new.rescue_id is not null then
        update public.rescues
        set verification_submitted_at = coalesce(verification_submitted_at, new.created_at)
        where id = new.rescue_id;
    end if;
    return new;
end;
$$;

drop trigger if exists trg_verification_request_submit on public.verification_requests;
create trigger trg_verification_request_submit
after insert on public.verification_requests
for each row
execute procedure public.mark_rescue_verification_submitted();

create or replace function public.log_and_apply_verification()
returns trigger
language plpgsql
as $$
declare
    approver uuid;
    new_status text;
begin
    if new.status is distinct from old.status then
        approver := coalesce(auth.uid(), new.reviewer_user_id, old.reviewer_user_id);
        insert into public.verification_audit_log (verification_request_id, from_status, to_status, changed_by, notes)
        values (new.id, old.status, new.status, approver, new.decision_notes);

        if new.rescue_id is not null then
            if new.status = 'approved' then
                new_status := case when new.requested_level = '501c3' then 'verified_501c3' else 'verified' end;
                update public.rescues
                set verification_status = new_status,
                    verified_at = timezone('utc', now()),
                    verification_submitted_at = coalesce(verification_submitted_at, new.created_at)
                where id = new.rescue_id;
            elsif new.status = 'rejected' then
                update public.rescues
                set verification_status = 'unverified',
                    verified_at = null
                where id = new.rescue_id;
            end if;
        end if;
    end if;
    return new;
end;
$$;

drop trigger if exists trg_verification_request_apply on public.verification_requests;
create trigger trg_verification_request_apply
after update on public.verification_requests
for each row
execute procedure public.log_and_apply_verification();

-- Badge definitions for public explanation
create or replace view public.verification_badges as
select 'unverified'::text as status, 'Unverified'::text as label, 'Rescue has not completed verification yet.'::text as description
union all
select 'verified', 'Identity verified', 'Rescue identity and presence confirmed by RescueOS.'
union all
select 'verified_501c3', '501(c)(3) verified', 'Nonprofit status verified via EIN/IRS lookup.';

-- RLS for verification audit log (service role only)
alter table public.verification_audit_log enable row level security;

drop policy if exists "Verification audit service read" on public.verification_audit_log;
create policy "Verification audit service read" on public.verification_audit_log
    for select using (auth.role() = 'service_role');

drop policy if exists "Verification audit service manage" on public.verification_audit_log;
create policy "Verification audit service manage" on public.verification_audit_log
    for all using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- RLS for moderation actions (read for impacted rescues, manage by service role)
alter table public.moderation_actions enable row level security;

drop policy if exists "Moderation actions rescue read" on public.moderation_actions;
create policy "Moderation actions rescue read" on public.moderation_actions
    for select using (
        auth.role() = 'service_role'
        or exists (
            select 1 from public.rescue_members rm
            where rm.rescue_id = moderation_actions.rescue_id
              and rm.user_id = auth.uid()
        )
    );

drop policy if exists "Moderation actions service manage" on public.moderation_actions;
create policy "Moderation actions service manage" on public.moderation_actions
    for all using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- Updated public rescue/animal/photo policies to respect enforcement blocks
drop policy if exists "Public rescue read" on public.rescues;
create policy "Public rescue read" on public.rescues
    for select using (is_public is true and disabled is false and not public.rescue_is_blocked(rescues.id));

drop policy if exists "Public animal read" on public.animals;
create policy "Public animal read" on public.animals
    for select using (
        is_active
        and status in ('available','hold')
        and not exists (
            select 1 from public.rescues r
            where r.id = animals.rescue_id
              and (r.disabled or public.rescue_is_blocked(r.id))
        )
    );

drop policy if exists "Public photo read" on public.animal_photos;
create policy "Public photo read" on public.animal_photos
    for select using (
        exists (
            select 1 from public.animals
            join public.rescues r on r.id = animals.rescue_id
            where animals.id = animal_photos.animal_id
              and animals.is_active
              and animals.status in ('available','hold')
            and not r.disabled
            and not public.rescue_is_blocked(r.id)
        )
    );

-- Refresh public_rescues view to align with new fields
drop view if exists public.public_rescues;
create or replace view public.public_rescues as
select
    id,
    name,
    slug,
    tagline,
    location_text,
    mission_statement,
    adoption_process,
    response_time,
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
    verification_submitted_at,
    verified_at,
    enforcement_state,
    suspended_until,
    disabled,
    is_public,
    created_at,
    updated_at
from public.rescues;
