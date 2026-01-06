<script lang="ts">
	import StatusPill from '$lib/components/StatusPill.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const statusOptions: { value: PageData['inquiries'][number]['status']; label: string }[] = [
		{ value: 'new', label: 'New' },
		{ value: 'contacted', label: 'Contacted' },
		{ value: 'meet_greet', label: 'Meet & Greet' },
		{ value: 'application', label: 'Application' },
		{ value: 'approved', label: 'Approved' },
		{ value: 'adopted', label: 'Adopted' },
		{ value: 'closed', label: 'Closed' }
	];

	const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
	const relative = (iso: string) => {
		const now = Date.now();
		const then = new Date(iso).getTime();
		const diffMs = then - now;
		const diffMins = Math.round(diffMs / (1000 * 60));
		if (Math.abs(diffMins) < 60) return rtf.format(Math.round(diffMins), 'minute');
		const diffHours = Math.round(diffMins / 60);
		if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
		return rtf.format(Math.round(diffHours / 24), 'day');
	};
	const buildQuery = (params: Record<string, string | null | undefined>) =>
		Object.entries(params)
			.filter(([, v]) => v !== null && v !== undefined && v !== '')
			.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
			.join('&');
</script>

<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold text-slate-900">Inquiries</h1>
			<p class="text-sm text-slate-500">Active inquiries are your working inbox. Archive anything that’s complete.</p>
		</div>
	</div>

	{#if form?.serverError}
		<p class="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
			{form.serverError}
		</p>
	{/if}

	<div class="mt-6 grid gap-4 md:grid-cols-3">
		<div class="rounded-xl border border-slate-200 p-4">
			<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">New (7d)</p>
			<p class="text-2xl font-semibold text-slate-900">{data.slices.newInquiries.length}</p>
		</div>
		<div class="rounded-xl border border-slate-200 p-4">
			<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">No response 48h+</p>
			<p class="text-2xl font-semibold text-slate-900">{data.slices.noResponse.length}</p>
		</div>
		<div class="rounded-xl border border-slate-200 p-4">
			<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Animals w/ zero inquiries</p>
			<p class="text-2xl font-semibold text-slate-900">{data.slices.animalsNoInquiries.length}</p>
		</div>
	</div>

	<div class="mt-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-700">
		<a
			class={`rounded-full px-3 py-1 ${data.view === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
			href="/admin/inquiries"
		>
			Active
		</a>
		<a
			class={`rounded-full px-3 py-1 ${data.view === 'archived' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
			href="/admin/inquiries?view=archived"
		>
			Archived
		</a>
	</div>

	<form method="GET" class="mt-4 grid gap-3 md:grid-cols-4">
		<input type="hidden" name="view" value={data.view} />
		<label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
			Status
			<select
				name="status"
				class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				value={data.appliedFilters.status ?? ''}
			>
				<option value="">All</option>
				{#each statusOptions as option}
					<option value={option.value} selected={data.appliedFilters.status === option.value}>
						{option.label}
					</option>
				{/each}
			</select>
		</label>
		<label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
			Animal
			<select
				name="animal"
				class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			>
				<option value="">All</option>
				{#each data.animals as animal}
					<option value={animal.id} selected={data.appliedFilters.animal === animal.id}>
						{animal.name}
					</option>
				{/each}
			</select>
		</label>
		<label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
			Time
			<select
				name="days"
				class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			>
				<option value="">All</option>
				<option value="7" selected={data.appliedFilters.days === 7}>Last 7 days</option>
				<option value="30" selected={data.appliedFilters.days === 30}>Last 30 days</option>
			</select>
		</label>
		<label class="text-xs font-semibold uppercase tracking-wide text-slate-500">
			<input
				type="checkbox"
				name="stale"
				value="1"
				class="mr-2 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
				checked={data.appliedFilters.stale}
			/>
			Stale (48h+)
		</label>
		<div class="md:col-span-4 flex gap-3">
			<button
				type="submit"
				class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
			>
				Apply
			</button>
			<a class="text-sm font-semibold text-slate-500" href="/admin/inquiries">Reset</a>
		</div>
	</form>

	{#if data.filteredInquiries.length === 0}
		<p class="mt-6 text-sm text-slate-500">
			{#if data.view === 'archived'}
				No archived inquiries yet.
			{:else}
				You’re all caught up. No active inquiries.
			{/if}
		</p>
	{:else}
		<div class="mt-6 divide-y divide-slate-100">
			{#each data.filteredInquiries as inquiry}
				<div
					id={inquiry.id}
					class={`flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between md:gap-8 ${
						data.focus === inquiry.id ? 'bg-emerald-50/40 px-3 md:px-4' : ''
					} ${inquiry.isStale && !inquiry.isArchived ? 'border border-amber-200 bg-amber-50/50' : ''} ${['closed', 'adopted'].includes(inquiry.status) ? 'opacity-80' : ''}`}
				>
					<a class="flex-1 space-y-2" href={`/admin/inquiries/${inquiry.id}`}>
						<div class="flex flex-wrap items-center gap-2">
							<p class="text-sm font-semibold text-slate-900">
								{inquiry.adopter_name} · {inquiry.adopter_email}
							</p>
							<StatusPill status={inquiry.status} />
							{#if inquiry.isStale && !inquiry.isArchived}
								<span class="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800">
									Stale
								</span>
							{/if}
						</div>
						<p class="text-xs text-slate-600">
							For {inquiry.animals?.name ?? 'Unknown animal'} · {relative(inquiry.created_at)}
							<span class="text-[11px] text-slate-400" title={new Date(inquiry.created_at).toLocaleString()}>
								({new Date(inquiry.created_at).toLocaleDateString()})
							</span>
						</p>
						<p class="line-clamp-2 text-sm text-slate-700">
							{inquiry.message || 'No message provided.'}
						</p>
					</a>
					<div class="flex flex-col items-start gap-2 md:items-end">
						<form
							method="POST"
							action="?/updateStatus"
							class="flex items-center gap-2 text-sm"
							aria-label="Quick status"
						>
							<input type="hidden" name="inquiryId" value={inquiry.id} />
							<select
								name="status"
								class="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
								on:change={(e) => e.currentTarget.form?.requestSubmit()}
								disabled={inquiry.isArchived}
							>
								{#each statusOptions as option}
									<option value={option.value} selected={option.value === inquiry.status}>
										{option.label}
									</option>
								{/each}
							</select>
						</form>
						<div class="flex items-center gap-2">
							<a
								class="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
								href={`/admin/inquiries/${inquiry.id}`}
							>
								Open
							</a>
							{#if data.view === 'archived'}
								<form method="POST" action="?/restore">
									<input type="hidden" name="inquiryId" value={inquiry.id} />
									<button
										type="submit"
										class="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
									>
										Restore
									</button>
								</form>
							{:else}
								<form method="POST" action="?/archive">
									<input type="hidden" name="inquiryId" value={inquiry.id} />
									<button
										type="submit"
										class="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
										on:click={(e) => {
											if (!confirm('Archive this inquiry? You can restore anytime.')) e.preventDefault();
										}}
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
