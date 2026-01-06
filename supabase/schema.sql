-- HavenOS core schema for Phase 1
create extension if not exists "pgcrypto";

create table if not exists rescues (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    contact_email text not null,
    mission_statement text,
    adoption_process text,
    response_time_text text,
    created_at timestamptz not null default timezone('utc', now()),
    tagline text,
    location_text text,
    website_url text,
    facebook_url text,
    instagram_url text,
    donation_url text,
    logo_url text,
    cover_url text,
    response_time_enum text,
    adoption_steps jsonb,
    is_public boolean not null default true,
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
    status text not null default 'available' check (status in ('available', 'hold', 'adopted')),
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

create table if not exists inquiries (
    id uuid primary key default gen_random_uuid(),
    animal_id uuid not null references animals(id) on delete restrict,
    rescue_id uuid not null references rescues(id) on delete restrict,
    adopter_name text not null,
    adopter_email text not null,
    message text,
    status text not null default 'new' check (status in ('new', 'contacted', 'meet_greet', 'application', 'approved', 'adopted', 'closed')),
    first_responded_at timestamptz,
    archived_at timestamptz,
    archived_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default timezone('utc', now())
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
    return new;
end;
$$ language plpgsql;

drop trigger if exists inquiries_set_rescue_id on inquiries;
create trigger inquiries_set_rescue_id
before insert on inquiries
for each row
execute procedure set_inquiry_rescue_id();

create index if not exists idx_animals_rescue_id on animals(rescue_id);
create index if not exists idx_animals_status_active on animals(status, is_active);
create index if not exists idx_photos_animal on animal_photos(animal_id, sort_order);
create index if not exists idx_inquiries_rescue on inquiries(rescue_id, created_at desc);
create index if not exists idx_inquiries_archived on inquiries(rescue_id, archived_at desc);
create index if not exists idx_inquiries_animal on inquiries(animal_id, created_at desc);
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
    body text not null,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_inquiry_notes_inquiry on inquiry_notes(inquiry_id, created_at desc);

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
    accepted_at timestamptz
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

-- Public-facing view for rescues
create or replace view public_rescues as
select
    id,
    name,
    slug,
    tagline,
    location_text,
    mission_statement,
    adoption_process,
    response_time_enum,
    adoption_steps,
    website_url,
    facebook_url,
    instagram_url,
    donation_url,
    logo_url,
    cover_url,
    is_public,
    created_at,
    updated_at
from rescues;

drop policy if exists "public rescues readable" on rescues;
create policy "public rescues readable" on rescues
    for select using (is_public is true and slug is not null);

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

-- Profiles for human-friendly names
create table if not exists profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null,
    email text,
    phone text,
    title text,
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

-- Invitations cancelation support
alter table rescue_invitations
    add column if not exists canceled_at timestamptz;

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
        coalesce(p.display_name, split_part(au.email, '@', 1)) as display_name,
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
