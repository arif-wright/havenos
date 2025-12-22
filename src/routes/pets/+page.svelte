<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<section class="space-y-2">
	<h1 class="text-3xl font-semibold text-slate-900">Adoptable pets</h1>
	<p class="text-sm text-slate-600">Active animals across all rescues using RescueOS.</p>
</section>

<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	{#if data.animals.length === 0}
		<p class="text-sm text-slate-600">No adoptable pets are listed yet.</p>
	{:else}
		<div class="grid gap-4 md:grid-cols-3">
			{#each data.animals as animal}
				<div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
					<div class="h-44 w-full overflow-hidden rounded-t-2xl bg-slate-100">
						{#if animal.thumb}
							<img src={animal.thumb} alt={animal.name} class="h-full w-full object-cover" loading="lazy" />
						{:else}
							<div class="flex h-full items-center justify-center text-xs text-slate-400">No photo</div>
						{/if}
					</div>
					<div class="space-y-2 p-4 text-sm">
						<div class="flex items-center justify-between">
							<p class="text-lg font-semibold text-slate-900">{animal.name}</p>
							<span
								class={`rounded-full px-2 py-1 text-xs font-semibold ${
									animal.status === 'available'
										? 'bg-emerald-50 text-emerald-700'
										: 'bg-amber-50 text-amber-700'
								}`}
							>
								{animal.status}
							</span>
						</div>
						<p class="text-slate-600">{animal.species}</p>
						{#if animal.rescue}
							<a
								class="text-emerald-700 underline-offset-2 hover:underline"
								href={`/rescue/${animal.rescue.slug}`}
							>
								{animal.rescue.name}
							</a>
						{/if}
						<a
							class="inline-flex rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
							href={`/animal/${animal.id}`}
						>
							View details
						</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
