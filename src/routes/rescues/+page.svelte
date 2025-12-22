<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<section class="space-y-2">
	<h1 class="text-3xl font-semibold text-slate-900">Rescues</h1>
	<p class="text-sm text-slate-600">Browse rescues using RescueOS. Click any rescue to view their animals.</p>
</section>

<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	{#if data.rescues.length === 0}
		<p class="text-sm text-slate-600">No rescues are published yet.</p>
	{:else}
		<div class="divide-y divide-slate-100">
			{#each data.rescues as rescue}
				<a
					class="flex flex-col gap-2 py-4 hover:bg-slate-50 md:flex-row md:items-center md:justify-between"
					href={`/rescue/${rescue.slug}`}
				>
					<div>
						<p class="text-lg font-semibold text-slate-900">{rescue.name}</p>
						<p class="text-sm text-slate-600 line-clamp-2">
							{rescue.mission_statement || 'Rescue information coming soon.'}
						</p>
					</div>
					<div class="flex items-center gap-4 text-sm font-semibold text-slate-700">
						<span class="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
							{data.counts[rescue.id] ?? 0} adoptable
						</span>
						<span class="text-slate-500">View rescue →</span>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>
