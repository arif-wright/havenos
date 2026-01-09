-- Trust & transparency upgrades: adoption checklist fields and activity signal

alter table if exists rescues
    add column if not exists application_required boolean not null default false,
    add column if not exists home_visit boolean not null default false,
    add column if not exists fenced_yard_required boolean not null default false,
    add column if not exists cats_ok boolean not null default false,
    add column if not exists dogs_ok boolean not null default false,
    add column if not exists kids_ok boolean not null default false,
    add column if not exists adoption_fee_range text;

-- Ensure public view surfaces new checklist fields
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

