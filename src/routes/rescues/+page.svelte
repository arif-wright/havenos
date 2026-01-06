<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<script lang="ts">
	import { navigating } from '$app/stores';
	import { tick } from 'svelte';

	let search = data.search ?? '';
	let debounceHandle: ReturnType<typeof setTimeout> | null = null;

	const submitForm = async (form: HTMLFormElement) => {
		// reset to page 1 on new search/filter change
		const pageInput = form.querySelector('input[name="page"]') as HTMLInputElement | null;
		if (pageInput) pageInput.value = '1';
		await tick();
		form.requestSubmit();
	};
	const handleSearch = (form: HTMLFormElement) => {
		if (debounceHandle) clearTimeout(debounceHandle);
		debounceHandle = setTimeout(() => submitForm(form), 300);
	};
</script>

<section class="space-y-2">
	<h1 class="text-3xl font-semibold text-slate-900">Rescues</h1>
	<p class="text-sm text-slate-600">Browse rescues using RescueOS. Click any rescue to view their animals.</p>
</section>

<section class="mt-4">
	<form method="GET" class="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" on:submit={() => {
		if (debounceHandle) clearTimeout(debounceHandle);
	}}>
		<div class="grid gap-3 md:grid-cols-[1.2fr,auto,auto] md:items-center">
			<div>
				<input
					type="search"
					name="q"
					placeholder="Search by name, tagline, or location"
					value={search}
					on:input={(e) => {
						search = (e.target as HTMLInputElement).value;
						handleSearch(e.currentTarget.form as HTMLFormElement);
					}}
					class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				/>
			</div>
			<label class="flex items-center gap-2 text-sm font-medium text-slate-700">
				<input
					type="checkbox"
					name="hasPets"
					value="1"
					checked={data.hasPets}
					on:change={(e) => submitForm((e.currentTarget as HTMLInputElement).form!)}
					class="rounded border-slate-300"
				/>
				Has adoptable pets
			</label>
			<div class="flex items-center gap-2 text-sm font-medium text-slate-700">
				<label for="sort">Sort</label>
				<select
					id="sort"
					name="sort"
					value={data.sort}
					on:change={(e) => submitForm((e.currentTarget as HTMLSelectElement).form!)}
					class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				>
					<option value="adoptable" selected={data.sort === 'adoptable'}>Most adoptable</option>
					<option value="a_z" selected={data.sort === 'a_z'}>A–Z</option>
					<option value="newest" selected={data.sort === 'newest'}>Newest</option>
				</select>
			</div>
		</div>
		<input type="hidden" name="page" value={data.page} />
	</form>

	<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		{#if data.rescues.length === 0}
			<div class="text-center text-sm text-slate-600 space-y-2">
				<p class="text-lg font-semibold text-slate-900">No rescues found</p>
				<p>{data.search ? `No matches for “${data.search}”` : 'No rescues are published yet.'}</p>
				{#if data.search}
					<a
						href="/rescues"
						class="inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-50"
					>
						Clear search
					</a>
				{/if}
			</div>
		{:else}
			{#if $navigating}
				<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{#each Array(6) as _}
						<div class="h-32 animate-pulse rounded-xl bg-slate-100"></div>
					{/each}
				</div>
			{:else}
				<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{#each data.rescues as rescue}
						<a
							class="flex h-full flex-col gap-3 rounded-xl border border-slate-100 p-4 transition hover:-translate-y-1 hover:shadow focus:outline-none focus:ring-2 focus:ring-emerald-200"
							href={`/rescue/${rescue.slug}`}
						>
							<div class="flex items-center gap-3">
								<div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-emerald-50">
									{#if rescue.logo_url}
										<img src={rescue.logo_url} alt="" class="h-full w-full object-cover" />
									{:else}
										<div class="flex h-full items-center justify-center text-sm font-semibold text-emerald-700">
											{(rescue.name ?? 'R').slice(0, 2).toUpperCase()}
										</div>
									{/if}
								</div>
								<div class="flex-1">
									<p class="text-base font-semibold text-slate-900 line-clamp-1">{rescue.name}</p>
									{#if rescue.location_text}
										<p class="text-xs text-slate-500">{rescue.location_text}</p>
									{/if}
								</div>
								<span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
									{rescue.adoptable_count ?? 0} adoptable
								</span>
							</div>
							<p class="text-sm text-slate-600 line-clamp-2">
								{rescue.tagline || rescue.mission_statement || 'Rescue information coming soon.'}
							</p>
						</a>
					{/each}
				</div>
			{/if}

			<!-- Pagination -->
			{#if data.total > data.pageSize}
				<div class="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 md:flex-row">
					<p>
						Showing
						{Math.min((data.page - 1) * data.pageSize + 1, data.total)}
						–
						{Math.min(data.page * data.pageSize, data.total)}
						of {data.total}
					</p>
					<div class="flex items-center gap-2">
						<a
							class="rounded-md border border-slate-200 px-3 py-1 font-semibold transition hover:bg-slate-50 {data.page === 1 ? 'pointer-events-none opacity-50' : ''}"
							aria-disabled={data.page === 1}
							href={`/rescues?${new URLSearchParams({
								q: data.search ?? '',
								hasPets: data.hasPets ? '1' : '',
								sort: data.sort,
								page: String(Math.max(1, data.page - 1))
							}).toString()}`}
						>
							Prev
						</a>
						<a
							class="rounded-md border border-slate-200 px-3 py-1 font-semibold transition hover:bg-slate-50 {(data.page * data.pageSize >= data.total) ? 'pointer-events-none opacity-50' : ''}"
							aria-disabled={data.page * data.pageSize >= data.total}
							href={`/rescues?${new URLSearchParams({
								q: data.search ?? '',
								hasPets: data.hasPets ? '1' : '',
								sort: data.sort,
								page: String(data.page + 1)
							}).toString()}`}
						>
							Next
						</a>
					</div>
				</div>
			{/if}
		{/if}
	</div>
</section>
