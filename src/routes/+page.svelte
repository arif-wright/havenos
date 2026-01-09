<script lang="ts">
	import AmbientPage from '$lib/components/AmbientPage.svelte';

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
        subtitle="Public pages and inbox built for rescues and adopters—clear next steps, no noise."
>
        <div class="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
                <div class="space-y-6">
                        <div class="flex flex-wrap items-center gap-3">
                                <a
                                        class="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_-18px_rgba(5,122,85,0.7)] transition hover:-translate-y-0.5 hover:bg-emerald-500"
                                        href="/auth/signup"
                                >
                                        Create an account
                                </a>
                                <a
                                        class="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)] ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-slate-50"
                                        href="/rescues"
                                >
                                        Browse rescues
                                </a>
                                <a
                                        class="text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline"
                                        href="/rescue/sample"
                                >
                                        View sample rescue →
                                </a>
                        </div>
                </div>
                <div class="relative">
                        <div class="absolute inset-0 rounded-3xl bg-white/40 blur-3xl"></div>
                        <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                                <img src="/images/rescueos-animals.svg" alt="RescueOS workspace" class="w-full" loading="lazy" />
			</div>
		</div>
	</div>

        <section class="rounded-3xl bg-white/70 p-5 shadow-lg ring-1 ring-slate-100">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Built for clarity</p>
                <h2 class="mt-2 text-xl font-semibold text-slate-900">Why it works</h2>
                <div class="mt-3 space-y-2.5">
                        {#each [
                                'Inbox with statuses, history, and templates so nothing gets lost.',
                                'Public profiles that stay in sync—no duplicate editing or stale links.',
                                'Verification badges and reporting guardrails to keep adopters confident.'
                        ] as proof}
                                <div class="flex items-start gap-3 rounded-xl bg-white/70 p-3 text-sm text-slate-700 ring-1 ring-slate-100">
                                        <span class="mt-1 h-5 w-5 rounded-full bg-emerald-50 text-center text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">•</span>
                                        <p class="leading-relaxed">{proof}</p>
                                </div>
                        {/each}
                </div>
        </section>

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
