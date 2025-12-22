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
	<div class="min-h-screen bg-slate-50 text-slate-900">
		<header class="border-b border-slate-200 bg-white">
			<div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
				<a href="/" class="text-lg font-semibold text-slate-900">RescueOS</a>
				<nav class="flex items-center gap-4 text-sm font-semibold text-slate-700">
					<a class="rounded-md px-3 py-2 hover:bg-slate-100" href="/">Home</a>
					<a class="rounded-md px-3 py-2 hover:bg-slate-100" href="/rescues">Browse rescues</a>
					<a class="rounded-md px-3 py-2 hover:bg-slate-100" href="/for-rescues">For rescues</a>
					<a
						class="rounded-md border border-emerald-600 px-3 py-2 text-emerald-700 hover:bg-emerald-50"
						href="/admin/login"
					>
						Admin login
					</a>
				</nav>
			</div>
		</header>
		<main class="mx-auto max-w-6xl px-4 py-10">
			{@render children()}
		</main>
	</div>
{:else}
	{@render children()}
{/if}
