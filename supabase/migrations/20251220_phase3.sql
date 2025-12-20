-- Phase 3 CRM migration

-- expand inquiry statuses
alter table inquiries
    drop constraint if exists inquiries_status_check;
alter table inquiries
    add constraint inquiries_status_check
    check (status in ('new', 'contacted', 'meet_greet', 'application', 'approved', 'adopted', 'closed'));

-- new tables
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

create table if not exists email_logs (
    id uuid primary key default gen_random_uuid(),
    rescue_id uuid not null references rescues(id) on delete cascade,
    inquiry_id uuid references inquiries(id) on delete set null,
    to_email text not null,
    subject text not null,
    status text not null check (status in ('sent', 'failed')),
    error_message text,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_email_logs_rescue on email_logs(rescue_id, created_at desc);
create index if not exists idx_email_logs_inquiry on email_logs(inquiry_id, created_at desc);

-- RLS for new tables
alter table inquiry_status_history enable row level security;
alter table inquiry_notes enable row level security;
alter table email_logs enable row level security;

drop policy if exists "Members read inquiry_status_history" on inquiry_status_history;
create policy "Members read inquiry_status_history" on inquiry_status_history
    for select using (
        exists (
            select 1 from inquiries i
            where i.id = inquiry_status_history.inquiry_id
              and i.rescue_id in (select rescue_id from rescue_members rm where rm.user_id = auth.uid())
        )
    );

drop policy if exists "Members insert inquiry_status_history" on inquiry_status_history;
create policy "Members insert inquiry_status_history" on inquiry_status_history
    for insert with check (
        exists (
            select 1 from inquiries i
            where i.id = inquiry_status_history.inquiry_id
              and i.rescue_id in (select rescue_id from rescue_members rm where rm.user_id = auth.uid())
        )
    );

drop policy if exists "Members read inquiry_notes" on inquiry_notes;
create policy "Members read inquiry_notes" on inquiry_notes
    for select using (
        exists (
            select 1 from inquiries i
            where i.id = inquiry_notes.inquiry_id
              and i.rescue_id in (select rescue_id from rescue_members rm where rm.user_id = auth.uid())
        )
    );

drop policy if exists "Members insert inquiry_notes" on inquiry_notes;
create policy "Members insert inquiry_notes" on inquiry_notes
    for insert with check (
        exists (
            select 1 from inquiries i
            where i.id = inquiry_notes.inquiry_id
              and i.rescue_id in (select rescue_id from rescue_members rm where rm.user_id = auth.uid())
        )
    );

drop policy if exists "Members read email_logs" on email_logs;
create policy "Members read email_logs" on email_logs
    for select using (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = email_logs.rescue_id
              and rm.user_id = auth.uid()
        )
    );

drop policy if exists "Service inserts email_logs" on email_logs;
create policy "Service inserts email_logs" on email_logs
    for insert with check (auth.role() = 'service_role');
