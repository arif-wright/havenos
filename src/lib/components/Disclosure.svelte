<script lang="ts">
	import type { Snippet } from 'svelte';

	export let title: string;
	export let helper: string | null = null;
	export let defaultOpen = false;
	export let children: Snippet;

	let open = defaultOpen;
</script>

<div class="rounded-2xl border border-slate-200 bg-white">
	<button
		type="button"
		class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-slate-50"
		on:click={() => (open = !open)}
	>
		<div>
			<p>{title}</p>
			{#if helper}
				<p class="text-xs font-normal text-slate-500">{helper}</p>
			{/if}
		</div>
		<span class="text-slate-500">{open ? 'Hide' : 'Show'}</span>
	</button>
	{#if open}
		<div class="border-t border-slate-100 px-4 py-4">
			{@render children?.()}
		</div>
	{/if}
</div>
