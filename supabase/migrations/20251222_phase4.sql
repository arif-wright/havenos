-- Phase 4: invitations, reply templates, trust fields, email log enhancements

-- rescue public profile trust fields
alter table rescues
    add column if not exists mission_statement text,
    add column if not exists adoption_process text,
    add column if not exists response_time_text text;

-- invitations
create table if not exists rescue_invitations (
    id uuid primary key default gen_random_uuid(),
    rescue_id uuid not null references rescues(id) on delete cascade,
    email text not null,
    role text not null check (role in ('owner', 'admin', 'staff')),
    token text not null unique,
    created_by uuid not null references auth.users(id) on delete cascade,
    created_at timestamptz not null default timezone('utc', now()),
    expires_at timestamptz not null default timezone('utc', now()) + interval '7 days',
    accepted_at timestamptz
);

create index if not exists idx_rescue_invitations_rescue on rescue_invitations(rescue_id, created_at desc);
create index if not exists idx_rescue_invitations_email on rescue_invitations(email);

-- saved reply templates
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

-- email logs: add send_type and template linkage
alter table email_logs
    add column if not exists send_type text check (send_type in ('system', 'template', 'follow_up', 'invite', 'other')) default 'other',
    add column if not exists template_id uuid references saved_reply_templates(id) on delete set null;

-- RLS enablement
alter table rescue_invitations enable row level security;
alter table saved_reply_templates enable row level security;

-- rescue_invitations policies
drop policy if exists "Members read rescue_invitations" on rescue_invitations;
create policy "Members read rescue_invitations" on rescue_invitations
    for select using (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = rescue_invitations.rescue_id
              and rm.user_id = auth.uid()
        )
    );

drop policy if exists "Owners admins manage rescue_invitations" on rescue_invitations;
create policy "Owners admins manage rescue_invitations" on rescue_invitations
    for all using (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = rescue_invitations.rescue_id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    )
    with check (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = rescue_invitations.rescue_id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    );

-- saved_reply_templates policies
drop policy if exists "Members read saved_reply_templates" on saved_reply_templates;
create policy "Members read saved_reply_templates" on saved_reply_templates
    for select using (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = saved_reply_templates.rescue_id
              and rm.user_id = auth.uid()
        )
    );

drop policy if exists "Owners admins manage saved_reply_templates" on saved_reply_templates;
create policy "Owners admins manage saved_reply_templates" on saved_reply_templates
    for all using (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = saved_reply_templates.rescue_id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    )
    with check (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = saved_reply_templates.rescue_id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    );
