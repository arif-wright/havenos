-- Row Level Security policies for RescueOS (Model A)

-- Enable RLS
alter table rescues enable row level security;
alter table rescue_admins enable row level security;
alter table rescue_members enable row level security;
alter table animals enable row level security;
alter table animal_photos enable row level security;
alter table inquiries enable row level security;
alter table inquiry_status_history enable row level security;
alter table inquiry_notes enable row level security;
alter table email_logs enable row level security;
alter table rescue_invitations enable row level security;
alter table profiles enable row level security;
alter table verification_requests enable row level security;
alter table abuse_reports enable row level security;
alter table partner_leads enable row level security;
alter table support_payments enable row level security;

-- rescues
drop policy if exists "Public rescue read" on rescues;
create policy "Public rescue read" on rescues
    for select using (is_public is true and disabled is false and slug is not null);

drop policy if exists "Members read their rescue" on rescues;
create policy "Members read their rescue" on rescues
    for select using (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = rescues.id
              and rm.user_id = auth.uid()
        )
    );

drop policy if exists "Members manage their rescue rows" on rescues;
create policy "Members manage their rescue rows" on rescues
    for update using (
        auth.uid() = owner_user_id or exists (
            select 1 from rescue_members rm
            where rm.rescue_id = rescues.id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    )
    with check (
        auth.uid() = owner_user_id or exists (
            select 1 from rescue_members rm
            where rm.rescue_id = rescues.id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    );

drop policy if exists "Users create rescues as owner" on rescues;
create policy "Users create rescues as owner" on rescues
    for insert with check (auth.uid() is not null and owner_user_id = auth.uid());

-- rescue_members
drop policy if exists "Members read rescue_members" on rescue_members;
create policy "Members read rescue_members" on rescue_members
    for select using (
        user_id = auth.uid()
        or rescue_id in (select rescue_id from rescue_members rm2 where rm2.user_id = auth.uid())
    );

drop policy if exists "Members insert themselves" on rescue_members;
create policy "Members insert themselves" on rescue_members
    for insert with check (user_id = auth.uid());

drop policy if exists "Owners manage memberships" on rescue_members;
create policy "Owners manage memberships" on rescue_members
    for update using (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = rescue_members.rescue_id
              and rm.user_id = auth.uid()
              and rm.role = 'owner'
        )
    )
    with check (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = rescue_members.rescue_id
              and rm.user_id = auth.uid()
              and rm.role = 'owner'
        )
    );

drop policy if exists "Service role manages rescue_members" on rescue_members;
create policy "Service role manages rescue_members" on rescue_members
    for all using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- animals
drop policy if exists "Public animal read" on animals;
create policy "Public animal read" on animals
    for select using (is_active and status in ('available','hold') and not exists (select 1 from rescues r where r.id = animals.rescue_id and r.disabled));

drop policy if exists "Admins manage their animals" on animals;
create policy "Admins manage their animals" on animals
    for all using (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = animals.rescue_id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    )
    with check (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = animals.rescue_id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    );

-- animal photos
drop policy if exists "Public photo read" on animal_photos;
create policy "Public photo read" on animal_photos
    for select using (
        exists (
            select 1 from animals
            join rescues r on r.id = animals.rescue_id
            where animals.id = animal_photos.animal_id
              and animals.is_active
              and animals.status in ('available','hold')
              and not r.disabled
        )
    );

