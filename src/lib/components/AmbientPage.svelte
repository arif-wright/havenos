<script lang="ts">
	export let title: string | null = null;
	export let kicker: string | null = null;
	export let subtitle: string | null = null;
</script>

<div class="relative isolate overflow-hidden">
	<div class="pointer-events-none absolute inset-0">
		<div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,197,193,0.18),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(97,152,203,0.2),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(114,187,140,0.12),transparent_40%)]"></div>
		<div class="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_10%,rgba(255,255,255,0.18),transparent_60%)]"></div>
	</div>

	<div class="relative mx-auto flex max-w-7xl flex-col gap-10 px-5 py-12 text-white">
		{#if title}
			<div class="space-y-3">
				{#if kicker}
					<p class="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">{kicker}</p>
				{/if}
				<h1 class="text-4xl font-bold leading-tight sm:text-5xl">{title}</h1>
				{#if subtitle}
					<p class="max-w-3xl text-base text-slate-200/90">{subtitle}</p>
				{/if}
			</div>
		{/if}

		<slot />
	</div>
</div>
