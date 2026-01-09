<script lang="ts">
	import AmbientPage from '$lib/components/AmbientPage.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let activeTab: 'pets' | 'rescues' = 'pets';

	const missingNote =
		(data.counts?.requestedAnimals ?? 0) > data.animals.length ||
		(data.counts?.requestedRescues ?? 0) > data.rescues.length;
</script>

<AmbientPage
	title="Shared shortlist"
	kicker="Read-only"
	subtitle="A calm snapshot of saved pets and rescues. Items that are no longer public are hidden automatically."
>
	<section class="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div>
				<p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Token</p>
				<p class="text-sm font-semibold text-slate-900">{data.token}</p>
				<p class="text-xs text-slate-600">
					Created {new Date(data.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
				</p>
			</div>
			<div class="flex gap-2">
				<button
					class={`rounded-full px-4 py-2 text-sm font-semibold transition ${
						activeTab === 'pets'
							? 'bg-emerald-600 text-white shadow'
							: 'bg-slate-100 text-slate-800 hover:bg-slate-200'
					}`}
					on:click={() => (activeTab = 'pets')}
				>
					Pets ({data.animals.length})
				</button>
				<button
					class={`rounded-full px-4 py-2 text-sm font-semibold transition ${
						activeTab === 'rescues'
							? 'bg-emerald-600 text-white shadow'
							: 'bg-slate-100 text-slate-800 hover:bg-slate-200'
					}`}
					on:click={() => (activeTab = 'rescues')}
				>
					Rescues ({data.rescues.length})
				</button>
			</div>
		</div>
		{#if missingNote}
			<p class="mt-3 text-xs font-semibold text-amber-700">
				Some saved items may be hidden if they are no longer public.
			</p>
		{/if}
	</section>

	{#if activeTab === 'pets'}
		{#if data.animals.length === 0}
			<div class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-700 shadow">
				<p class="text-lg font-semibold text-slate-900">No pets available</p>
				<p class="text-sm text-slate-600">Saved pets will re-appear here if they are public.</p>
			</div>
		{:else}
			<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.animals as animal}
					<div class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-200">
						{#if animal.thumb}
							<img src={animal.thumb} alt={animal.name} class="aspect-[4/3] w-full object-cover" loading="lazy" />
						{:else}
							<div class="aspect-[4/3] w-full bg-slate-100"></div>
						{/if}
						<div class="space-y-2 px-4 py-3">
							<div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
								<span class="text-emerald-700">{animal.species}</span>
								<span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 ring-1 ring-slate-200">
									{animal.status}
								</span>
							</div>
							<div>
								<p class="text-lg font-semibold text-slate-900">{animal.name}</p>
								{#if animal.rescue?.name}
									<p class="text-xs text-slate-600">
										{animal.rescue.name ?? 'Rescue'}
										{#if animal.rescue.location_text}
											• {animal.rescue.location_text}
										{/if}
									</p>
								{/if}
							</div>
							<a
								class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-200"
								href={`/animal/${animal.id}`}
							>
								View details
								<span aria-hidden="true">→</span>
							</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{:else}
		{#if data.rescues.length === 0}
			<div class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-700 shadow">
				<p class="text-lg font-semibold text-slate-900">No rescues available</p>
				<p class="text-sm text-slate-600">Saved rescues will appear here when they are public.</p>
			</div>
		{:else}
			<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{#each data.rescues as rescue}
					<div class="relative flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg ring-1 ring-slate-200">
						<div class="flex items-start gap-3">
							<div class="h-12 w-12 overflow-hidden rounded-full bg-emerald-50 ring-1 ring-emerald-100">
									{#if rescue.avatar}
										<img src={rescue.avatar} alt={rescue.name ?? 'Rescue'} class="h-full w-full object-cover" loading="lazy" />
									{:else}
										<div class="flex h-full items-center justify-center text-sm font-semibold text-emerald-700">
											{(rescue.name ?? 'R').slice(0, 2).toUpperCase()}
										</div>
									{/if}
								</div>
							<div class="flex-1">
								<p class="text-base font-semibold text-slate-900">{rescue.name ?? 'Rescue'}</p>
								{#if rescue.location_text}
									<p class="text-xs text-slate-600">{rescue.location_text}</p>
								{/if}
								{#if rescue.tagline}
									<p class="text-xs text-slate-600 line-clamp-2">{rescue.tagline}</p>
								{/if}
							</div>
						</div>
						{#if rescue.slug}
							<a
								class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-200"
								href={`/rescue/${rescue.slug}`}
							>
								View profile
								<span aria-hidden="true">→</span>
							</a>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</AmbientPage>
