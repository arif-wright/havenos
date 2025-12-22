<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import PublicProfileForm from '$lib/components/PublicProfileForm.svelte';

	export let data: PageData;
	export let form: ActionData;
</script>

<section class="space-y-2">
	<h1 class="text-2xl font-semibold text-slate-900">Settings</h1>
	<p class="text-sm text-slate-600">
		Manage your public rescue information.
	</p>
</section>

<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	<h2 class="text-lg font-semibold text-slate-900">Public Profile</h2>
	<p class="text-sm text-slate-600">
		This information appears on your public rescue page to help adopters understand your mission and process.
	</p>
	{#if form?.serverError}
		<p class="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
			{form.serverError}
		</p>
	{/if}
	{#if form?.success}
		<p class="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
			Profile updated.
		</p>
	{/if}
	<div class="mt-4">
		<PublicProfileForm
			name={data.currentRescue?.name}
			contactEmail={data.currentRescue?.contact_email}
			mission={data.currentRescue?.mission_statement}
			adoptionProcess={data.currentRescue?.adoption_process}
			responseTime={data.currentRescue?.response_time_text}
		/>
	</div>
</section>
