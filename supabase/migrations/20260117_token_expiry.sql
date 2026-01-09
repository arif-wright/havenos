-- Token expiry and revocation for shortlists and inquiry public links

-- Shortlists: expiry + revocation
alter table if exists shortlists add column if not exists expires_at timestamptz not null default timezone('utc', now()) + interval '90 days';
alter table if exists shortlists add column if not exists revoked_at timestamptz;
alter table if exists shortlists add column if not exists created_at timestamptz not null default timezone('utc', now());

create index if not exists idx_shortlists_token_expires on shortlists(token, expires_at);

-- Inquiries: token expiry and revocation
alter table if exists inquiries add column if not exists public_token_expires_at timestamptz;
alter table if exists inquiries add column if not exists public_token_revoked_at timestamptz;
alter table if exists inquiries add column if not exists closed_at timestamptz;

create index if not exists idx_inquiries_public_token_expires on inquiries(public_token, public_token_expires_at);
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

-- Trigger to manage closed_at and token expiry window
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
        -- allow token to be valid again while open
        new.public_token_expires_at := null;
        -- keep closed_at for auditing
    end if;
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_inquiry_status_token_expiry on inquiries;
create trigger trg_inquiry_status_token_expiry
before update of status on inquiries
for each row
execute procedure handle_inquiry_status_token_expiry();

-- Shortlist RLS tightening for public reads
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
