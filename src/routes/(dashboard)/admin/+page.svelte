<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="grid gap-6 lg:grid-cols-3">
	<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<p class="text-sm text-slate-500">Active animals</p>
		<p class="mt-2 text-3xl font-semibold text-slate-900">{data.stats.activeAnimals}</p>
		<p class="text-xs text-slate-400">of {data.stats.totalAnimals} total</p>
	</div>
	<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<p class="text-sm text-slate-500">New inquiries</p>
		<p class="mt-2 text-3xl font-semibold text-slate-900">{data.stats.newInquiries}</p>
	</div>
	<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<p class="text-sm text-slate-500">Adoptions marked</p>
		<p class="mt-2 text-3xl font-semibold text-slate-900">{data.stats.adopted}</p>
	</div>
</div>

<div class="mt-6 grid gap-6 md:grid-cols-3">
	<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">New (7d)</p>
		<p class="mt-2 text-2xl font-semibold text-slate-900">{data.crmSlices.recentNew.length}</p>
	</div>
	<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">No response 48h+</p>
		<p class="mt-2 text-2xl font-semibold text-slate-900">{data.crmSlices.noResponse.length}</p>
	</div>
	<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Animals with zero inquiries</p>
		<p class="mt-2 text-2xl font-semibold text-slate-900">{data.crmSlices.animalsNoInquiries.length}</p>
	</div>
</div>

<section class="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold text-slate-900">Recent inquiries</h2>
		<a class="text-sm font-semibold text-emerald-600" href="/admin/inquiries">View all</a>
	</div>
	{#if data.recentInquiries.length === 0}
		<p class="mt-6 text-sm text-slate-500">No inquiries yet.</p>
	{:else}
		<div class="mt-6 divide-y divide-slate-100">
			{#each data.recentInquiries as inquiry}
				<div class="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p class="text-sm font-semibold text-slate-900">{inquiry.adopter_name}</p>
						<p class="text-xs text-slate-500">
							For {inquiry.animals?.name ?? 'an animal'} · {new Date(inquiry.created_at).toLocaleString()}
						</p>
					</div>
					<a
						class="text-sm font-medium text-emerald-600"
						href={`/admin/inquiries?focus=${inquiry.id}`}
						>Update status</a
					>
				</div>
			{/each}
		</div>
	{/if}
</section>

<section class="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	<h2 class="text-xl font-semibold text-slate-900">Analytics</h2>
	<div class="mt-4 grid gap-4 md:grid-cols-3 text-sm text-slate-700">
		<div class="rounded-lg border border-slate-200 p-4">
			<p class="text-xs uppercase tracking-wide text-slate-500">Avg time to first response</p>
			<p class="mt-1 text-lg font-semibold text-slate-900">
				{#if data.analytics.timeToFirstResponseHours === null}
					–
				{:else}
					{data.analytics.timeToFirstResponseHours}h
				{/if}
			</p>
		</div>
		<div class="rounded-lg border border-slate-200 p-4">
			<p class="text-xs uppercase tracking-wide text-slate-500">Stale inquiries</p>
			<p class="mt-1 text-lg font-semibold text-slate-900">{data.analytics.staleCount}</p>
		</div>
		<div class="rounded-lg border border-slate-200 p-4">
			<p class="text-xs uppercase tracking-wide text-slate-500">Inquiries per animal</p>
			<p class="mt-1 text-lg font-semibold text-slate-900">
				{#if Number.isNaN(data.analytics.inquiriesPerAnimal)}
					–
				{:else}
					{data.analytics.inquiriesPerAnimal.toFixed(1)}
				{/if}
			</p>
		</div>
	</div>
</section>
