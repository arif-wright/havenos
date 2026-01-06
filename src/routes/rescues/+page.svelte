<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<section class="space-y-2">
	<h1 class="text-3xl font-semibold text-slate-900">Rescues</h1>
	<p class="text-sm text-slate-600">Browse rescues using RescueOS. Click any rescue to view their animals.</p>
</section>

<section class="mt-4">
	<form method="GET" class="mb-4">
		<input
			type="search"
			name="q"
			placeholder="Search by name, tagline, or location"
			value={data.search}
			class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
		/>
	</form>

	<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		{#if data.rescues.length === 0}
			<p class="text-sm text-slate-600">No rescues are published yet.</p>
		{:else}
			<div class="grid gap-4 md:grid-cols-2">
				{#each data.rescues as rescue}
					<a
						class="flex gap-4 rounded-xl border border-slate-100 p-4 transition hover:-translate-y-1 hover:shadow"
						href={`/rescue/${rescue.slug}`}
					>
						<div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-emerald-50">
							{#if rescue.logo_url}
								<img src={rescue.logo_url} alt="" class="h-full w-full object-cover" />
							{:else}
								<div class="flex h-full items-center justify-center text-sm font-semibold text-emerald-700">
									{(rescue.name ?? 'R').slice(0, 2).toUpperCase()}
								</div>
							{/if}
						</div>
						<div class="flex flex-1 flex-col gap-1">
							<div class="flex items-center justify-between">
								<p class="text-base font-semibold text-slate-900">{rescue.name}</p>
								<span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
									{data.counts[rescue.id] ?? 0} adoptable
								</span>
							</div>
							<p class="text-sm text-slate-600 line-clamp-2">
								{rescue.tagline || rescue.mission_statement || 'Rescue information coming soon.'}
							</p>
							{#if rescue.location_text}
								<p class="text-xs text-slate-500">{rescue.location_text}</p>
							{/if}
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>
