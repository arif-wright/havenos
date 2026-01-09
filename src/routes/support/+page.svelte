<script lang="ts">
	import AmbientPage from '$lib/components/AmbientPage.svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;
let amount = 1000;
</script>

<AmbientPage
	title="Support RescueOS"
	kicker="Public"
	subtitle="One-time sponsor payments help keep RescueOS running. These are not tax-deductible."
>
	<section class="mx-auto max-w-3xl space-y-6 rounded-3xl border border-slate-200 bg-white p-8 text-slate-900 shadow-xl">
		{#if form?.serverError}
			<p class="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">{form.serverError}</p>
		{:else if form?.success}
			<p class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
				Thank you! We logged your support.
			</p>
		{/if}

		<form method="POST" action="?/sponsor" class="space-y-4">
			<label class="text-sm font-semibold text-slate-800">
				Email (optional for receipt)
				<input
					name="email"
					type="email"
					class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
				/>
			</label>
			<div class="grid gap-3 md:grid-cols-4">
				{#each [500, 1000, 2500, 5000] as amt}
					<button
						type="button"
						class={`rounded-xl border px-3 py-2 text-sm font-semibold ${
							amount === amt
								? 'border-emerald-400 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100'
								: 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
						}`}
						on:click={() => (amount = amt)}
					>
						${amt / 100}
					</button>
				{/each}
			</div>
			<label class="text-sm font-semibold text-slate-800">
				Custom amount ($)
				<input
					type="number"
					min="2"
					step="1"
					value={amount / 100}
					on:input={(e) => (amount = Math.round(Number((e.target as HTMLInputElement).value || '0') * 100))}
					class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
				/>
			</label>
			<input type="hidden" name="amount_cents" value={amount} />
			<button
				type="submit"
				class="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-500"
			>
				Support RescueOS
			</button>
		</form>
		<p class="text-xs text-slate-600">Draft policy for MVP — consult counsel for final language.</p>
	</section>
</AmbientPage>
