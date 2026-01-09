<script lang="ts">
	import AmbientPage from '$lib/components/AmbientPage.svelte';
	import type { ActionData, PageData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageData;
	export let form: ActionData;

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

	const adoptionSteps = data.rescue.adoption_steps as string[] | null;
	const totalPages = Math.max(1, Math.ceil((data.total || 0) / data.pageSize));
	const pageStart = data.animals.length === 0 ? 0 : (data.page - 1) * data.pageSize + 1;
	const pageEnd = data.animals.length === 0 ? 0 : pageStart + data.animals.length - 1;
	const buildPageLink = (page: number) => {
		const params = new URLSearchParams(data.searchParams as Record<string, string>);
		params.set('page', page.toString());
		return `?${params.toString()}`;
	};

	let showReport = false;
	let reportAnimalId: string | null = null;

	onMount(() => {
		if (form?.success) {
			showReport = false;
			reportAnimalId = null;
		}
	});

	const badge = (() => {
		if (data.rescue.verification_status === 'verified_501c3') {
			return { label: 'Verified 501(c)(3)', title: 'Verified by RescueOS (EIN/501(c)(3) check).' };
		}
		if (data.rescue.verification_status === 'verified') {
			return { label: 'Verified', title: 'Verified by RescueOS (basic presence check).' };
		}
		return null;
	})();
</script>

<AmbientPage
	title={data.rescue.name}
	kicker="Rescue profile"
	subtitle={data.rescue.tagline || data.rescue.location_text || 'RescueOS public page'}
>
	<section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
		<div class="relative h-56 w-full overflow-hidden bg-slate-100">
			<div class="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-transparent to-sky-500/20"></div>
			{#if data.rescue.header_image_url || data.rescue.cover_url}
				<img
					src={data.rescue.header_image_url ?? data.rescue.cover_url}
					alt=""
					class="h-full w-full object-cover"
					loading="lazy"
				/>
			{/if}
		</div>
		<div class="p-6 sm:p-8">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex items-start gap-4">
					<div class="-mt-16 h-24 w-24 overflow-hidden rounded-3xl border-4 border-white bg-slate-50 shadow-xl ring-1 ring-slate-200">
						{#if data.rescue.profile_image_url || data.rescue.logo_url}
							<img
								src={data.rescue.profile_image_url ?? data.rescue.logo_url}
								alt="Rescue logo"
								class="h-full w-full object-cover"
								loading="lazy"
							/>
						{:else}
							<div class="flex h-full items-center justify-center text-xl font-semibold text-emerald-700">
								{data.rescue.name.slice(0, 2).toUpperCase()}
							</div>
						{/if}
					</div>
					<div class="space-y-2">
						<div class="flex items-center gap-2">
							<h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">{data.rescue.name}</h1>
							{#if badge}
								<span
									class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
									title={badge.title}
								>
									{badge.label}
								</span>
							{/if}
						</div>
						{#if data.rescue.location_text}
							<p class="text-sm text-slate-600">Based in {data.rescue.location_text}</p>
						{/if}
						{#if data.rescue.response_time || data.rescue.response_time_enum}
							<p class="text-xs text-slate-500">
								Response time: {responseLabels[data.rescue.response_time_enum] ?? data.rescue.response_time ?? data.rescue.response_time_text}
							</p>
						{/if}
						<div class="flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
							{#if data.rescue.website_url}
								<a class="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-100" href={data.rescue.website_url} target="_blank" rel="noreferrer">Website</a>
							{/if}
							{#if data.rescue.instagram_url}
								<a class="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-100" href={data.rescue.instagram_url} target="_blank" rel="noreferrer">Instagram</a>
							{/if}
							{#if data.rescue.facebook_url}
								<a class="rounded-full border border-slate-200 px-3 py-1 hover:bg-slate-100" href={data.rescue.facebook_url} target="_blank" rel="noreferrer">Facebook</a>
							{/if}
							{#if data.rescue.donation_url}
								<a class="rounded-full bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-500" href={data.rescue.donation_url} target="_blank" rel="noreferrer">Support this rescue</a>
							{/if}
							<button
								type="button"
								class="rounded-full border border-slate-200 px-3 py-1 text-rose-700 hover:bg-rose-50"
								on:click={() => {
									showReport = true;
									reportAnimalId = null;
								}}
							>
								Report this rescue
							</button>
						</div>
					</div>
				</div>
			</div>
			<div class="mt-8 grid gap-4 lg:grid-cols-2">
				<div class="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-800 shadow-lg">
					<h2 class="text-lg font-semibold text-slate-900">Mission</h2>
					<p class="mt-2 text-sm text-slate-700">
						{data.rescue.mission_statement || 'This rescue has not shared their mission yet.'}
					</p>
				</div>
				<div class="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-slate-800 shadow-lg space-y-3">
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
					{#if data.rescue.response_time_enum || data.rescue.response_time}
						<p class="text-xs text-slate-600">
							Typical response: {responseLabels[data.rescue.response_time_enum] ?? data.rescue.response_time ?? data.rescue.response_time_text}
						</p>
					{/if}
					{#if data.rescue.adoption_process}
						<p class="text-sm whitespace-pre-line text-slate-700">{data.rescue.adoption_process}</p>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<section class="rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-slate-200">
		<div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 sm:px-6">
			<form method="get" class="grid gap-4 md:grid-cols-3">
				<input type="hidden" name="page" value="1" />
				<label class="text-sm font-semibold text-slate-800">
					<span>Species</span>
					<select
						class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
				<label class="text-sm font-semibold text-slate-800">
					<span>Status</span>
					<select
						class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
						class="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-500"
					>
						Apply Filters
					</button>
					<a
						href="."
						class="w-full rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-800 hover:bg-slate-100"
					>
						Reset
					</a>
				</div>
			</form>
		</div>

		<div class="mt-6">
			{#if data.animals.length === 0}
				<div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-800">
					<p class="text-lg font-medium">No animals match those filters yet.</p>
					<p class="mt-2 text-sm text-slate-600">
						Check back soon or reach out directly to {data.rescue.contact_email}.
					</p>
				</div>
			{:else}
				<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.animals as animal}
						<div class="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
							<a class="absolute inset-0" href={`/animal/${animal.id}`} aria-label={`View ${animal.name}`}></a>
							{#if animal.animal_photos?.[0]?.image_url}
								<img
									src={animal.animal_photos[0].image_url}
									alt={`Photo of ${animal.name}`}
									class="aspect-[4/3] w-full object-cover transition group-hover:scale-105"
									loading="lazy"
								/>
							{:else}
								<div class="aspect-[4/3] w-full bg-slate-100"></div>
							{/if}
							<div class="flex flex-1 flex-col gap-3 px-4 py-5">
								<div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
									<span class="text-emerald-700">{animal.species}</span>
									<span
										class={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
											animal.status === 'available'
												? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
												: animal.status === 'hold'
													? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
													: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
										}`}
										>{animal.status}</span
									>
								</div>
								<h2 class="text-lg font-semibold text-slate-900">{animal.name}</h2>
								<p class="text-sm text-slate-700 h-16 overflow-hidden text-ellipsis">{animal.description}</p>
								{#if animal.tags?.length}
									<div class="mt-auto flex flex-wrap gap-2">
										{#each animal.tags as tag}
											<span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 ring-1 ring-slate-200">{tag}</span>
										{/each}
									</div>
								{/if}
								<button
									type="button"
									class="relative w-fit text-xs font-semibold text-rose-700 hover:text-rose-600"
									on:click={(e) => {
										e.stopPropagation();
										e.preventDefault();
										reportAnimalId = animal.id;
										showReport = true;
									}}
								>
									Report
								</button>
							</div>
						</div>
					{/each}
				</div>
				{#if totalPages > 1}
					<div class="mt-8 flex flex-col gap-3 text-sm text-slate-800 sm:flex-row sm:items-center sm:justify-between">
						<span>
							Showing {pageStart}&ndash;{pageEnd} of {data.total}
						</span>
						<div class="flex items-center gap-2">
							<a
								class={`rounded-full border px-3 py-2 font-semibold ${
									data.page <= 1
										? 'cursor-not-allowed border-slate-200 text-slate-400'
										: 'border-slate-200 text-slate-800 hover:bg-slate-100'
								}`}
								aria-disabled={data.page <= 1}
								href={data.page <= 1 ? '#' : buildPageLink(data.page - 1)}
							>
								Prev
							</a>
							<a
								class={`rounded-full border px-3 py-2 font-semibold ${
									data.page >= totalPages
										? 'cursor-not-allowed border-slate-200 text-slate-400'
										: 'border-slate-200 text-slate-800 hover:bg-slate-100'
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
</AmbientPage>

{#if showReport}
	<div class="fixed inset-0 z-40 grid place-items-center bg-slate-900/80 px-4 backdrop-blur">
		<div class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Report</p>
					<h2 class="text-xl font-semibold">Flag this {reportAnimalId ? 'animal' : 'rescue'}</h2>
					<p class="text-sm text-slate-600">Reports go to the RescueOS moderation queue.</p>
				</div>
				<button
					class="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-200"
					on:click={() => (showReport = false)}
				>
					Close
				</button>
			</div>
			{#if form?.serverError}
				<p class="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
					{form.serverError}
				</p>
			{:else if form?.success}
				<p class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
					Thanks—we received your report.
				</p>
			{/if}
			<form method="POST" action="?/report" class="mt-4 space-y-4 text-slate-800" on:submit={(e) => e.stopPropagation()}>
				<input type="hidden" name="rescue_id" value={data.rescue.id} />
				<input type="hidden" name="animal_id" value={reportAnimalId ?? ''} />
				<label class="text-sm font-semibold text-slate-800">
					<span class="block text-slate-600">Your name (optional)</span>
					<input
						name="reporter_name"
						class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
					/>
				</label>
				<label class="text-sm font-semibold text-slate-800">
					<span class="block text-slate-600">Your email (optional)</span>
					<input
						name="reporter_email"
						type="email"
						class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
					/>
				</label>
				<label class="text-sm font-semibold text-slate-800">
					<span class="block text-slate-600">What happened?</span>
					<textarea
						name="message"
						required
						rows="3"
						class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
					></textarea>
				</label>
				<div class="flex items-center justify-between">
					<button
						type="button"
						class="text-sm font-semibold text-slate-700 hover:text-slate-900"
						on:click={() => (showReport = false)}
					>
						Cancel
					</button>
					<button
						type="submit"
						class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-500"
					>
						Submit report
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
