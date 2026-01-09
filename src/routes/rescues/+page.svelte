<script lang="ts">
import type { PageData } from './$types';
import AmbientPage from '$lib/components/AmbientPage.svelte';
import { navigating } from '$app/stores';
import { favorites, isFavorite, toggleFavorite } from '$lib/utils/favorites';

export let data: PageData;

let search = data.search ?? '';
let debounceHandle: ReturnType<typeof setTimeout> | null = null;
let alertEmail = '';
let alertFrequency: 'daily' | 'weekly' = 'weekly';
let alertMessage = '';
let alertError = '';
let alertSubmitting = false;

	const submitForm = async (formEl: HTMLFormElement) => {
		const pageInput = formEl.querySelector('input[name="page"]') as HTMLInputElement | null;
		if (pageInput) pageInput.value = '1';
		formEl.requestSubmit();
	};
	const handleSearch = (formEl: HTMLFormElement) => {
		if (debounceHandle) clearTimeout(debounceHandle);
		debounceHandle = setTimeout(() => submitForm(formEl), 300);
	};


	const badge = (status: PageData['rescues'][number]['verification_status']) => {
		if (status === 'verified_501c3') return { label: 'Verified 501(c)(3)', tone: 'emerald' };
		if (status === 'verified') return { label: 'Verified', tone: 'sky' };
		return null;
	};

	const handleSaveSearch = async () => {
		alertSubmitting = true;
		alertError = '';
		alertMessage = '';
		try {
			const response = await fetch('/api/saved-search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					kind: 'rescue_directory',
					email: alertEmail,
					frequency: alertFrequency,
					query: {
						q: search || undefined,
						hasPets: data.hasPets,
						sort: data.sort
					}
				})
			});
			const result = await response.json();
			if (!response.ok || result.error) {
				alertError = result.error ?? 'Unable to save alert right now.';
			} else {
				alertMessage = 'Search saved. We will email you when new matches appear.';
				alertEmail = '';
			}
		} catch (error) {
			console.error(error);
			alertError = 'Unable to save alert.';
		} finally {
			alertSubmitting = false;
		}
	};
</script>

<AmbientPage
	title="Rescue directory"
	kicker="Public"
	subtitle="Verified signals, adoptable counts, and reporting built-in. 12 rescues per page with search and filters."
