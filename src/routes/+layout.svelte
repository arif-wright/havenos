<script lang="ts">
	import type { Snippet } from 'svelte';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/stores';

	export let children: Snippet;

	$: isPublicShell =
		!$page.url.pathname.startsWith('/admin') && !$page.url.pathname.startsWith('/onboarding');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if isPublicShell}
	<div class="min-h-screen bg-gradient-to-br from-[#0b1f29] via-[#0f2c36] to-[#102a3a] text-[var(--text)]">
		<header class="sticky top-0 z-20 border-b border-white/10 bg-slate-900/60 backdrop-blur">
			<div class="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 text-white">
				<a href="/" class="text-lg font-semibold">RescueOS</a>
				<nav class="flex items-center gap-3 text-sm font-semibold">
					<a class="rounded-full px-3 py-2 hover:bg-white/10" href="/">Home</a>
					<a class="rounded-full px-3 py-2 hover:bg-white/10" href="/rescues">Browse rescues</a>
					<a class="rounded-full px-3 py-2 hover:bg-white/10" href="/for-rescues">For rescues</a>
					<a class="rounded-full px-3 py-2 hover:bg-white/10" href="/support">Support</a>
					<a class="rounded-full px-3 py-2 hover:bg-white/10" href="/partners">Partners</a>
					<a
						class="rounded-full border border-emerald-300/60 px-3 py-2 text-emerald-100 hover:bg-emerald-400/10"
						href="/admin/login"
					>
						Admin login
					</a>
				</nav>
			</div>
		</header>
		<main class="relative isolate overflow-hidden">
			{@render children()}
		</main>
		<footer class="mt-16 border-t border-white/10 bg-slate-900/70 text-slate-200">
			<div class="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
				<div class="space-x-3">
					<a class="hover:text-white" href="/privacy">Privacy</a>
					<a class="hover:text-white" href="/terms">Terms</a>
					<a class="hover:text-white" href="/acceptable-use">Acceptable Use</a>
					<a class="hover:text-white" href="/refunds">Refunds</a>
					<a class="hover:text-white" href="/support">Support</a>
					<a class="hover:text-white" href="/partners">Partners</a>
				</div>
				<div class="space-y-1 text-xs text-slate-400 sm:text-right">
					<p>© {new Date().getFullYear()} RescueOS. All rights reserved.</p>
					<p>RescueOS is operated by D-Twenty Farms LLC (DBA RescueOS).</p>
					<p class="text-[11px] text-slate-500">RescueOS is not affiliated with Facebook, Instagram, or LinkedIn.</p>
				</div>
			</div>
		</footer>
	</div>
{:else}
	{@render children()}
{/if}
