<script lang="ts">
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';
	import { onMount } from 'svelte';

	export let data: PageData;
	export let form: ActionData;

	const statusLabels: Record<string, string> = {
		available: 'Available',
		hold: 'On hold',
		adopted: 'Adopted',
		archived: 'Archived'
	};

	let selected = new Set<string>();
	let showCreate = false;

	const toggleSelect = (id: string) => {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selected = next;
	};

	const bulkIds = () => Array.from(selected).join(',');

	const applyFilters = (params: URLSearchParams) => {
		return `${$page.url.pathname}?${params.toString()}`;
	};

	onMount(() => {
		selected = new Set();
	});

	$: createValues = {
		name: form?.action === 'create' ? form?.values?.name ?? '' : '',
		species: form?.action === 'create' ? form?.values?.species ?? '' : '',
		breed: form?.action === 'create' ? form?.values?.breed ?? '' : '',
		age: form?.action === 'create' ? form?.values?.age ?? '' : '',
		sex: form?.action === 'create' ? form?.values?.sex ?? '' : '',
		description: form?.action === 'create' ? form?.values?.description ?? '' : '',
		status: form?.action === 'create' ? form?.values?.status ?? 'available' : 'available',
		tags: form?.action === 'create' ? form?.values?.tags ?? '' : ''
	};

	$: createErrors = (form?.action === 'create' ? form?.errors ?? {} : {}) as Record<string, string[]>;

	$: if (form?.action === 'create' && form?.serverError) {
		showCreate = true;
	}
</script>

<section class="flex flex-wrap items-center justify-between gap-3">
	<div>
		<h1 class="text-2xl font-semibold text-slate-900">Animals</h1>
		<p class="text-sm text-slate-600">Compact list for fast management.</p>
	</div>
	<button
		class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
		type="button"
		on:click={() => (showCreate = true)}
	>
		Add animal
	</button>
</section>

<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
	<form method="get" class="grid gap-3 md:grid-cols-4">
		<label class="text-sm font-medium text-slate-700">
			Search
			<input
				name="q"
				value={data.filters.search}
				placeholder="Name"
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			/>
		</label>
		<label class="text-sm font-medium text-slate-700">
			Status
			<select
				name="status"
				class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			>
				<option value="">All</option>
				<option value="available" selected={data.filters.status === 'available'}>Available</option>
				<option value="hold" selected={data.filters.status === 'hold'}>On hold</option>
				<option value="adopted" selected={data.filters.status === 'adopted'}>Adopted</option>
				<option value="archived" selected={data.filters.status === 'archived'}>Archived</option>
			</select>
		</label>
		<label class="text-sm font-medium text-slate-700">
			Species
			<input
				name="species"
				value={data.filters.species}
				placeholder="Species"
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			/>
		</label>
		<label class="text-sm font-medium text-slate-700">
			Inquiries
			<select
				name="inquiries"
				class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			>
				<option value="">Any</option>
				<option value="has" selected={data.filters.inquiries === 'has'}>Has inquiries</option>
				<option value="none" selected={data.filters.inquiries === 'none'}>No inquiries</option>
			</select>
		</label>
		<label class="text-sm font-medium text-slate-700">
			Sort
			<select
				name="sort"
				class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			>
				<option value="newest" selected={data.filters.sort === 'newest'}>Newest first</option>
				<option value="oldest" selected={data.filters.sort === 'oldest'}>Oldest first</option>
				<option value="most_inquiries" selected={data.filters.sort === 'most_inquiries'}>Most inquiries</option>
				<option value="longest_listed" selected={data.filters.sort === 'longest_listed'}>Longest listed</option>
			</select>
		</label>
		<div class="md:col-span-3 flex items-end gap-3">
			<button
				type="submit"
				class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
			>
				Apply
			</button>
			<a
				href="/admin/animals"
				class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
			>
				Reset
			</a>
		</div>
	</form>
</section>

