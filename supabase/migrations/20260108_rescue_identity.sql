-- Rescue identity upgrade: slug/tagline/socials/media/adoption info
alter table public.rescues
    add column if not exists tagline text,
    add column if not exists location_text text,
    add column if not exists website_url text,
    add column if not exists facebook_url text,
    add column if not exists instagram_url text,
    add column if not exists donation_url text,
    add column if not exists logo_url text,
    add column if not exists cover_url text,
    add column if not exists response_time_enum text,
    add column if not exists adoption_steps jsonb,
    add column if not exists is_public boolean not null default true,
    add column if not exists updated_at timestamptz not null default timezone('utc', now());

-- Ensure slug remains unique (was already unique in schema; keep)
create unique index if not exists idx_rescues_slug_unique on public.rescues(slug);

create or replace function public.handle_rescues_updated_at() returns trigger as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$ language plpgsql;

drop trigger if exists rescues_set_updated_at on public.rescues;
create trigger rescues_set_updated_at
before update on public.rescues
for each row
execute procedure public.handle_rescues_updated_at();

-- Public-facing view with safe columns
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
    response_time_enum,
    adoption_steps,
    website_url,
    facebook_url,
    instagram_url,
    donation_url,
    logo_url,
    cover_url,
    is_public
from public.rescues;

alter view public.public_rescues owner to postgres;

-- RLS on base rescues table for public read via view
drop policy if exists "public rescues readable" on public.rescues;
create policy "public rescues readable" on public.rescues
    for select using (is_public is true and slug is not null);

-- Storage bucket for rescue media
insert into storage.buckets (id, name, public)
values ('rescue-media', 'rescue-media', true)
on conflict (id) do nothing;

-- Allow public reads
drop policy if exists "Public read rescue-media" on storage.objects;
create policy "Public read rescue-media" on storage.objects
    for select using (bucket_id = 'rescue-media');

-- Authenticated rescue members can write within their folder
drop policy if exists "Members write rescue-media" on storage.objects;
create policy "Members write rescue-media" on storage.objects
    for insert with check (
        bucket_id = 'rescue-media'
        and exists (
            select 1 from public.rescue_members rm
            where rm.user_id = auth.uid()
              and rm.rescue_id = split_part(name, '/', 1)::uuid
        )
    );

drop policy if exists "Members update rescue-media" on storage.objects;
create policy "Members update rescue-media" on storage.objects
    for update using (
        bucket_id = 'rescue-media'
        and exists (
            select 1 from public.rescue_members rm
            where rm.user_id = auth.uid()
              and rm.rescue_id = split_part(name, '/', 1)::uuid
        )
    );

drop policy if exists "Members delete rescue-media" on storage.objects;
create policy "Members delete rescue-media" on storage.objects
    for delete using (
        bucket_id = 'rescue-media'
        and exists (
            select 1 from public.rescue_members rm
            where rm.user_id = auth.uid()
              and rm.rescue_id = split_part(name, '/', 1)::uuid
        )
    );
