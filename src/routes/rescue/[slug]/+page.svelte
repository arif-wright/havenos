<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	const statusLabels: Record<string, string> = {
		available: 'Available',
		hold: 'On Hold',
		adopted: 'Adopted'
	};

	const getPhoto = (animal: NonNullable<PageData['animals']>[number]) =>
		animal.animal_photos?.[0]?.image_url;
</script>

<section class="bg-white border-b border-slate-200">
	<div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:py-16">
		<div>
			<p class="text-sm font-medium uppercase tracking-widest text-emerald-600">Rescue</p>
			<h1 class="text-3xl font-semibold text-slate-900 sm:text-4xl">{data.rescue.name}</h1>
			<p class="mt-2 text-slate-600">
				Active adoptables managed by {data.rescue.name}. Need help? Email <a
					class="font-medium text-emerald-700 hover:text-emerald-800"
					href={`mailto:${data.rescue.contact_email}`}>{data.rescue.contact_email}</a
				>.
			</p>
			{#if data.rescue.response_time_text}
				<p class="mt-1 text-xs text-slate-500">Typical response: {data.rescue.response_time_text}</p>
			{/if}
		</div>
		<a
			class="inline-flex items-center justify-center rounded-md border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
			href="/"
			>About HavenOS</a
		>
	</div>
</section>

<section class="border-b border-slate-200 bg-white">
	<div class="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-2">
		<div class="rounded-xl border border-slate-200 bg-slate-50 p-6">
			<h2 class="text-lg font-semibold text-slate-900">Mission</h2>
			<p class="mt-2 text-sm text-slate-700">
				{data.rescue.mission_statement || 'This rescue has not shared their mission yet.'}
			</p>
		</div>
		<div class="rounded-xl border border-slate-200 bg-slate-50 p-6">
			<h2 class="text-lg font-semibold text-slate-900">Adoption process</h2>
			<p class="mt-2 whitespace-pre-line text-sm text-slate-700">
				{data.rescue.adoption_process || 'Adoption process details will be shared during your conversation.'}
			</p>
		</div>
	</div>
</section>

<section class="border-b border-slate-200 bg-slate-50">
	<div class="mx-auto max-w-6xl px-4 py-6">
		<form method="get" class="grid gap-4 md:grid-cols-3">
			<label class="text-sm font-medium text-slate-700">
				<span>Species</span>
				<select
					class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					name="species"
					aria-label="Filter by species"
				>
					<option value="">All</option>
					{#each data.speciesOptions as option}
						<option value={option.toLowerCase()} selected={data.filters.species === option.toLowerCase()}>
							{option}
						</option>
					{/each}
				</select>
			</label>
			<label class="text-sm font-medium text-slate-700">
				<span>Status</span>
				<select
					class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					name="status"
					aria-label="Filter by status"
				>
					<option value="">All</option>
					{#each data.statusOptions as option}
						<option value={option} selected={data.filters.status === option}>
							{statusLabels[option] ?? option}
						</option>
					{/each}
				</select>
			</label>
			<div class="flex items-end gap-3">
				<button
					type="submit"
					class="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
				>
					Apply Filters
				</button>
				<a
					href="."
					class="w-full rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-600 hover:bg-white"
				>
					Reset
				</a>
			</div>
		</form>
	</div>
</section>

<section class="mx-auto max-w-6xl px-4 py-10">
	{#if data.animals.length === 0}
		<div class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
			<p class="text-lg font-medium text-slate-700">No animals match those filters yet.</p>
			<p class="mt-2 text-sm text-slate-500">
				Check back soon or reach out directly to {data.rescue.contact_email}.
			</p>
		</div>
	{:else}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.animals as animal}
				<a
					href={`/animal/${animal.id}`}
					class="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
				>
					{#if getPhoto(animal)}
						<img
							src={getPhoto(animal)}
							alt={`Photo of ${animal.name}`}
							class="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
							loading="lazy"
						/>
					{:else}
						<div class="aspect-[4/3] w-full bg-slate-100"></div>
					{/if}
					<div class="flex flex-1 flex-col gap-3 px-4 py-5">
						<div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
							<span class="text-emerald-600">{animal.species}</span>
							<span
								class={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
									animal.status === 'available'
										? 'bg-emerald-100 text-emerald-700'
										: animal.status === 'hold'
											? 'bg-amber-100 text-amber-700'
											: 'bg-slate-200 text-slate-700'
								}`}
								>{animal.status}</span
							>
						</div>
						<h2 class="text-lg font-semibold text-slate-900">{animal.name}</h2>
						<p class="text-sm text-slate-600 h-16 overflow-hidden text-ellipsis">{animal.description}</p>
						{#if animal.tags?.length}
							<div class="mt-auto flex flex-wrap gap-2">
								{#each animal.tags as tag}
									<span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tag}</span>
								{/each}
							</div>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>