drop policy if exists "Admins manage their photos" on animal_photos;
create policy "Admins manage their photos" on animal_photos
    for all using (
        exists (
            select 1 from animals
            join rescue_members rm on rm.rescue_id = animals.rescue_id
            where animals.id = animal_photos.animal_id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    )
    with check (
        exists (
            select 1 from animals
            join rescue_members rm on rm.rescue_id = animals.rescue_id
            where animals.id = animal_photos.animal_id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    );

-- inquiries
drop policy if exists "Public inquiry insert" on inquiries;
create policy "Public inquiry insert" on inquiries
    for insert with check (
        exists (
            select 1 from animals
            where animals.id = inquiries.animal_id
              and animals.is_active
        )
    );

drop policy if exists "Admins read their inquiries" on inquiries;
create policy "Admins read their inquiries" on inquiries
    for select using (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = inquiries.rescue_id
              and rm.user_id = auth.uid()
        )
    );

drop policy if exists "Admins update their inquiries" on inquiries;
create policy "Admins update their inquiries" on inquiries
    for update using (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = inquiries.rescue_id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    )
    with check (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = inquiries.rescue_id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    );

-- inquiry_status_history
drop policy if exists "Members read inquiry_status_history" on inquiry_status_history;
create policy "Members read inquiry_status_history" on inquiry_status_history
    for select using (
        exists (
            select 1 from inquiries i
            where i.id = inquiry_status_history.inquiry_id
              and i.rescue_id in (
                  select rescue_id from rescue_members rm where rm.user_id = auth.uid()
              )
        )
    );

drop policy if exists "Members insert inquiry_status_history" on inquiry_status_history;
create policy "Members insert inquiry_status_history" on inquiry_status_history
    for insert with check (
        exists (
            select 1 from inquiries i
            where i.id = inquiry_status_history.inquiry_id
              and i.rescue_id in (
                  select rescue_id from rescue_members rm where rm.user_id = auth.uid()
              )
        )
    );

-- inquiry_notes
drop policy if exists "Members read inquiry_notes" on inquiry_notes;
create policy "Members read inquiry_notes" on inquiry_notes
    for select using (
        exists (
            select 1 from inquiries i
            where i.id = inquiry_notes.inquiry_id
              and i.rescue_id in (
                  select rescue_id from rescue_members rm where rm.user_id = auth.uid()
              )
        )
    );

drop policy if exists "Members insert inquiry_notes" on inquiry_notes;
create policy "Members insert inquiry_notes" on inquiry_notes
    for insert with check (
        exists (
            select 1 from inquiries i
            where i.id = inquiry_notes.inquiry_id
              and i.rescue_id in (
                  select rescue_id from rescue_members rm where rm.user_id = auth.uid()
              )
        )
    );

-- email_logs
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

-- rescue_invitations
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

-- profiles
drop policy if exists "Profiles select self or teammates" on profiles;
create policy "Profiles select self or teammates" on profiles
    for select using (
        auth.uid() = id
        or id in (
            select rm.user_id
            from rescue_members rm
            where rm.rescue_id in (
                select rescue_id from rescue_members where user_id = auth.uid()
            )
        )
    );

drop policy if exists "Profiles insert own" on profiles;
create policy "Profiles insert own" on profiles
    for insert with check (auth.uid() = id);

drop policy if exists "Profiles update own" on profiles;
create policy "Profiles update own" on profiles
    for update using (auth.uid() = id) with check (auth.uid() = id);

-- verification_requests
drop policy if exists "Verification select own rescue" on verification_requests;
create policy "Verification select own rescue" on verification_requests
    for select using (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = verification_requests.rescue_id
              and rm.user_id = auth.uid()
        )
        or auth.role() = 'service_role'
    );

drop policy if exists "Verification insert by rescue admin" on verification_requests;
create policy "Verification insert by rescue admin" on verification_requests
    for insert with check (
        exists (
            select 1 from rescue_members rm
            where rm.rescue_id = verification_requests.rescue_id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
    );

drop policy if exists "Verification admin update" on verification_requests;
create policy "Verification admin update" on verification_requests
    for update using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- abuse_reports
drop policy if exists "Abuse reports public insert" on abuse_reports;
create policy "Abuse reports public insert" on abuse_reports
    for insert with check (true);

drop policy if exists "Abuse reports admin access" on abuse_reports;
create policy "Abuse reports admin access" on abuse_reports
    for select using (auth.role() = 'service_role');

drop policy if exists "Abuse reports admin update" on abuse_reports;
create policy "Abuse reports admin update" on abuse_reports
    for update using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- partner_leads
drop policy if exists "Partner leads public insert" on partner_leads;
create policy "Partner leads public insert" on partner_leads
    for insert with check (true);

drop policy if exists "Partner leads admin read" on partner_leads;
create policy "Partner leads admin read" on partner_leads
    for select using (auth.role() = 'service_role');

-- support_payments
drop policy if exists "Support payments public insert" on support_payments;
create policy "Support payments public insert" on support_payments
    for insert with check (true);

drop policy if exists "Support payments admin read" on support_payments;
create policy "Support payments admin read" on support_payments
    for select using (auth.role() = 'service_role');

-- Storage: rescue-media (rescue-scoped) and public-assets (user-scoped)
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

drop policy if exists "Public read public-assets" on storage.objects;
create policy "Public read public-assets" on storage.objects
    for select using (bucket_id = 'public-assets');

drop policy if exists "Users manage their assets" on storage.objects;
create policy "Users manage their assets" on storage.objects
    for all using (
        bucket_id = 'public-assets'
        and split_part(name, '/', 1)::uuid = auth.uid()
    )
    with check (
        bucket_id = 'public-assets'
        and split_part(name, '/', 1)::uuid = auth.uid()
    );
