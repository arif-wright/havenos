<script lang="ts">
	import StatusPill from '$lib/components/StatusPill.svelte';
	import Disclosure from '$lib/components/Disclosure.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
	const formatRelative = (iso: string) => {
		const now = Date.now();
		const then = new Date(iso).getTime();
		const diffMs = then - now;
		const diffMins = Math.round(diffMs / (1000 * 60));
		if (Math.abs(diffMins) < 60) return rtf.format(Math.round(diffMins), 'minute');
		const diffHours = Math.round(diffMins / 60);
		if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour');
		return rtf.format(Math.round(diffHours / 24), 'day');
	};

	const attentionTotal =
		(data.attentionTotals?.recentNew ?? 0) +
		(data.attentionTotals?.noResponse ?? 0) +
		(data.attentionTotals?.animalsNoInquiries ?? 0);
</script>

<section class="space-y-2">
	<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</p>
	<p class="text-sm text-slate-700">
		{#if attentionTotal > 0}
			A few items may need your attention.
		{:else}
			You’re up to date — nothing urgent right now.
		{/if}
	</p>
</section>

<section class="mt-6 space-y-4">
	<h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Overview</h2>
	<div class="grid gap-4 lg:grid-cols-3">
		<div class="rounded-2xl border border-emerald-200 bg-white p-5 shadow-md shadow-emerald-100/60">
			<p class="text-sm font-semibold text-emerald-800">Open inquiries</p>
			<p class="mt-2 text-3xl font-semibold text-slate-900">{data.stats.newInquiries}</p>
			<p class="text-xs text-slate-500">New or unassigned</p>
		</div>
		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<p class="text-sm text-slate-500">Active animals</p>
			<p class="mt-2 text-3xl font-semibold text-slate-900">{data.stats.activeAnimals}</p>
			<p class="text-xs text-slate-400">of {data.stats.totalAnimals} total</p>
		</div>
		<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<p class="text-sm text-slate-500">Adoptions marked</p>
			<p class="mt-2 text-3xl font-semibold text-slate-900">{data.stats.adopted}</p>
		</div>
	</div>
</section>

<section class="mt-8 space-y-4">
	<h2 class="text-sm font-semibold uppercase tracking-wide text-amber-600">Attention needed</h2>
	<div class="grid gap-4 md:grid-cols-3">
		{#each [
			{
				label: 'New (7d)',
				count: data.crmSlices.recentNew.length,
				href: '/admin/inquiries?status=new&days=7'
			},
			{
				label: 'No response 48h+',
				count: data.crmSlices.noResponse.length,
				href: '/admin/inquiries?stale=1'
			},
			{
				label: 'Animals with zero inquiries',
				count: data.crmSlices.animalsNoInquiries.length,
				href: '/admin/animals?zeroInquiries=1'
			}
		] as card}
			<a
				class="group relative block rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-[0_12px_40px_-30px_rgba(0,0,0,0.4)] transition hover:-translate-y-0.5 hover:border-amber-300"
				href={card.href}
			>
				<p class="text-xs font-semibold uppercase tracking-wide text-amber-700">{card.label}</p>
				<p class="mt-2 text-2xl font-semibold text-slate-900">{card.count}</p>
				<span class="absolute right-4 top-4 text-xs font-semibold text-amber-700 opacity-0 transition group-hover:opacity-100">
					View
				</span>
			</a>
		{/each}
	</div>
</section>

<section class="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	<div class="flex items-center justify-between">
		<h2 class="text-xl font-semibold text-slate-900">Recent inquiries</h2>
		<a class="text-sm font-semibold text-emerald-600" href="/admin/inquiries">View all</a>
	</div>
	{#if data.recentInquiries.length === 0}
		<p class="mt-6 text-sm text-slate-500">
			Inquiries will appear here when adopters contact you from your public pages.
			<a class="font-semibold text-emerald-700" href="/pets">View public adoptable pets</a>.
		</p>
	{:else}
		<div class="mt-6 divide-y divide-slate-100">
			{#each data.recentInquiries as inquiry}
				<div
					class={`flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between ${
						inquiry.isFresh ? 'bg-emerald-50/60' : ''
					}`}
				>
					<div class="space-y-1">
						<div class="flex items-center gap-2">
							<p class="text-sm font-semibold text-slate-900">{inquiry.adopter_name}</p>
							<StatusPill status={inquiry.status} />
							{#if inquiry.isFresh}
								<span class="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
									New
								</span>
							{/if}
						</div>
						<p class="text-xs font-semibold text-slate-600">
							For {inquiry.animals?.name ?? 'an animal'} · {formatRelative(inquiry.created_at)}
						</p>
						<p class="text-[11px] text-slate-400">{new Date(inquiry.created_at).toLocaleString()}</p>
					</div>
					<div class="flex items-center gap-2">
						<a
							class="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
							href={`/admin/inquiries/${inquiry.id}`}
						>
							Open
						</a>
						<form
							method="POST"
							action="/admin/inquiries?/updateStatus"
							class="relative"
							aria-label="Quick status"
						>
							<input type="hidden" name="inquiryId" value={inquiry.id} />
							<input type="hidden" name="status" value="contacted" />
							<button
								type="submit"
								class="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
							>
								Mark contacted
							</button>
						</form>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>

<section class="mt-10">
	<Disclosure title="Analytics" helper="Context only — not required for daily workflow." defaultOpen={false}>
		<div class="grid gap-3 md:grid-cols-3">
			<div class="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
				<p class="text-xs uppercase tracking-wide text-slate-500">Avg time to first response</p>
				<p class="mt-1 text-base font-semibold text-slate-800">
					{#if data.analytics.timeToFirstResponseHours === null}
						–
					{:else}
						{data.analytics.timeToFirstResponseHours}h
					{/if}
				</p>
			</div>
			<div class="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
				<p class="text-xs uppercase tracking-wide text-slate-500">Stale inquiries</p>
				<p class="mt-1 text-base font-semibold text-slate-800">{data.analytics.staleCount}</p>
			</div>
			<div class="rounded-lg border border-slate-200 bg-slate-50/80 p-3">
				<p class="text-xs uppercase tracking-wide text-slate-500">Inquiries per animal</p>
				<p class="mt-1 text-base font-semibold text-slate-800">
					{#if Number.isNaN(data.analytics.inquiriesPerAnimal)}
						–
					{:else}
						{data.analytics.inquiriesPerAnimal.toFixed(1)}
					{/if}
				</p>
			</div>
		</div>
	</Disclosure>
</section>
