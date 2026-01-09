-- Inquiry power tools: assignment, events, expanded notes

alter table if exists inquiries add column if not exists assigned_to uuid references auth.users(id);

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

alter table inquiry_events enable row level security;

drop policy if exists "Inquiry events rescue read" on inquiry_events;
create policy "Inquiry events rescue read" on inquiry_events
    for select using (
        exists (
            select 1 from inquiries i
            join rescue_members rm on rm.rescue_id = i.rescue_id
            where i.id = inquiry_events.inquiry_id
              and rm.user_id = auth.uid()
        )
        or auth.role() = 'service_role'
    );

drop policy if exists "Inquiry events insert rescue" on inquiry_events;
create policy "Inquiry events insert rescue" on inquiry_events
    for insert with check (
        exists (
            select 1 from inquiries i
            join rescue_members rm on rm.rescue_id = i.rescue_id
            where i.id = inquiry_events.inquiry_id
              and rm.user_id = auth.uid()
        )
        or auth.role() = 'service_role'
    );

alter table if exists inquiry_notes add column if not exists author_user_id uuid references auth.users(id);
update inquiry_notes set author_user_id = coalesce(author_user_id, user_id);
alter table inquiry_notes alter column author_user_id set not null;
