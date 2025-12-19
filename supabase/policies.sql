-- Enable RLS
alter table rescues enable row level security;
alter table rescue_admins enable row level security;
alter table animals enable row level security;
alter table animal_photos enable row level security;
alter table inquiries enable row level security;

-- rescues
drop policy if exists "Public rescue read" on rescues;
create policy "Public rescue read" on rescues
    for select using (true);

drop policy if exists "Admins manage their rescue rows" on rescues;
create policy "Admins manage their rescue rows" on rescues
    for update using (
        exists (
            select 1 from rescue_admins ra
            where ra.rescue_id = rescues.id
              and ra.user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from rescue_admins ra
            where ra.rescue_id = rescues.id
              and ra.user_id = auth.uid()
        )
    );

-- rescue_admins
drop policy if exists "Admins read own membership" on rescue_admins;
create policy "Admins read own membership" on rescue_admins
    for select using (user_id = auth.uid());

drop policy if exists "Service role manages rescue_admins" on rescue_admins;
create policy "Service role manages rescue_admins" on rescue_admins
    for all using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- animals
drop policy if exists "Public animal read" on animals;
create policy "Public animal read" on animals
    for select using (is_active and status in ('available','hold'));

drop policy if exists "Admins manage their animals" on animals;
create policy "Admins manage their animals" on animals
    for all using (
        exists (
            select 1 from rescue_admins ra
            where ra.rescue_id = animals.rescue_id
              and ra.user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from rescue_admins ra
            where ra.rescue_id = animals.rescue_id
              and ra.user_id = auth.uid()
        )
    );

-- animal photos
drop policy if exists "Public photo read" on animal_photos;
create policy "Public photo read" on animal_photos
    for select using (
        exists (
            select 1 from animals
            where animals.id = animal_photos.animal_id
              and animals.is_active
              and animals.status in ('available','hold')
        )
    );

drop policy if exists "Admins manage their photos" on animal_photos;
create policy "Admins manage their photos" on animal_photos
    for all using (
        exists (
            select 1 from animals
            join rescue_admins ra on ra.rescue_id = animals.rescue_id
            where animals.id = animal_photos.animal_id
              and ra.user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from animals
            join rescue_admins ra on ra.rescue_id = animals.rescue_id
            where animals.id = animal_photos.animal_id
              and ra.user_id = auth.uid()
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
            select 1 from rescue_admins ra
            where ra.rescue_id = inquiries.rescue_id
              and ra.user_id = auth.uid()
        )
    );

drop policy if exists "Admins update their inquiries" on inquiries;
create policy "Admins update their inquiries" on inquiries
    for update using (
        exists (
            select 1 from rescue_admins ra
            where ra.rescue_id = inquiries.rescue_id
              and ra.user_id = auth.uid()
        )
    )
    with check (
        exists (
            select 1 from rescue_admins ra
            where ra.rescue_id = inquiries.rescue_id
              and ra.user_id = auth.uid()
        )
    );
