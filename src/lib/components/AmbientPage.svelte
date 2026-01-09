<script lang="ts">
	export let title: string | null = null;
	export let kicker: string | null = null;
	export let subtitle: string | null = null;
</script>

<div class="relative isolate overflow-hidden bg-gradient-to-b from-[#eef4f7] via-[#f5f9fb] to-[#eef4f7]">
	<div class="pointer-events-none absolute inset-0">
		<div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.08),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(14,116,144,0.08),transparent_40%)]"></div>
		<div class="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_10%,rgba(255,255,255,0.7),transparent_60%)]"></div>
	</div>

	<div class="relative mx-auto flex max-w-7xl flex-col gap-10 px-5 py-12 text-slate-900">
		{#if title}
			<div class="space-y-3">
				{#if kicker}
					<p class="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">{kicker}</p>
				{/if}
				<h1 class="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">{title}</h1>
				{#if subtitle}
					<p class="max-w-3xl text-base text-slate-700">{subtitle}</p>
				{/if}
			</div>
		{/if}

		<slot />
	</div>
</div>
