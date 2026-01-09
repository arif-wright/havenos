-- RescueOS core schema (Model A)
create extension if not exists "pgcrypto";

create table if not exists rescues (
    id uuid primary key default gen_random_uuid(),
    owner_user_id uuid not null references auth.users(id),
    name text not null,
    slug text not null unique,
    contact_email text not null,
    mission_statement text,
    adoption_process text,
    response_time text,
    response_time_text text,
    created_at timestamptz not null default timezone('utc', now()),
    tagline text,
    location_text text,
    location text,
    website_url text,
    facebook_url text,
    instagram_url text,
    donation_url text,
    logo_url text,
    cover_url text,
    profile_image_url text,
    header_image_url text,
    response_time_enum text,
    adoption_steps jsonb,
    application_required boolean not null default false,
    home_visit boolean not null default false,
    fenced_yard_required boolean not null default false,
    cats_ok boolean not null default false,
    dogs_ok boolean not null default false,
    kids_ok boolean not null default false,
    adoption_fee_range text,
    is_public boolean not null default true,
    verification_status text not null default 'unverified' check (verification_status in ('unverified','verified','verified_501c3')),
    verification_submitted_at timestamptz,
    verified_at timestamptz,
    stripe_customer_id text,
    stripe_subscription_id text,
    plan_tier text not null default 'free' check (plan_tier in ('free','supporter','pro')),
    subscription_status text,
    current_period_end timestamptz,
    grace_period_ends_at timestamptz,
    enforcement_state text not null default 'active' check (enforcement_state in ('active','warned','unlisted','suspended')),
    enforcement_reason text,
    suspended_until timestamptz,
    disabled boolean not null default false,
    disabled_at timestamptz,
    updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists rescue_admins (
    id uuid primary key default gen_random_uuid(),
    rescue_id uuid not null references rescues(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null default 'admin',
    created_at timestamptz not null default timezone('utc', now()),
    unique (rescue_id, user_id)
);

create table if not exists rescue_members (
    id uuid primary key default gen_random_uuid(),
    rescue_id uuid not null references rescues(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null default 'owner' check (role in ('owner','admin','staff')),
    created_at timestamptz not null default timezone('utc', now()),
    unique (rescue_id, user_id)
);

create table if not exists animals (
    id uuid primary key default gen_random_uuid(),
    rescue_id uuid not null references rescues(id) on delete cascade,
    name text not null,
    species text not null,
    breed text,
    age text,
    sex text,
    description text,
    personality_traits text[] not null default '{}',
    energy_level text,
    good_with text[] not null default '{}',
    training text,
    medical_needs text,
    ideal_home text,
    status text not null default 'available' check (status in ('available', 'hold', 'adopted')),
    pipeline_stage text not null default 'available' check (pipeline_stage in ('intake','foster','available','hold','adopted')),
    tags text[] not null default '{}',
    is_active boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists animal_photos (
    id uuid primary key default gen_random_uuid(),
    animal_id uuid not null references animals(id) on delete cascade,
    image_url text not null,
    sort_order integer not null default 0,
    unique (animal_id, sort_order)
);

create table if not exists animal_stage_events (
    id uuid primary key default gen_random_uuid(),
    animal_id uuid not null references animals(id) on delete cascade,
    from_stage text,
    to_stage text not null,
    changed_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_animal_stage_events_animal on animal_stage_events(animal_id, created_at desc);

create table if not exists inquiries (
    id uuid primary key default gen_random_uuid(),
    animal_id uuid not null references animals(id) on delete restrict,
    rescue_id uuid not null references rescues(id) on delete restrict,
    adopter_name text not null,
    adopter_email text not null,
    message text,
    status text not null default 'new' check (status in ('new', 'contacted', 'meet_greet', 'application', 'approved', 'adopted', 'closed')),
    assigned_to uuid references auth.users(id),
    first_responded_at timestamptz,
    archived boolean not null default false,
    archived_at timestamptz,
    archived_by uuid references auth.users(id) on delete set null,
    public_token text not null default encode(gen_random_bytes(12), 'hex'),
    public_token_expires_at timestamptz,
    public_token_revoked_at timestamptz,
    closed_at timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create or replace function handle_updated_at() returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create or replace function handle_rescues_updated_at() returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists rescues_set_updated_at on rescues;
create trigger rescues_set_updated_at
before update on rescues
for each row
execute procedure handle_rescues_updated_at();

drop trigger if exists animals_set_updated_at on animals;
create trigger animals_set_updated_at
before update on animals
for each row
execute procedure handle_updated_at();

create or replace function set_inquiry_rescue_id() returns trigger as $$
declare
    animal_record animals;
begin
    select * into animal_record from animals where id = new.animal_id;
    if animal_record is null then
        raise exception 'Animal not found for inquiry';
    end if;
    new.rescue_id = animal_record.rescue_id;
    if new.public_token is null then
        new.public_token = encode(gen_random_bytes(12), 'hex');
    end if;
    return new;
end;
$$ language plpgsql;

drop trigger if exists inquiries_set_rescue_id on inquiries;
create trigger inquiries_set_rescue_id
before insert on inquiries
for each row
execute procedure set_inquiry_rescue_id();

drop trigger if exists inquiries_set_updated_at on inquiries;
create trigger inquiries_set_updated_at
before update on inquiries
for each row
execute procedure handle_updated_at();

-- Manage inquiry token expiry window based on lifecycle
create or replace function handle_inquiry_status_token_expiry() returns trigger as $$
declare
    closing boolean;
    reopening boolean;
begin
    closing := (old.status not in ('closed','adopted') and new.status in ('closed','adopted'));
    reopening := (old.status in ('closed','adopted') and new.status not in ('closed','adopted'));

    if closing then
        if new.closed_at is null then
            new.closed_at := timezone('utc', now());
        end if;
        if new.public_token_expires_at is null or new.public_token_expires_at < new.closed_at + interval '30 days' then
            new.public_token_expires_at := new.closed_at + interval '30 days';
        end if;
    elsif reopening then
        -- Keep audit trail of the first closure but re-open public link while inquiry is active again
        new.public_token_expires_at := null;
    end if;
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_inquiry_status_token_expiry on inquiries;
create trigger trg_inquiry_status_token_expiry
before update of status on inquiries
for each row
execute procedure handle_inquiry_status_token_expiry();

-- Guard verification state changes to trusted actors only
create or replace function guard_verification_fields() returns trigger as $$
begin
  if (new.verification_status is distinct from old.verification_status
      or new.verified_at is distinct from old.verified_at)
      and auth.role() <> 'service_role' then
    raise exception 'verification fields are managed by RescueOS trust & safety';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_guard_rescue_verification on rescues;
create trigger trg_guard_rescue_verification
before update on rescues
for each row
execute procedure guard_verification_fields();

-- Billing guardrails to keep paid tiers tied to a valid subscription window
create or replace function guard_billing_fields() returns trigger as $$
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
$$ language plpgsql;

drop trigger if exists trg_guard_billing on rescues;
create trigger trg_guard_billing
before update on rescues
for each row
execute procedure guard_billing_fields();

create index if not exists idx_animals_rescue_id on animals(rescue_id);
create index if not exists idx_animals_status_active on animals(status, is_active);
create index if not exists idx_animals_pipeline_stage on animals(rescue_id, pipeline_stage, status);
create index if not exists idx_photos_animal on animal_photos(animal_id, sort_order);
create index if not exists idx_inquiries_rescue on inquiries(rescue_id, created_at desc);
create index if not exists idx_inquiries_archived on inquiries(rescue_id, archived_at desc);
create index if not exists idx_inquiries_animal on inquiries(animal_id, created_at desc);
create index if not exists idx_inquiries_public_token on inquiries(public_token);
create index if not exists idx_inquiries_public_token_expires on inquiries(public_token, public_token_expires_at);
create index if not exists idx_inquiries_assigned on inquiries(rescue_id, assigned_to, status);
do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'inquiries_public_token_unique'
          and conrelid = 'inquiries'::regclass
    ) then
        alter table inquiries add constraint inquiries_public_token_unique unique (public_token);
    end if;
end;
$$;
create index if not exists idx_rescue_members_user on rescue_members(user_id);
create index if not exists idx_rescue_members_rescue on rescue_members(rescue_id);

-- Phase 3 CRM tables
create table if not exists inquiry_status_history (
    id uuid primary key default gen_random_uuid(),
    inquiry_id uuid not null references inquiries(id) on delete cascade,
    from_status text,
    to_status text not null,
    changed_by uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_inquiry_status_history_inquiry on inquiry_status_history(inquiry_id, created_at desc);

create table if not exists inquiry_notes (
    id uuid primary key default gen_random_uuid(),
    inquiry_id uuid not null references inquiries(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    author_user_id uuid not null references auth.users(id) on delete cascade,
    body text not null,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_inquiry_notes_inquiry on inquiry_notes(inquiry_id, created_at desc);

-- Inquiry events for timeline (status/assignment/notes)
create table if not exists inquiry_events (
    id uuid primary key default gen_random_uuid(),
    inquiry_id uuid not null references inquiries(id) on delete cascade,
    event_type text not null check (event_type in ('status_change','assignment_change','note','system')),
    from_status text,
    to_status text,
    from_assigned_to uuid references auth.users(id),
    to_assigned_to uuid references auth.users(id),
    note_body text,
    created_by uuid references auth.users(id),
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_inquiry_events_inquiry on inquiry_events(inquiry_id, created_at desc);

-- Phase 4: invitations and saved reply templates
create table if not exists rescue_invitations (
    id uuid primary key default gen_random_uuid(),
    rescue_id uuid not null references rescues(id) on delete cascade,
    email text not null,
    role text not null check (role in ('owner','admin','staff')),
    token text not null unique,
    created_by uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default timezone('utc', now()),
    expires_at timestamptz not null default timezone('utc', now()) + interval '7 days',
    accepted_at timestamptz,
    canceled_at timestamptz
);

create index if not exists idx_rescue_invitations_rescue on rescue_invitations(rescue_id, created_at desc);
create index if not exists idx_rescue_invitations_email on rescue_invitations(email);

create table if not exists saved_reply_templates (
    id uuid primary key default gen_random_uuid(),
    rescue_id uuid not null references rescues(id) on delete cascade,
    name text not null,
    subject text not null,
    body text not null,
    created_by uuid not null references auth.users(id) on delete cascade,
    updated_at timestamptz not null default timezone('utc', now()),
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_saved_reply_templates_rescue on saved_reply_templates(rescue_id, updated_at desc);

create table if not exists email_logs (
    id uuid primary key default gen_random_uuid(),
    rescue_id uuid not null references rescues(id) on delete cascade,
    inquiry_id uuid references inquiries(id) on delete set null,
    to_email text not null,
    subject text not null,
    status text not null check (status in ('sent', 'failed')),
    error_message text,
    send_type text check (send_type in ('system', 'template', 'follow_up', 'invite', 'other')) default 'other',
    template_id uuid references saved_reply_templates(id) on delete set null,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_email_logs_rescue on email_logs(rescue_id, created_at desc);
create index if not exists idx_email_logs_inquiry on email_logs(inquiry_id, created_at desc);

-- Verification requests
create table if not exists verification_requests (
    id uuid primary key default gen_random_uuid(),
    rescue_id uuid references rescues(id) on delete cascade,
    submitted_by uuid references auth.users(id),
    website_url text,
    instagram_url text,
    facebook_url text,
    ein text,
    legal_name text,
    notes text,
    requested_level text not null default 'identity' check (requested_level in ('identity','501c3')),
    decision_notes text,
    status text not null default 'pending' check (status in ('pending','in_review','needs_info','approved','rejected')),
    reviewer_user_id uuid references auth.users(id),
    reviewed_at timestamptz,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_verification_requests_rescue on verification_requests(rescue_id, created_at desc);
create index if not exists idx_verification_requests_status on verification_requests(status, created_at desc);

create table if not exists verification_audit_log (
    id uuid primary key default gen_random_uuid(),
    verification_request_id uuid references verification_requests(id) on delete cascade,
    from_status text,
    to_status text not null,
    changed_by uuid references auth.users(id),
    notes text,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_verification_audit_request on verification_audit_log(verification_request_id, created_at desc);

-- Abuse reports
create table if not exists abuse_reports (
    id uuid primary key default gen_random_uuid(),
    reporter_email text,
    reporter_name text,
    type text not null check (type in ('rescue','animal','inquiry')),
    rescue_id uuid references rescues(id) on delete set null,
    animal_id uuid references animals(id) on delete set null,
    inquiry_id uuid references inquiries(id) on delete set null,
    message text not null,
    status text not null default 'open' check (status in ('open','triaged','closed')),
    outcome text check (outcome in ('pending','dismissed','warned','hidden','suspended')),
    resolved_at timestamptz,
    resolved_by uuid references auth.users(id),
    resolution_notes text,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_abuse_reports_type on abuse_reports(type, created_at desc);
create index if not exists idx_abuse_reports_rescue on abuse_reports(rescue_id, created_at desc);
create index if not exists idx_abuse_reports_status on abuse_reports(status, created_at desc);

create table if not exists moderation_actions (
    id uuid primary key default gen_random_uuid(),
    rescue_id uuid references rescues(id) on delete cascade,
    animal_id uuid references animals(id) on delete cascade,
    inquiry_id uuid references inquiries(id) on delete cascade,
    report_id uuid references abuse_reports(id) on delete set null,
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

create index if not exists idx_moderation_actions_rescue on moderation_actions(rescue_id, created_at desc);
create index if not exists idx_moderation_actions_active on moderation_actions(rescue_id, action_type, expires_at, resolved) where resolved = false;
create index if not exists idx_moderation_actions_rescue_resolved on moderation_actions(rescue_id, resolved, created_at desc);

-- Helper to check whether a rescue is blocked/unlisted by moderation.
-- SECURITY: security definer with search_path fixed; returns only a boolean and cannot leak row contents.
create or replace function rescue_is_blocked(p_rescue_id uuid)
returns boolean
security definer
set search_path = public
language sql
stable
as $$
    select exists (
        select 1
        from moderation_actions ma
        where ma.rescue_id = p_rescue_id
          and ma.resolved = false
          and ma.action_type in ('unlist','suspend','hide')
          and (ma.expires_at is null or ma.expires_at > timezone('utc', now()))
    );
$$;

-- Partner leads
create table if not exists partner_leads (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null,
    org text,
    message text,
    created_at timestamptz not null default timezone('utc', now())
);

-- Support payments (one-time sponsor logging)
create table if not exists support_payments (
    id uuid primary key default gen_random_uuid(),
    email text,
    amount_cents integer,
    currency text default 'usd',
    stripe_payment_intent_id text,
    created_at timestamptz not null default timezone('utc', now())
);

-- Shortlists for shared saved items
create table if not exists shortlists (
    id uuid primary key default gen_random_uuid(),
    token text not null unique,
    animal_ids uuid[] not null default '{}',
    rescue_ids uuid[] not null default '{}',
    payload jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    expires_at timestamptz not null default timezone('utc', now()) + interval '90 days',
    revoked_at timestamptz
);

create index if not exists idx_shortlists_created on shortlists(created_at desc);
create index if not exists idx_shortlists_token_expires on shortlists(token, expires_at);

-- Saved search alerts (beta)
create table if not exists saved_search_alerts (
    id uuid primary key default gen_random_uuid(),
    kind text not null check (kind in ('rescue_directory','rescue_animals')),
    rescue_id uuid references rescues(id) on delete cascade,
    email text not null,
    frequency text not null check (frequency in ('daily','weekly')),
    query_params jsonb not null,
    last_notified_at timestamptz,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_saved_search_alerts_kind on saved_search_alerts(kind, created_at desc);
create index if not exists idx_saved_search_alerts_rescue on saved_search_alerts(rescue_id);

alter table if exists shortlists enable row level security;
alter table if exists saved_search_alerts enable row level security;

drop policy if exists "Shortlists public insert" on shortlists;
create policy "Shortlists public insert" on shortlists
    for insert with check (auth.role() in ('anon','authenticated','service_role'));

drop policy if exists "Shortlists public read valid" on shortlists;
create policy "Shortlists public read valid" on shortlists
    for select using (
        auth.role() in ('anon','authenticated')
        and revoked_at is null
        and expires_at > timezone('utc', now())
        and token = coalesce(current_setting('request.headers.x-shortlist-token', true), '')
    );

drop policy if exists "Shortlists service read" on shortlists;
create policy "Shortlists service read" on shortlists
    for select using (auth.role() = 'service_role');

drop policy if exists "Shortlists service manage" on shortlists;
create policy "Shortlists service manage" on shortlists
    for update using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

drop policy if exists "Saved search public insert" on saved_search_alerts;
create policy "Saved search public insert" on saved_search_alerts
    for insert with check (auth.role() in ('anon','authenticated','service_role'));

drop policy if exists "Saved search service read" on saved_search_alerts;
create policy "Saved search service read" on saved_search_alerts
    for select using (auth.role() = 'service_role');

drop policy if exists "Saved search service manage" on saved_search_alerts;
create policy "Saved search service manage" on saved_search_alerts
    for update using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- Verification bookkeeping and public badge definitions
create or replace function mark_rescue_verification_submitted() returns trigger as $$
begin
  if new.rescue_id is not null then
    update rescues
    set verification_submitted_at = coalesce(verification_submitted_at, new.created_at)
    where id = new.rescue_id;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_verification_request_submit on verification_requests;
create trigger trg_verification_request_submit
after insert on verification_requests
for each row
execute procedure mark_rescue_verification_submitted();

create or replace function log_and_apply_verification() returns trigger as $$
declare
  approver uuid;
  new_status text;
begin
  if new.status is distinct from old.status then
    approver := coalesce(auth.uid(), new.reviewer_user_id, old.reviewer_user_id);
    insert into verification_audit_log (verification_request_id, from_status, to_status, changed_by, notes)
    values (new.id, old.status, new.status, approver, new.decision_notes);

    if new.rescue_id is not null then
      if new.status = 'approved' then
        new_status := case when new.requested_level = '501c3' then 'verified_501c3' else 'verified' end;
        update rescues
        set verification_status = new_status,
            verified_at = timezone('utc', now()),
            verification_submitted_at = coalesce(verification_submitted_at, new.created_at)
        where id = new.rescue_id;
      elsif new.status = 'rejected' then
        update rescues
        set verification_status = 'unverified',
            verified_at = null
        where id = new.rescue_id;
      end if;
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_verification_request_apply on verification_requests;
create trigger trg_verification_request_apply
after update on verification_requests
for each row
execute procedure log_and_apply_verification();

create or replace view verification_badges as
select 'unverified'::text as status, 'Unverified'::text as label, 'Rescue has not completed verification yet.'::text as description
union all
select 'verified', 'Identity verified', 'Rescue identity and presence confirmed by RescueOS.'
union all
select 'verified_501c3', '501(c)(3) verified', 'Nonprofit status verified via EIN/IRS lookup.';

-- Public-facing view for rescues
drop view if exists public_rescues;
create or replace view public_rescues as
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
    disabled,
    is_public,
    created_at,
    updated_at,
    application_required,
    home_visit,
    fenced_yard_required,
    cats_ok,
    dogs_ok,
    kids_ok,
    adoption_fee_range
from rescues;

drop policy if exists "public rescues readable" on rescues;
create policy "public rescues readable" on rescues
    for select using (is_public is true and slug is not null and disabled is false and not rescue_is_blocked(rescues.id));

-- Storage bucket for rescue media (public read)
insert into storage.buckets (id, name, public)
values ('rescue-media', 'rescue-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read rescue-media" on storage.objects;
create policy "Public read rescue-media" on storage.objects
    for select using (bucket_id = 'rescue-media');

drop policy if exists "Members write rescue-media" on storage.objects;
create policy "Members write rescue-media" on storage.objects
    for insert with check (
        bucket_id = 'rescue-media'
        and exists (
            select 1 from rescue_members rm
            where rm.user_id = auth.uid()
              and rm.rescue_id = split_part(name, '/', 1)::uuid
        )
    );

drop policy if exists "Members update rescue-media" on storage.objects;
create policy "Members update rescue-media" on storage.objects
    for update using (
        bucket_id = 'rescue-media'
        and exists (
            select 1 from rescue_members rm
            where rm.user_id = auth.uid()
              and rm.rescue_id = split_part(name, '/', 1)::uuid
        )
    );

drop policy if exists "Members delete rescue-media" on storage.objects;
create policy "Members delete rescue-media" on storage.objects
    for delete using (
        bucket_id = 'rescue-media'
        and exists (
            select 1 from rescue_members rm
            where rm.user_id = auth.uid()
              and rm.rescue_id = split_part(name, '/', 1)::uuid
        )
    );

-- Verification audit log (service visibility only)
alter table if exists verification_audit_log enable row level security;

drop policy if exists "Verification audit service read" on verification_audit_log;
create policy "Verification audit service read" on verification_audit_log
    for select using (auth.role() = 'service_role');

drop policy if exists "Verification audit service manage" on verification_audit_log;
create policy "Verification audit service manage" on verification_audit_log
    for all using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- Moderation actions: readable by affected rescues, managed by service role
alter table if exists moderation_actions enable row level security;

drop policy if exists "Moderation actions rescue read" on moderation_actions;
create policy "Moderation actions rescue read" on moderation_actions
    for select using (
        auth.role() = 'service_role'
        or exists (
            select 1 from rescue_members rm
            where rm.rescue_id = moderation_actions.rescue_id
              and rm.user_id = auth.uid()
        )
    );

drop policy if exists "Moderation actions service manage" on moderation_actions;
create policy "Moderation actions service manage" on moderation_actions
    for all using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- Profiles for human-friendly names
create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null,
    full_name text,
    email text,
    phone text,
    title text,
    avatar_url text,
    role text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create or replace function handle_profiles_updated_at() returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
before update on profiles
for each row
execute procedure handle_profiles_updated_at();

alter table profiles enable row level security;

drop policy if exists "Profiles select own" on profiles;
create policy "Profiles select own" on profiles for select using (auth.uid() = id);
drop policy if exists "Profiles insert own" on profiles;
create policy "Profiles insert own" on profiles for insert with check (auth.uid() = id);
drop policy if exists "Profiles update own" on profiles;
create policy "Profiles update own" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Security definer helper to return member directory for a rescue
create or replace function get_rescue_members(p_rescue_id uuid)
returns table (
    rescue_id uuid,
    user_id uuid,
    role text,
    joined_at timestamptz,
    display_name text,
    email text
) security definer set search_path = public as $$
begin
    if not exists (
        select 1 from rescue_members rm where rm.rescue_id = p_rescue_id and rm.user_id = auth.uid()
    ) then
        raise exception 'Not authorized for this rescue';
    end if;

    return query
    select
        rm.rescue_id,
        rm.user_id,
        rm.role,
        rm.created_at as joined_at,
        coalesce(p.full_name, p.display_name, split_part(au.email, '@', 1)) as display_name,
        au.email
    from rescue_members rm
    left join profiles p on p.id = rm.user_id
    left join auth.users au on au.id = rm.user_id
    where rm.rescue_id = p_rescue_id;
end;
$$ language plpgsql;

create or replace view rescue_pending_invitations as
select *
from rescue_invitations
where accepted_at is null
  and canceled_at is null;
