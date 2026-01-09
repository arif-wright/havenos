-- Nice-to-have adopter features (favorites, inquiry status tokens, saved searches)

-- Inquiry public token + timestamps for adopter status page
alter table if exists inquiries add column if not exists public_token text;
alter table if exists inquiries add column if not exists updated_at timestamptz not null default timezone('utc', now());
update inquiries set public_token = coalesce(public_token, encode(gen_random_bytes(12), 'hex')), updated_at = coalesce(updated_at, created_at);
alter table if exists inquiries alter column public_token set default encode(gen_random_bytes(12), 'hex');
alter table if exists inquiries alter column public_token set not null;
alter table if exists inquiries add constraint inquiries_public_token_unique unique (public_token);
create index if not exists idx_inquiries_public_token on inquiries(public_token);

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

-- Shortlists for sharing saved pets/rescues
create table if not exists shortlists (
    id uuid primary key default gen_random_uuid(),
    token text not null unique,
    animal_ids uuid[] not null default '{}',
    rescue_ids uuid[] not null default '{}',
    payload jsonb,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_shortlists_created on shortlists(created_at desc);

alter table shortlists enable row level security;

drop policy if exists "Shortlists public insert" on shortlists;
create policy "Shortlists public insert" on shortlists
    for insert with check (auth.role() in ('anon','authenticated','service_role'));

drop policy if exists "Shortlists service read" on shortlists;
create policy "Shortlists service read" on shortlists
    for select using (auth.role() = 'service_role');

drop policy if exists "Shortlists service manage" on shortlists;
create policy "Shortlists service manage" on shortlists
    for update using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

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

alter table saved_search_alerts enable row level security;

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
