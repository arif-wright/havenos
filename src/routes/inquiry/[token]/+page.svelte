<script lang="ts">
	import AmbientPage from '$lib/components/AmbientPage.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const steps = [
		{ key: 'received', label: 'Received', body: 'We delivered your inquiry.' },
		{ key: 'review', label: 'In Review', body: 'The rescue is reviewing your note.' },
		{ key: 'contacted', label: 'Contacted', body: 'The rescue plans to reach out.' },
		{ key: 'scheduled', label: 'Scheduled', body: 'Next step is in motion (meet/application).' },
		{ key: 'closed', label: 'Closed', body: 'Adoption is closed or completed.' }
	];

	const statusToStep: Record<string, number> = {
		new: 1,
		contacted: 2,
		application: 2,
		meet_greet: 3,
		approved: 3,
		adopted: 4,
		closed: 4
	};

	const statusLabels: Record<string, string> = {
		new: 'Received',
		contacted: 'Contacted',
		application: 'Application in review',
		meet_greet: 'Meet & greet scheduled',
		approved: 'Approved',
		adopted: 'Adopted',
		closed: 'Closed'
	};

	$: activeStep = statusToStep[data.status] ?? 1;

	const responseLabels: Record<string, string> = {
		same_day: 'Same day',
		'24_48': '24–48 hours',
		'3_5': '3–5 days',
		'1w_plus': '1+ week'
	};

	const formatDate = (value: string) =>
		new Date(value).toLocaleString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});

	const expiresOn = data.expires_at ? new Date(data.expires_at) : null;
</script>

<AmbientPage
	title="Inquiry status"
	kicker="Adopter view"
	subtitle="Track the progress of your inquiry. We only show public-friendly details—no login required."
>
	<section class="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div class="flex items-start gap-4">
				{#if data.animal.photo}
					<img
						src={data.animal.photo}
						alt={`Photo of ${data.animal.name}`}
						class="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200"
						loading="lazy"
					/>
				{:else}
					<div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
						{data.animal.name.slice(0, 2).toUpperCase()}
					</div>
				{/if}
				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Inquiry received</p>
					<h1 class="text-2xl font-semibold text-slate-900">{data.animal.name}</h1>
					<p class="text-sm text-slate-600">
						{data.rescue.name}
						{#if data.rescue.location_text}
							• {data.rescue.location_text}
						{/if}
					</p>
					<p class="mt-1 text-xs text-slate-500">
						Submitted {formatDate(data.created_at)} • Last update {formatDate(data.updated_at)}
					</p>
				</div>
			</div>
			{#if data.rescue.slug}
				<a
					class="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
					href={`/rescue/${data.rescue.slug}`}
				>
					View rescue page
					<span aria-hidden="true">→</span>
				</a>
			{/if}
		</div>

		<div class="mt-6 space-y-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
			<div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
				<span>Timeline</span>
				<span class="rounded-full bg-white px-2 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
					{statusLabels[data.status] ?? data.status}
				</span>
				{#if data.rescue.response_time_enum || data.rescue.response_time_text}
					<span class="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
						Typical response: {responseLabels[data.rescue.response_time_enum ?? ''] ?? data.rescue.response_time_text}
					</span>
				{/if}
			</div>
			<div class="grid gap-3 md:grid-cols-5">
				{#each steps as step, idx}
					<div class="flex items-start gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/80 p-3 shadow-sm">
						<div
							class={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
								idx === 0 || idx <= activeStep
									? 'bg-emerald-600 text-white'
									: 'bg-slate-100 text-slate-500'
							}`}
							aria-label={idx === 0 || idx <= activeStep ? 'Complete' : 'Pending'}
						>
							{idx + 1}
						</div>
						<div class="space-y-1">
							<p class="text-sm font-semibold text-slate-900">{step.label}</p>
							<p class="text-xs text-slate-600">{step.body}</p>
							{#if idx === activeStep}
								<p class="text-[11px] font-semibold uppercase tracking-[0.1em] text-emerald-700">
									Now
								</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<div class="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
		<section class="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
			<h2 class="text-lg font-semibold text-slate-900">What happens next</h2>
			<p class="mt-2 text-sm text-slate-700">
				The rescue keeps updates in RescueOS. If you do not hear back soon, you can follow up with the contact options below.
			</p>
			{#if data.rescue.response_time_text || data.rescue.response_time_enum}
				<p class="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
					Expected response: {responseLabels[data.rescue.response_time_enum ?? ''] ?? data.rescue.response_time_text}
				</p>
			{/if}
			<div class="mt-4 grid gap-3 sm:grid-cols-2">
				<div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
					<p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Status</p>
					<p class="mt-1 text-base font-semibold text-slate-900">
						{statusLabels[data.status] ?? data.status}
					</p>
					<p class="text-xs text-slate-600">Updated {formatDate(data.updated_at)}</p>
				</div>
				<div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
					<p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Reference</p>
					<p class="mt-1 text-base font-semibold text-slate-900">Token: {data.token}</p>
					<p class="text-xs text-slate-600">Share this page to follow along. Links can be revoked anytime.</p>
					{#if expiresOn}
						<p class="text-[11px] font-semibold text-amber-700">
							Expires {expiresOn.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} unless reopened.
						</p>
					{/if}
				</div>
			</div>
		</section>

		<section class="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
			<h2 class="text-lg font-semibold text-slate-900">Alternate contact methods</h2>
			<p class="mt-1 text-sm text-slate-600">
				Prefer email? Write to the rescue with your name and this pet’s name so they can match your inquiry.
			</p>
			<div class="mt-4 space-y-2 text-sm font-semibold text-emerald-700">
				{#if data.rescue.contact_email}
					<a class="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 hover:bg-emerald-50" href={`mailto:${data.rescue.contact_email}`}>
						<span>Email {data.rescue.contact_email}</span>
						<span aria-hidden="true">→</span>
					</a>
				{/if}
				{#if data.rescue.website_url}
					<a class="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 hover:bg-emerald-50" href={data.rescue.website_url} target="_blank" rel="noreferrer">
						<span>Website</span>
						<span aria-hidden="true">→</span>
					</a>
				{/if}
				{#if data.rescue.instagram_url}
					<a class="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 hover:bg-emerald-50" href={data.rescue.instagram_url} target="_blank" rel="noreferrer">
						<span>Instagram</span>
						<span aria-hidden="true">→</span>
					</a>
				{/if}
				{#if data.rescue.facebook_url}
					<a class="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 hover:bg-emerald-50" href={data.rescue.facebook_url} target="_blank" rel="noreferrer">
						<span>Facebook</span>
						<span aria-hidden="true">→</span>
					</a>
				{/if}
			</div>
			{#if !data.rescue.contact_email && !data.rescue.website_url && !data.rescue.instagram_url && !data.rescue.facebook_url}
				<p class="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
					The rescue has not published extra contact methods yet. We’ll email you when they reply.
				</p>
			{/if}
		</section>
	</div>
</AmbientPage>
