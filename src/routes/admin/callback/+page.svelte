<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
	<div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow">
		<h1 class="text-xl font-semibold text-slate-900">Signing you in...</h1>
		{#if data.errorMessage}
			<p class="mt-4 text-sm text-rose-600">{data.errorMessage}</p>
			<a
				href="/admin/login"
				class="mt-6 inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
				>Back to login</a
			>
		{:else}
			<p class="mt-4 text-sm text-slate-500">You will be redirected shortly.</p>
		{/if}
	</div>
</div>
