<script lang="ts">
	import type { ActionData, PageServerLoad } from './$types';

  export let form: ActionData;
</script>

<div class="min-h-[60vh] bg-slate-50 flex items-center justify-center px-4">
	<div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
		<h1 class="text-2xl font-semibold text-slate-900">Accept invitation</h1>
		<p class="mt-1 text-sm text-slate-600">Join the rescue team associated with this invite.</p>

		{#if form?.success}
			<p class="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
				Success! You have been added to the rescue. Go to <a class="font-semibold text-emerald-700" href="/admin"
					>dashboard</a
				>.
			</p>
		{:else}
			<form method="POST" class="mt-6 space-y-3">
				<button
					type="submit"
					class="w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
				>
					Accept invitation
				</button>
			</form>
			{#if form?.serverError}
				<p class="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
					{form.serverError}
				</p>
			{/if}
		{/if}
	</div>
</div>
