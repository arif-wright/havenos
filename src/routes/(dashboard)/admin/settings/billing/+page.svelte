<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<section class="space-y-2">
	<h1 class="text-2xl font-semibold text-slate-900">Billing</h1>
	<p class="text-sm text-slate-600">Upgrade to Pro to unlock higher limits and priority support.</p>
</section>

{#if form?.serverError}
	<p class="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{form.serverError}</p>
{:else if form?.success}
	<p class="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Updated.</p>
{/if}

<div class="mt-6 grid gap-6 md:grid-cols-2">
	<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<h2 class="text-lg font-semibold text-slate-900">Current plan</h2>
		<p class="mt-1 text-sm text-slate-600">
			Plan: <span class="font-semibold text-slate-900">{data.rescue.plan_tier}</span>
			{#if data.rescue.subscription_status}
				· Status: {data.rescue.subscription_status}
			{/if}
		</p>
		{#if data.rescue.current_period_end}
			<p class="text-xs text-slate-500">
				Current period ends {new Date(data.rescue.current_period_end).toLocaleDateString()}
			</p>
		{/if}
	</div>

	<div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<h3 class="text-lg font-semibold text-slate-900">Pro</h3>
		<ul class="space-y-2 text-sm text-slate-600">
			<li>More team members and animals</li>
			<li>More templates</li>
			<li>Priority directory placement (optional)</li>
			<li>Verification + moderation support</li>
		</ul>
		<form method="POST" action="?/upgrade">
			<button
				type="submit"
				class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
			>
				Upgrade to Pro (Stripe Checkout coming soon)
			</button>
		</form>
		<form method="POST" action="?/downgrade" class="pt-2">
			<button
				type="submit"
				class="text-xs font-semibold text-slate-500 hover:text-slate-700"
			>
				Downgrade to Free
			</button>
		</form>
	</div>
</div>
