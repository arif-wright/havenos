<script lang="ts">
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
</script>

<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-semibold text-slate-900">Inquiries</h1>
			<p class="text-sm text-slate-500">Manage adopter conversations in one place.</p>
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

	{#if data.inquiries.length === 0}
		<p class="mt-6 text-sm text-slate-500">No inquiries yet.</p>
	{:else}
		{#if data.appliedFilters.status || data.appliedFilters.days || data.appliedFilters.stale}
			<p class="mt-4 text-xs text-slate-500">
				Filtered:
				{#if data.appliedFilters.status}status={data.appliedFilters.status}{/if}
				{#if data.appliedFilters.days} · last {data.appliedFilters.days} days{/if}
				{#if data.appliedFilters.stale} · stale only{/if}
			</p>
		{/if}
		<div class="mt-6 divide-y divide-slate-100">
			{#each data.filteredInquiries as inquiry}
				<div
					id={inquiry.id}
					class={`flex flex-col gap-4 py-4 md:flex-row md:justify-between md:gap-8 ${
						data.focus === inquiry.id ? 'bg-emerald-50/40 px-3 md:px-4' : ''
					} ${inquiry.isStale ? 'border border-amber-200 bg-amber-50/50' : ''} ${['closed', 'adopted'].includes(inquiry.status) ? 'opacity-70' : ''}`}
				>
					<div class="flex-1">
						<p class="text-sm font-semibold text-slate-900">
							{inquiry.adopter_name} · {inquiry.adopter_email}
						</p>
						<p class="text-xs text-slate-500">
							For {inquiry.animals?.name ?? 'Unknown animal'} on
							{new Date(inquiry.created_at).toLocaleDateString()}
						</p>
						<p class="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-line">
							{inquiry.message || 'No message provided.'}
						</p>
						<div class="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
							{#if inquiry.isStale}
								<span class="rounded-md bg-amber-100 px-2 py-1 text-amber-800">Needs Attention</span>
							{/if}
							{#if ['closed', 'adopted'].includes(inquiry.status)}
								<span class="rounded-md bg-slate-100 px-2 py-1 text-slate-600">Completed</span>
							{/if}
						</div>
						<a class="text-xs font-semibold text-emerald-700" href={`/admin/inquiries/${inquiry.id}`}>
							Open detail →
						</a>
					</div>
					<form method="POST" action="?/updateStatus" class="w-full max-w-xs space-y-2">
						<input type="hidden" name="inquiryId" value={inquiry.id} />
						<label class="block text-xs font-semibold uppercase tracking-wide text-slate-500">
							Status
							<select
								name="status"
								class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
							>
								{#each statusOptions as option}
									<option value={option.value} selected={option.value === inquiry.status}>
										{option.label}
									</option>
								{/each}
							</select>
						</label>
						<button
							class="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
							type="submit"
						>
							Update
						</button>
					</form>
				</div>
			{/each}
		</div>
	{/if}
</section>
