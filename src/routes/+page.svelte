<script lang="ts">
	import AmbientPage from '$lib/components/AmbientPage.svelte';

	const signals = ['Inquiry history & notes', 'Public pages kept in sync', 'Team-ready roles', 'Email + password login'];

	const adopterSteps = [
		{ title: 'Browse rescues & pets', body: "Search trust-forward rescue pages with clear next steps." },
		{ title: 'Send an inquiry', body: 'One form that reaches the rescue inbox—no lost DMs.' },
		{ title: 'Know what happens next', body: 'Response time + adoption steps are published.' }
	];

	const rescueSteps = [
		{ title: 'Publish your rescue', body: 'Set your mission, policies, and donation link once.' },
		{ title: 'List animals', body: 'Status, photos, and tags stay in sync with public pages.' },
		{ title: 'Respond with clarity', body: 'Inbox with statuses, notes, templates, and verification badge.' }
	];
</script>

<AmbientPage
	title="A calm, reliable rescue workspace."
	kicker="RescueOS"
	subtitle="Model A: public trust, verified badges, reporting, and billing-ready flows for rescues and adopters."
>
	<div class="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
		<div class="space-y-6">
			<div class="flex flex-wrap gap-3">
				<a
					class="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_-18px_rgba(5,122,85,0.7)] transition hover:-translate-y-0.5 hover:bg-emerald-500"
					href="/rescues"
				>
					Browse rescues
				</a>
				<a
					class="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)] ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50"
					href="/for-rescues"
				>
					For rescues
				</a>
				<a
					class="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)] ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50"
					href="/rescue/sample"
				>
					View sample rescue
				</a>
			</div>
			<div class="flex flex-wrap gap-2">
				{#each signals as item}
					<span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100 shadow-sm">
						✔ {item}
					</span>
				{/each}
			</div>
			<div class="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
				<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
					<div>
						<p class="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Model A</p>
						<p class="text-lg font-semibold text-slate-900">
							Self-serve signup, verification badges, reporting, and billing-ready tiers.
						</p>
						<p class="text-sm text-slate-600">Email + password auth (no magic links).</p>
					</div>
					<a
						class="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-500"
						href="/auth/signup"
					>
						Create account
						<span aria-hidden="true">→</span>
					</a>
				</div>
			</div>
		</div>
		<div class="relative">
			<div class="absolute inset-0 rounded-3xl bg-white/40 blur-3xl"></div>
			<div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
				<img src="/images/rescueos-animals.svg" alt="RescueOS workspace" class="w-full" loading="lazy" />
			</div>
		</div>
	</div>

	<div class="grid gap-5 md:grid-cols-3">
		{#each [
			{
				title: 'For adopters',
				body: 'Find rescues with clear timelines, verified badges, and adoptable pets in one place.'
			},
			{
				title: 'For rescues',
				body: 'Public pages + inbox + templates. Team roles with email/password login and verification requests.'
			},
			{
				title: 'Trust & safety',
				body: 'Verification badges (standard + 501(c)(3)), reporting, moderation queue, and policy surfaces.'
			}
		] as card}
			<div class="rounded-2xl bg-white p-5 text-slate-800 shadow-lg ring-1 ring-slate-200">
				<h3 class="text-lg font-semibold text-slate-900">{card.title}</h3>
				<p class="mt-2 text-sm text-slate-600">{card.body}</p>
			</div>
		{/each}
	</div>

	<section class="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
		<h2 class="text-2xl font-semibold text-slate-900">How it works</h2>
		<div class="mt-4 grid gap-4 md:grid-cols-2">
			<div class="space-y-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
				<p class="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">For adopters</p>
				{#each adopterSteps as step, idx}
					<div class="flex gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200 shadow-sm">
						<span class="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
							{idx + 1}
						</span>
						<div>
							<p class="font-semibold text-slate-900">{step.title}</p>
							<p class="text-sm text-slate-600">{step.body}</p>
						</div>
					</div>
				{/each}
			</div>
			<div class="space-y-2 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
				<p class="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-700">For rescues</p>
				{#each rescueSteps as step, idx}
					<div class="flex gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200 shadow-sm">
						<span class="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
							{idx + 1}
						</span>
						<div>
							<p class="font-semibold text-slate-900">{step.title}</p>
							<p class="text-sm text-slate-600">{step.body}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>
</AmbientPage>
