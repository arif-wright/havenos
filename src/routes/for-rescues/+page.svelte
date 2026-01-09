<script lang="ts">
	import AmbientPage from '$lib/components/AmbientPage.svelte';
</script>

<AmbientPage
	title="RescueOS for rescues"
	kicker="Workspace"
	subtitle="Publish your rescue page, list adoptables, manage inquiries, and get verified with email + password access."
>
	<div class="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
		<div class="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
			<p class="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Why RescueOS</p>
			<h1 class="text-3xl font-bold text-slate-900">Your rescue workspace, ready for adopters.</h1>
			<p class="text-base text-slate-600">
				Publish your mission, donation link, and adoptable pets. Manage inquiries with statuses, notes, and templates.
				Team roles are email+password based. Verification badges and reporting are built in.
			</p>
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
				<a
					href="/auth/signup"
					class="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-500"
				>
					Create account
				</a>
				<a
					href="/admin/login"
					class="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-100"
				>
					Already have an account? Log in
				</a>
			</div>
		</div>
		<div class="rounded-3xl border border-slate-200 bg-white p-6 text-slate-800 shadow-xl">
			<h2 class="text-lg font-semibold text-slate-900">What you get</h2>
			<ul class="mt-4 space-y-3 text-sm text-slate-600">
				<li>Public rescue page with mission, process, donation URL, and verification badge when approved.</li>
				<li>Pet listings with photos/statuses that stay synced with your dashboard.</li>
				<li>Inquiry inbox with statuses, history, notes, and templates.</li>
				<li>Team roles with email/password login (no magic links).</li>
				<li>Reporting and moderation to keep adopters safe.</li>
			</ul>
		</div>
	</div>

	<section class="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl md:grid-cols-2">
		<div class="space-y-3">
			<h3 class="text-xl font-semibold text-slate-900">How to access</h3>
			<ol class="space-y-2 text-sm text-slate-600">
				<li>1) Create your account with email + password.</li>
				<li>2) Set up your rescue profile, branding, and donation link.</li>
				<li>3) Invite teammates and publish your rescue page.</li>
			</ol>
			<div class="flex flex-wrap gap-3">
				<a
					href="/auth/signup"
					class="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-white shadow hover:-translate-y-0.5 hover:bg-emerald-500"
				>
					Get started
				</a>
				<a
					href="/rescue/sample"
					class="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-slate-800 hover:-translate-y-0.5 hover:bg-slate-100"
				>
					View sample rescue
				</a>
			</div>
		</div>
		<div class="space-y-3">
			<h3 class="text-xl font-semibold text-slate-900">Verification & trust</h3>
			<ul class="space-y-2 text-sm text-slate-600">
				<li>Submit website/socials for a “Verified” badge.</li>
				<li>Add EIN + legal name for “Verified 501(c)(3)” badge.</li>
				<li>Reports feed an admin moderation queue; bad actors can be disabled.</li>
			</ul>
		</div>
	</section>

	<section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
		<h3 class="text-2xl font-semibold text-slate-900">FAQ</h3>
		<div class="mt-6 grid gap-6 md:grid-cols-2">
			{#each [
				{ q: 'Is RescueOS free?', a: 'Yes—Pro billing is optional and coming via Stripe Checkout.' },
				{
					q: 'How do adopters contact us?',
					a: 'They submit an inquiry from your public page; it goes straight to your dashboard.'
				},
				{ q: 'Can multiple volunteers log in?', a: 'Yes. Invite teammates and set roles (owner/admin/staff).' },
				{ q: 'Do we need a website?', a: 'No. Your RescueOS page includes mission, process, pets, and inquiry form.' }
			] as item}
				<div class="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-lg">
					<p class="font-semibold text-slate-900">{item.q}</p>
					<p class="mt-2 text-sm text-slate-600">{item.a}</p>
				</div>
			{/each}
		</div>
	</section>
</AmbientPage>
