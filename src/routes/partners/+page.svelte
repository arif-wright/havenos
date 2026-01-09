<script lang="ts">
	import AmbientPage from '$lib/components/AmbientPage.svelte';
	import type { ActionData } from './$types';
	export let form: ActionData;
</script>

<AmbientPage title="Partners & Sponsorships" kicker="Public" subtitle="Share your info and we’ll reach out about partnering with RescueOS.">
	<section class="mx-auto max-w-4xl space-y-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-900 shadow-xl">
		{#if form?.serverError}
			<p class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{form.serverError}</p>
		{:else if form?.success}
			<p class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
				Thanks! We’ll be in touch.
			</p>
		{/if}

		<form method="POST" action="?/submit" class="grid gap-4 md:grid-cols-2">
			<label class="text-sm font-semibold text-slate-800 md:col-span-2">
				Name
				<input
					name="name"
					required
					class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
				/>
			</label>
			<label class="text-sm font-semibold text-slate-800">
				Email
				<input
					name="email"
					type="email"
					required
					class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
				/>
			</label>
			<label class="text-sm font-semibold text-slate-800">
				Organization (optional)
				<input
					name="org"
					class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
				/>
			</label>
			<label class="text-sm font-semibold text-slate-800 md:col-span-2">
				How can we partner?
				<textarea
					name="message"
					rows="4"
					class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
				></textarea>
			</label>
			<div class="md:col-span-2">
				<button
					type="submit"
					class="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-500"
				>
					Submit
				</button>
			</div>
		</form>
		<p class="text-xs text-slate-600">Draft policy for MVP — consult counsel for final language.</p>
	</section>
</AmbientPage>
