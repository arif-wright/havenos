<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	const statusLabels: Record<string, string> = {
		available: 'Available',
		hold: 'On Hold',
		adopted: 'Adopted'
	};

	const responseLabels: Record<string, string> = {
		same_day: 'Same day',
		'24_48': '24–48 hours',
		'3_5': '3–5 days',
		'1w_plus': '1+ week'
	};

	const getPhoto = (animal: NonNullable<PageData['animals']>[number]) =>
		animal.animal_photos?.[0]?.image_url;

	const adoptionSteps = data.rescue.adoption_steps as string[] | null;

	const totalPages = Math.max(1, Math.ceil((data.total || 0) / data.pageSize));

	const pageStart =
		data.animals.length === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
	const pageEnd = data.animals.length === 0 ? 0 : pageStart + data.animals.length - 1;

	const buildPageLink = (page: number) => {
		const params = new URLSearchParams(data.searchParams as Record<string, string>);
		params.set('page', page.toString());
		return `?${params.toString()}`;
	};
</script>

<section class="border-b border-slate-200 bg-transparent">
	<div class="relative overflow-hidden">
		<div class="h-48 w-full overflow-hidden rounded-t-2xl bg-gradient-to-r from-emerald-100 to-slate-100">
			{#if data.rescue.cover_url}
				<img src={data.rescue.cover_url} alt="" class="h-full w-full object-cover" />
			{/if}
		</div>
		<div class="bg-white">
			<div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-12 pt-8 sm:flex-row sm:items-end sm:justify-between">
				<div class="-mt-10 flex items-start gap-4">
					<div class="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-emerald-50 shadow">
						{#if data.rescue.logo_url}
							<img src={data.rescue.logo_url} alt="Rescue logo" class="h-full w-full object-cover" />
						{:else}
							<div class="flex h-full items-center justify-center text-lg font-semibold text-emerald-700">
								{data.rescue.name.slice(0, 2).toUpperCase()}
							</div>
						{/if}
					</div>
					<div class="pt-4">
						<p class="text-xs font-semibold uppercase tracking-widest text-emerald-700">Rescue</p>
						<h1 class="text-3xl font-semibold text-slate-900 sm:text-4xl">{data.rescue.name}</h1>
						<p class="text-sm text-slate-600">
							{data.rescue.tagline || data.rescue.location_text || 'Adoptable pets and updates.'}
						</p>
						{#if data.rescue.location_text}
							<p class="text-xs text-slate-500">Based in {data.rescue.location_text}</p>
						{/if}
					</div>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					{#if data.rescue.website_url}
						<a class="rounded-md border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50" href={data.rescue.website_url} target="_blank" rel="noreferrer">Website</a>
					{/if}
					{#if data.rescue.instagram_url}
						<a class="rounded-md border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50" href={data.rescue.instagram_url} target="_blank" rel="noreferrer">Instagram</a>
					{/if}
					{#if data.rescue.facebook_url}
						<a class="rounded-md border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50" href={data.rescue.facebook_url} target="_blank" rel="noreferrer">Facebook</a>
					{/if}
					{#if data.rescue.donation_url}
						<a class="rounded-md bg-emerald-600 px-3 py-1 text-sm font-semibold text-white hover:bg-emerald-500" href={data.rescue.donation_url} target="_blank" rel="noreferrer">Donate</a>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>

<section class="bg-transparent">
	<div class="mx-auto max-w-6xl pb-8">
		<div class="overflow-hidden rounded-b-2xl bg-white shadow-sm">
			<div class="grid gap-6 p-6 md:grid-cols-2">
				<div class="rounded-xl border border-slate-200 bg-slate-50 p-6">
					<h2 class="text-lg font-semibold text-slate-900">Mission</h2>
					<p class="mt-2 text-sm text-slate-700">
						{data.rescue.mission_statement || 'This rescue has not shared their mission yet.'}
					</p>
				</div>
				<div class="rounded-xl border border-slate-200 bg-slate-50 p-6 space-y-3">
					<h2 class="text-lg font-semibold text-slate-900">How adoption works</h2>
					{#if adoptionSteps?.length}
						<ol class="space-y-2 text-sm text-slate-700 list-decimal list-inside">
							{#each adoptionSteps as step}
								<li>{step}</li>
							{/each}
						</ol>
					{:else}
						<p class="text-sm text-slate-600">Adoption steps will be shared during your conversation.</p>
					{/if}
					{#if data.rescue.response_time_enum}
						<p class="text-xs text-slate-500">Typical response: {responseLabels[data.rescue.response_time_enum] ?? data.rescue.response_time_text}</p>
					{:else if data.rescue.response_time_text}
						<p class="text-xs text-slate-500">Typical response: {data.rescue.response_time_text}</p>
					{/if}
					{#if data.rescue.adoption_process}
						<p class="text-sm whitespace-pre-line text-slate-700">{data.rescue.adoption_process}</p>
					{/if}
				</div>
			</div>
			<div class="border-t border-slate-200 bg-slate-50 px-4 py-6 sm:px-6">
				<form method="get" class="grid gap-4 md:grid-cols-3">
					<input type="hidden" name="page" value="1" />
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
		</div>
	</div>
</section>

<section class="bg-transparent">
	<div class="mx-auto max-w-6xl pb-12 pt-6">
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
			{#if totalPages > 1}
				<div class="mt-8 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
					<span>
						Showing {pageStart}&ndash;{pageEnd} of {data.total}
					</span>
					<div class="flex items-center gap-2">
						<a
							class={`rounded-md border px-3 py-2 font-semibold ${
								data.page <= 1
									? 'cursor-not-allowed border-slate-200 text-slate-400'
									: 'border-slate-300 text-slate-700 hover:bg-slate-50'
							}`}
							aria-disabled={data.page <= 1}
							href={data.page <= 1 ? '#' : buildPageLink(data.page - 1)}
						>
							Prev
						</a>
						<a
							class={`rounded-md border px-3 py-2 font-semibold ${
								data.page >= totalPages
									? 'cursor-not-allowed border-slate-200 text-slate-400'
									: 'border-slate-300 text-slate-700 hover:bg-slate-50'
							}`}
							aria-disabled={data.page >= totalPages}
							href={data.page >= totalPages ? '#' : buildPageLink(data.page + 1)}
						>
							Next
						</a>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</section>
