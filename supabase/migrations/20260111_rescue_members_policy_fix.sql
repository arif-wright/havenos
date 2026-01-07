-- Fix recursion in rescue_members select policy (remove self-referential subquery)
drop policy if exists "Members read rescue_members" on public.rescue_members;
create policy "Members read rescue_members" on public.rescue_members
    for select using (user_id = auth.uid() or auth.role() = 'service_role');
