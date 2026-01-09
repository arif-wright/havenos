-- WOW differentiators: story builder fields + lightweight pipeline

-- Structured pet story fields
alter table if exists animals add column if not exists personality_traits text[] not null default '{}';
alter table if exists animals add column if not exists energy_level text;
alter table if exists animals add column if not exists good_with text[] not null default '{}';
alter table if exists animals add column if not exists training text;
alter table if exists animals add column if not exists medical_needs text;
alter table if exists animals add column if not exists ideal_home text;

-- Pipeline stage mapping (intake -> foster -> available/hold -> adopted)
alter table if exists animals add column if not exists pipeline_stage text;
update animals
set pipeline_stage = case
    when status = 'adopted' then 'adopted'
    when status = 'hold' then 'hold'
    else coalesce(pipeline_stage, 'available')
end
where pipeline_stage is null;
alter table if exists animals alter column pipeline_stage set default 'available';
alter table if exists animals alter column pipeline_stage set not null;
alter table if exists animals drop constraint if exists animals_pipeline_stage_check;
alter table if exists animals add constraint animals_pipeline_stage_check check (pipeline_stage in ('intake','foster','available','hold','adopted'));
create index if not exists idx_animals_pipeline_stage on animals(rescue_id, pipeline_stage, status);

-- Stage events for auditability
create table if not exists animal_stage_events (
    id uuid primary key default gen_random_uuid(),
    animal_id uuid not null references animals(id) on delete cascade,
    from_stage text,
    to_stage text not null,
    changed_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_animal_stage_events_animal on animal_stage_events(animal_id, created_at desc);

alter table animal_stage_events enable row level security;

drop policy if exists "Members read animal_stage_events" on animal_stage_events;
create policy "Members read animal_stage_events" on animal_stage_events
    for select using (
        exists (
            select 1 from animals
            join rescue_members rm on rm.rescue_id = animals.rescue_id
            where animals.id = animal_stage_events.animal_id
              and rm.user_id = auth.uid()
        )
        or auth.role() = 'service_role'
    );

drop policy if exists "Admins log animal_stage_events" on animal_stage_events;
create policy "Admins log animal_stage_events" on animal_stage_events
    for insert with check (
        exists (
            select 1 from animals
            join rescue_members rm on rm.rescue_id = animals.rescue_id
            where animals.id = animal_stage_events.animal_id
              and rm.user_id = auth.uid()
              and rm.role in ('owner','admin')
        )
        or auth.role() = 'service_role'
    );
