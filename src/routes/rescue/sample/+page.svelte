<script lang="ts">
	const animals = [
		{
			id: 'demo-cat-1',
			name: 'Marble',
			species: 'Cat',
			status: 'available',
			image:
				'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=600&q=80'
		},
		{
			id: 'demo-dog-1',
			name: 'Scout',
			species: 'Dog',
			status: 'hold',
			image:
				'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=600&q=80'
		},
		{
			id: 'demo-cat-2',
			name: 'Juniper',
			species: 'Cat',
			status: 'available',
			image:
				'https://images.unsplash.com/photo-1504203700686-0f3b3a5d5f2a?auto=format&fit=crop&w=600&q=80'
		}
	];
</script>

<section class="space-y-2">
	<p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">Demo</p>
	<h1 class="text-3xl font-semibold text-slate-900">Sample Rescue</h1>
	<p class="text-sm text-slate-600">
		This is a demo view to show how a public rescue page looks. The animals below are mock data and the inquiry form
		is disabled.
	</p>
</section>

<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	<h2 class="text-xl font-semibold text-slate-900">About</h2>
	<p class="mt-2 text-sm text-slate-700">
		We’re a small foster-based rescue focused on thoughtful matchmaking and clear communication. Expect a reply
		within 48 hours.
	</p>
</section>

<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold text-slate-900">Adoptable animals</h2>
		<span class="text-sm text-slate-600">Demo only</span>
	</div>
	<div class="mt-4 grid gap-4 md:grid-cols-3">
		{#each animals as animal}
			<div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
				<div class="h-40 w-full overflow-hidden rounded-t-2xl bg-slate-100">
					<img src={animal.image} alt={animal.name} class="h-full w-full object-cover" loading="lazy" />
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
					<button
						class="w-full rounded-md border border-slate-300 px-3 py-2 font-semibold text-slate-500"
						disabled
					>
						Submit inquiry (demo)
					</button>
				</div>
			</div>
		{/each}
	</div>
</section>
