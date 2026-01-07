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
		{ href: '/admin/team', label: 'Team' },
		{ href: '/admin/settings', label: 'Settings' },
		{ href: '/admin/settings/billing', label: 'Billing', ownerOnly: true },
		{ href: '/admin/moderation', label: 'Moderation', adminOnly: true }
	];
</script>

<div class="min-h-screen bg-gradient-to-br from-[#0b1f29] via-[#0f2c36] to-[#102a3a] text-[var(--text)]">
	<header class="border-b border-white/10 bg-slate-900/70 backdrop-blur">
		<div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between text-white">
			<div>
				<p class="text-xs uppercase tracking-widest text-emerald-200">RescueOS</p>
				<h1 class="text-2xl font-semibold text-white">{data.currentRescue?.name}</h1>
				<p class="text-sm text-slate-200">{data.currentRescue?.contact_email}</p>
			</div>
			<nav class="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-200">
				{#each links as link}
					{#if (!link.ownerOnly || data.currentMemberRole === 'owner') && (!link.adminOnly || data.isAdmin)}
						<a
							class={`rounded-full px-3 py-2 transition ${
								$page.url.pathname === link.href || $page.url.pathname.startsWith(`${link.href}/`)
									? 'bg-white/10 text-white ring-1 ring-emerald-300/50'
									: 'hover:bg-white/5'
							}`}
							href={link.href}
							aria-current={$page.url.pathname === link.href || $page.url.pathname.startsWith(`${link.href}/`)
								? 'page'
								: undefined}
						>
							{link.label}
						</a>
					{/if}
				{/each}
				<form method="POST" action="/admin/logout">
					<button
						type="submit"
						class="rounded-full border border-white/20 px-3 py-2 text-slate-100 hover:bg-white/10"
					>
						Log out
					</button>
				</form>
			</nav>
		</div>
	</header>
	<main class="admin-shell mx-auto max-w-6xl px-4 py-10 space-y-10">
		{@render children()}
	</main>
	<footer class="mt-6 border-t border-white/10 bg-slate-900/70 px-4 py-6 text-slate-200">
		<div class="mx-auto flex max-w-6xl flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
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