>
	<section class="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
		<form method="GET" class="grid gap-3 md:grid-cols-[1.2fr,auto,auto] md:items-center" on:submit={() => {
			if (debounceHandle) clearTimeout(debounceHandle);
		}}>
			<div>
				<input
					type="search"
					name="q"
					placeholder="Search by name, tagline, or location"
					value={search}
					on:input={(e) => {
						search = (e.target as HTMLInputElement).value;
						handleSearch((e.currentTarget as HTMLInputElement).form!);
					}}
					class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
				/>
			</div>
			<label class="flex items-center gap-2 text-sm font-semibold text-slate-700">
				<input
					type="checkbox"
					name="hasPets"
					value="1"
					checked={data.hasPets}
					on:change={(e) => submitForm((e.currentTarget as HTMLInputElement).form!)}
					class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-400"
				/>
				Has adoptable pets
			</label>
			<div class="flex items-center gap-2 text-sm font-semibold text-slate-700">
				<label for="sort">Sort</label>
				<select
					id="sort"
					name="sort"
					value={data.sort}
					on:change={(e) => submitForm((e.currentTarget as HTMLSelectElement).form!)}
					class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
				>
					<option value="adoptable" selected={data.sort === 'adoptable'}>Most adoptable</option>
					<option value="a_z" selected={data.sort === 'a_z'}>A–Z</option>
					<option value="newest" selected={data.sort === 'newest'}>Newest</option>
				</select>
			</div>
			<input type="hidden" name="page" value={data.page} />
		</form>
		<div class="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
			<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
				<div>
					<p class="text-sm font-semibold text-slate-900 flex items-center gap-2">
						Save this search
						<span class="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800 ring-1 ring-amber-200">Beta</span>
					</p>
					<p class="text-xs text-slate-600">Get a calm email when new rescues match these filters.</p>
				</div>
				<form class="grid gap-2 md:grid-cols-[1fr,auto,auto]" on:submit|preventDefault={handleSaveSearch}>
					<input
						type="email"
						placeholder="you@example.com"
						class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
						required
						bind:value={alertEmail}
					/>
					<select
						class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
						bind:value={alertFrequency}
					>
						<option value="daily">Daily</option>
						<option value="weekly">Weekly</option>
					</select>
					<button
						type="submit"
						class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 disabled:opacity-50"
						disabled={alertSubmitting}
					>
						{alertSubmitting ? 'Saving...' : 'Save search'}
					</button>
				</form>
			</div>
			{#if alertMessage}
				<p class="mt-2 text-xs font-semibold text-emerald-700">{alertMessage}</p>
			{:else if alertError}
				<p class="mt-2 text-xs font-semibold text-rose-700">{alertError}</p>
			{/if}
		</div>
	</section>

	<section class="rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-slate-200">
		{#if data.rescues.length === 0}
			<div class="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-800">
				<p class="text-lg font-semibold">No rescues found</p>
				<p class="mt-2 text-sm text-slate-600">
					{data.search ? `No matches for “${data.search}”` : 'No rescues are published yet.'}
				</p>
				{#if data.search}
					<a
						href="/rescues"
						class="mt-3 inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
					>
						Clear search
					</a>
				{/if}
			</div>
		{:else}
			{#if $navigating}
				<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{#each Array(6) as _}
						<div class="h-36 animate-pulse rounded-2xl bg-slate-100"></div>
					{/each}
				</div>
			{:else}
				<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{#each data.rescues as rescue}
						<div class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-lg ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
							<a class="absolute inset-0" href={`/rescue/${rescue.slug}`} aria-label={`View ${rescue.name}`}></a>
							<div class="flex items-start gap-3">
								<div class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-emerald-50 ring-1 ring-emerald-100">
									{#if rescue.profile_image_url ?? rescue.logo_url}
										<img src={rescue.profile_image_url ?? rescue.logo_url} alt="" class="h-full w-full object-cover" loading="lazy" />
									{:else}
										<div class="flex h-full items-center justify-center text-sm font-semibold text-emerald-700">
											{(rescue.name ?? 'R').slice(0, 2).toUpperCase()}
										</div>
									{/if}
								</div>
								<div class="flex-1">
									<div class="flex items-center gap-2">
										<p class="text-base font-semibold text-slate-900 line-clamp-1">{rescue.name}</p>
										{#if badge(rescue.verification_status)}
											<span
												class={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
													rescue.verification_status === 'verified_501c3'
														? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
														: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
												}`}
												title={rescue.verification_status === 'verified_501c3'
													? 'Verified by RescueOS (EIN/501(c)(3) check).'
													: 'Verified by RescueOS (basic presence check).'}
											>
												{badge(rescue.verification_status)?.label}
											</span>
										{/if}
									</div>
									{#if rescue.location_text}
										<p class="text-xs text-slate-600">{rescue.location_text}</p>
									{/if}
								</div>
								<div class="flex flex-col items-end gap-2">
									<span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
										{rescue.adoptable_count ?? 0} adoptable
									</span>
									<button
										type="button"
										class={`relative z-10 rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
											isFavorite($favorites, 'rescue', rescue.id ?? '')
												? 'border-rose-200 bg-rose-50 text-rose-700'
												: 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
										}`}
										on:click={(e) => {
											e.preventDefault();
											e.stopPropagation();
											if (!rescue.id) return;
											toggleFavorite('rescue', rescue.id);
										}}
									>
										❤ {isFavorite($favorites, 'rescue', rescue.id ?? '') ? 'Saved' : 'Save'}
									</button>
								</div>
							</div>
							<p class="mt-3 text-sm text-slate-700 line-clamp-2">
								{rescue.tagline || rescue.mission_statement || 'Rescue information coming soon.'}
							</p>
						</div>
					{/each}
				</div>
			{/if}

			{#if data.total > data.pageSize}
				<div class="mt-6 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm text-slate-700 md:flex-row">
					<p>
						Showing
						{Math.min((data.page - 1) * data.pageSize + 1, data.total)}
						–
						{Math.min(data.page * data.pageSize, data.total)}
						of {data.total}
					</p>
					<div class="flex items-center gap-2">
						<a
							class="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-800 transition hover:bg-slate-100 {data.page === 1 ? 'pointer-events-none opacity-40' : ''}"
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
							class="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-800 transition hover:bg-slate-100 {(data.page * data.pageSize >= data.total) ? 'pointer-events-none opacity-40' : ''}"
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
	</section>
</AmbientPage>