{#if selected.size > 0}
	<section class="mt-4 rounded-2xl border border-slate-300 bg-slate-100 p-4 text-sm text-slate-800">
		<div class="flex flex-wrap items-center gap-3">
			<p class="font-semibold">{selected.size} selected</p>
			<form method="POST" action="?/bulkArchive">
				<input type="hidden" name="ids" value={bulkIds()} />
				<button
					type="submit"
					class="rounded-md border border-slate-400 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-200"
				>
					Archive
				</button>
			</form>
			<form method="POST" action="?/bulkStatus" class="flex items-center gap-2">
				<input type="hidden" name="ids" value={bulkIds()} />
				<select
					name="status"
					class="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				>
					<option value="available">Available</option>
					<option value="hold">On hold</option>
					<option value="adopted">Adopted</option>
				</select>
				<button
					type="submit"
					class="rounded-md border border-slate-400 px-3 py-1 font-semibold text-slate-700 hover:bg-slate-200"
				>
					Update status
				</button>
			</form>
		</div>
	</section>
{/if}

{#if showCreate}
	<div class="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 px-4">
		<div class="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-3">
				<div>
					<h2 class="text-xl font-semibold text-slate-900">Add animal</h2>
					<p class="text-sm text-slate-600">Create a new listing for your rescue.</p>
				</div>
				<button
					class="rounded-md px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
					type="button"
					on:click={() => (showCreate = false)}
				>
					Close
				</button>
			</div>
			{#if form?.action === 'create' && form?.serverError}
				<p class="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
					{form.serverError}
				</p>
			{/if}
			<form method="POST" action="?/create" class="mt-5 grid gap-4 md:grid-cols-2">
				<label class="text-sm font-medium text-slate-700">
					Name
					<input
						name="name"
						value={createValues.name}
						required
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
					{#if createErrors.name}
						<span class="mt-1 block text-xs text-rose-600">{createErrors.name[0]}</span>
					{/if}
				</label>
				<label class="text-sm font-medium text-slate-700">
					Species
					<input
						name="species"
						value={createValues.species}
						required
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
					{#if createErrors.species}
						<span class="mt-1 block text-xs text-rose-600">{createErrors.species[0]}</span>
					{/if}
				</label>
				<label class="text-sm font-medium text-slate-700">
					Breed
					<input
						name="breed"
						value={createValues.breed}
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
				<label class="text-sm font-medium text-slate-700">
					Age
					<input
						name="age"
						value={createValues.age}
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
				<label class="text-sm font-medium text-slate-700">
					Sex
					<input
						name="sex"
						value={createValues.sex}
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
				<label class="text-sm font-medium text-slate-700">
					Status
					<select
						name="status"
						class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					>
						<option value="available" selected={createValues.status === 'available'}>Available</option>
						<option value="hold" selected={createValues.status === 'hold'}>On hold</option>
						<option value="adopted" selected={createValues.status === 'adopted'}>Adopted</option>
					</select>
				</label>
				<label class="text-sm font-medium text-slate-700 md:col-span-2">
					Tags (comma separated)
					<input
						name="tags"
						value={createValues.tags}
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
				<label class="text-sm font-medium text-slate-700 md:col-span-2">
					Description
					<textarea
						name="description"
						rows="4"
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					>{createValues.description}</textarea>
				</label>
				<div class="md:col-span-2 flex items-center gap-3">
					<button
						type="submit"
						class="inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
					>
						Create animal
					</button>
					<button
						type="button"
						class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
						on:click={() => (showCreate = false)}
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
	{#if data.animals.length === 0}
		<p class="text-sm text-slate-500">No animals match these filters.</p>
	{:else}
		<div class="grid grid-cols-[auto,1fr] items-center gap-2 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
			<span></span>
			<div class="grid grid-cols-[80px,1fr,120px,80px,80px,120px,140px] items-center gap-3">
				<span>Photo</span>
				<span>Name</span>
				<span>Status</span>
				<span>Inquiries</span>
				<span>Species</span>
				<span>Listed</span>
				<span></span>
			</div>
		</div>
		<div class="divide-y divide-slate-100">
			{#each data.animals as animal}
				<div
					class="group grid grid-cols-[auto,1fr] items-center gap-2 py-3 px-2 hover:bg-slate-50"
				>
					<div class="opacity-0 transition group-hover:opacity-100 sm:opacity-100">
						<input
							type="checkbox"
							class="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
							checked={selected.has(animal.id)}
							on:change={() => toggleSelect(animal.id)}
						/>
					</div>
					<div class="grid grid-cols-[80px,1fr,120px,80px,80px,120px,140px] items-center gap-3">
						<div class="h-12 w-16 overflow-hidden rounded-md bg-slate-100">
							{#if animal.thumb}
								<img src={animal.thumb} alt={animal.name} class="h-full w-full object-cover" loading="lazy" />
							{:else}
								<div class="flex h-full items-center justify-center text-[10px] text-slate-400">No photo</div>
							{/if}
						</div>
						<div class="space-y-1">
							<p class="text-sm font-semibold text-slate-900">{animal.name}</p>
							{#if animal.isStale}
								<span class="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">Listed 30d+</span>
							{/if}
						</div>
						<span
							class={`inline-flex w-fit rounded-full px-2 py-1 text-[11px] font-semibold ${
								animal.isArchived
									? 'bg-slate-200 text-slate-700'
									: animal.status === 'available'
										? 'bg-emerald-100 text-emerald-700'
										: animal.status === 'hold'
											? 'bg-amber-100 text-amber-700'
											: 'bg-slate-200 text-slate-700'
							}`}
						>
							{animal.isArchived ? 'Archived' : statusLabels[animal.status] ?? animal.status}
						</span>
						<span class="text-sm font-semibold text-slate-800">{animal.inquiryCount}</span>
						<span class="text-sm text-slate-700">{animal.species}</span>
						<span class="text-sm text-slate-700">{new Date(animal.created_at).toLocaleDateString()}</span>
						<div class="flex flex-wrap gap-2 text-sm font-semibold">
							<a
								class="rounded-md border border-emerald-600 px-3 py-1 text-emerald-700 hover:bg-emerald-50"
								href={`/admin/animals/${animal.id}`}
							>
								Manage
							</a>
							{#if animal.isArchived}
								<form method="POST" action="?/bulkActivate">
									<input type="hidden" name="ids" value={animal.id} />
									<button
										type="submit"
										class="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100"
									>
										Activate
									</button>
								</form>
							{:else}
								<form method="POST" action="?/bulkArchive">
									<input type="hidden" name="ids" value={animal.id} />
									<button
										type="submit"
										class="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100"
									>
										Archive
									</button>
								</form>
							{/if}
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

{#if data.filters.totalPages > 1}
	<nav class="mt-4 flex items-center gap-2 text-sm text-slate-700">
		{#if data.filters.page > 1}
			<a
				class="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50"
				href={applyFilters(new URLSearchParams({ ...Object.fromEntries($page.url.searchParams), page: String(data.filters.page - 1) }))}
			>
				Previous
			</a>
		{/if}
		<span class="text-xs text-slate-500">
			Page {data.filters.page} of {data.filters.totalPages}
		</span>
		{#if data.filters.page < data.filters.totalPages}
			<a
				class="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50"
				href={applyFilters(new URLSearchParams({ ...Object.fromEntries($page.url.searchParams), page: String(data.filters.page + 1) }))}
			>
				Next
			</a>
		{/if}
	</nav>
{/if}
