-- Profiles table to store human-friendly names and optional contact info
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null,
    email text,
    phone text,
    title text,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_profiles_updated_at() returns trigger as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute procedure public.handle_profiles_updated_at();

alter table public.profiles enable row level security;

-- Only allow users to manage their own profile
drop policy if exists "Profiles select own" on public.profiles;
create policy "Profiles select own" on public.profiles
    for select using (auth.uid() = id);

drop policy if exists "Profiles insert own" on public.profiles;
create policy "Profiles insert own" on public.profiles
    for insert with check (auth.uid() = id);

drop policy if exists "Profiles update own" on public.profiles;
create policy "Profiles update own" on public.profiles
    for update using (auth.uid() = id) with check (auth.uid() = id);

-- Add canceled_at to invitations for safe cancelation
alter table public.rescue_invitations
    add column if not exists canceled_at timestamptz;

-- Security definer helper to return member directory (name + email) only for members of the same rescue
create or replace function public.get_rescue_members(p_rescue_id uuid)
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
        select 1 from public.rescue_members rm
        where rm.rescue_id = p_rescue_id
          and rm.user_id = auth.uid()
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
    from public.rescue_members rm
    left join public.profiles p on p.id = rm.user_id
    left join auth.users au on au.id = rm.user_id
    where rm.rescue_id = p_rescue_id;
end;
$$ language plpgsql;

-- A helper view for pending invitations (excludes accepted/canceled)
create or replace view public.rescue_pending_invitations as
select *
from public.rescue_invitations
where accepted_at is null
  and canceled_at is null;
