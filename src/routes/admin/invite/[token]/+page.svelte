<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="min-h-[60vh] bg-gradient-to-br from-[#0b1f29] via-[#0f2c36] to-[#102a3a] flex items-center justify-center px-4 text-white">
	<div class="w-full max-w-md rounded-2xl border border-white/12 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
		<h1 class="text-2xl font-semibold text-white">Accept invitation</h1>
		<p class="mt-1 text-sm text-slate-200/80">Join the rescue team associated with this invite.</p>

		{#if form?.success}
			<p class="mt-4 rounded-md border border-emerald-200/60 bg-emerald-500/20 p-3 text-sm text-emerald-50">
				Success! You have been added to the rescue. Go to <a class="font-semibold text-emerald-200" href="/admin"
					>dashboard</a
				>.
			</p>
		{:else}
			<form method="POST" class="mt-6 space-y-3">
				<button
					type="submit"
					class="w-full rounded-md bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg hover:-translate-y-0.5 hover:bg-emerald-400"
				>
					Accept invitation
				</button>
			</form>
			{#if form?.serverError}
				<p class="mt-3 rounded-md border border-rose-200/60 bg-rose-500/20 p-3 text-sm text-rose-50">
					{form.serverError}
				</p>
			{/if}
		{/if}
	</div>
</div>
