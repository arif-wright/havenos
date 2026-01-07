<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;
	let amount = 1000;
</script>

<section class="mx-auto max-w-3xl space-y-6 rounded-3xl border border-white/10 bg-white/8 p-8 text-white shadow-2xl ring-1 ring-white/15 backdrop-blur">
	<h1 class="text-3xl font-bold">Support RescueOS</h1>
	<p class="text-sm text-slate-200/80">
		One-time sponsor payments help keep RescueOS running. These are <strong>not tax-deductible</strong>.
	</p>

	{#if form?.serverError}
		<p class="rounded-lg border border-rose-200/60 bg-rose-500/20 px-3 py-2 text-sm text-rose-50">{form.serverError}</p>
	{:else if form?.success}
		<p class="rounded-lg border border-emerald-200/60 bg-emerald-500/20 px-3 py-2 text-sm text-emerald-50">
			Thank you! We logged your support.
		</p>
	{/if}

	<form method="POST" action="?/sponsor" class="space-y-4">
		<label class="text-sm font-semibold text-slate-100">
			Email (optional for receipt)
			<input
				name="email"
				type="email"
				class="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-200/60 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
			/>
		</label>
		<div class="grid gap-3 md:grid-cols-4">
			{#each [500, 1000, 2500, 5000] as amt}
				<button
					type="button"
					class={`rounded-xl border px-3 py-2 text-sm font-semibold ${amount === amt ? 'border-emerald-300 bg-emerald-500/20 text-white' : 'border-white/15 bg-white/5 text-slate-100'}`}
					on:click={() => (amount = amt)}
				>
					${amt / 100}
				</button>
			{/each}
		</div>
		<label class="text-sm font-semibold text-slate-100">
			Custom amount ($)
			<input
				type="number"
				min="2"
				step="1"
				value={amount / 100}
				on:input={(e) => (amount = Math.round(Number((e.target as HTMLInputElement).value || '0') * 100))}
				class="mt-1 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-200/60 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/40"
			/>
		</label>
		<input type="hidden" name="amount_cents" value={amount} />
		<button
			type="submit"
			class="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-400"
		>
			Support RescueOS
		</button>
	</form>
</section>
