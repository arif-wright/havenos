-- HavenOS core schema for Phase 1
create extension if not exists "pgcrypto";

create table if not exists rescues (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    slug text not null unique,
    contact_email text not null,
    created_at timestamptz not null default timezone('utc', now())
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
    status text not null default 'new' check (status in ('new', 'responded', 'closed')),
    created_at timestamptz not null default timezone('utc', now())
);

create or replace function handle_updated_at() returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

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
create index if not exists idx_inquiries_animal on inquiries(animal_id, created_at desc);
create index if not exists idx_rescue_members_user on rescue_members(user_id);
create index if not exists idx_rescue_members_rescue on rescue_members(rescue_id);
