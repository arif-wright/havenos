<script lang="ts">
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
	export let children: Snippet;
	const links = [
		{ href: '/admin', label: 'Dashboard' },
		{ href: '/admin/animals', label: 'Animals' },
		{ href: '/admin/inquiries', label: 'Inquiries' },
		{ href: '/admin/templates', label: 'Templates' },
		{ href: '/admin/team', label: 'Team' }
	];
</script>

<div class="min-h-screen bg-slate-50">
	<header class="border-b border-slate-200 bg-white">
		<div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between">
			<div>
				<p class="text-xs uppercase tracking-widest text-emerald-600">HavenOS</p>
				<h1 class="text-2xl font-semibold text-slate-900">{data.currentRescue?.name}</h1>
				<p class="text-sm text-slate-500">{data.currentRescue?.contact_email}</p>
			</div>
			<nav class="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600">
				{#each links as link}
					{#if $page.url.pathname === link.href || $page.url.pathname.startsWith(`${link.href}/`)}
						<span class="rounded-md bg-emerald-50 px-3 py-1 text-emerald-700">{link.label}</span>
					{:else}
						<a class="rounded-md px-3 py-1 hover:bg-slate-100" href={link.href}>{link.label}</a>
					{/if}
				{/each}
				<form method="POST" action="/admin/logout">
					<button
						type="submit"
						class="rounded-md border border-slate-300 px-3 py-1 text-slate-600 hover:bg-slate-100"
					>
						Log out
					</button>
				</form>
			</nav>
		</div>
	</header>
	<main class="mx-auto max-w-6xl px-4 py-10">
		{@render children()}
	</main>
</div>
