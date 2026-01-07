<script lang="ts">
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<section class="mx-auto max-w-4xl space-y-6 rounded-3xl border border-white/10 bg-white/8 p-8 text-white shadow-2xl ring-1 ring-white/15 backdrop-blur">
	<h1 class="text-3xl font-bold">Partners & Sponsorships</h1>
	<p class="text-sm text-slate-200/80">Share your info and we’ll reach out about partnering with RescueOS.</p>

	{#if form?.serverError}
		<p class="rounded-lg border border-rose-200/60 bg-rose-500/20 px-3 py-2 text-sm text-rose-50">{form.serverError}</p>
	{:else if form?.success}
		<p class="rounded-lg border border-emerald-200/60 bg-emerald-500/20 px-3 py-2 text-sm text-emerald-50">
			Thanks! We’ll be in touch.
		</p>
	{/if}

	<form method="POST" action="?/submit" class="grid gap-4 md:grid-cols-2">
		<label class="text-sm font-semibold text-slate-100 md:col-span-2">
			Name
			<input
				name="name"
				required
				class="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-200/60 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
			/>
		</label>
		<label class="text-sm font-semibold text-slate-100">
			Email
			<input
				name="email"
				type="email"
				required
				class="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-200/60 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
			/>
		</label>
		<label class="text-sm font-semibold text-slate-100">
			Organization (optional)
			<input
				name="org"
				class="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-200/60 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
			/>
		</label>
		<label class="text-sm font-semibold text-slate-100 md:col-span-2">
			How can we partner?
			<textarea
				name="message"
				rows="4"
				class="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-200/60 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
			></textarea>
		</label>
		<div class="md:col-span-2">
			<button
				type="submit"
				class="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-400"
			>
				Submit
			</button>
		</div>
	</form>
	<p class="text-xs text-slate-300">Draft policy for MVP — consult counsel for final language.</p>
</section>
