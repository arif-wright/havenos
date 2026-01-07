-- Public assets bucket for avatars and misc assets
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

-- Ensure storage policies exist (duplicated in policies.sql for clarity)
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
