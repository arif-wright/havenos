<script lang="ts">
	import { onMount } from 'svelte';
	import { supabaseBrowser } from '$lib/supabaseClient';
	import type { ActionData, PageServerLoad } from './$types';

	export let data: Awaited<ReturnType<PageServerLoad>>;
	export let form: ActionData;

	let errorMessage = data?.errorMessage;
	let initializingSession = data?.needsSession ?? false;

	onMount(async () => {
		const hashParams = new URLSearchParams(window.location.hash.slice(1));
		const queryParams = new URLSearchParams(window.location.search);
		const accessToken = hashParams.get('access_token');
		const refreshToken = hashParams.get('refresh_token');
		const code = hashParams.get('code') ?? queryParams.get('code');

		if (!accessToken && !refreshToken && !code) {
			return;
		}

		initializingSession = true;
		errorMessage = null;

		if (accessToken && refreshToken) {
			const { error } = await supabaseBrowser.auth.setSession({
				access_token: accessToken,
				refresh_token: refreshToken
			});
			if (error) {
				errorMessage = 'Invalid or expired reset link.';
				initializingSession = false;
				return;
			}
		} else if (code) {
			const { error } = await supabaseBrowser.auth.exchangeCodeForSession(code);
			if (error) {
				errorMessage = 'Invalid or expired reset link.';
				initializingSession = false;
				return;
			}
		}

		// Strip tokens from the URL and reload so the server sees the session cookie.
		window.location.replace(window.location.pathname);
	});
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
	<div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
		<div class="mb-6 text-center">
			<p class="text-sm uppercase tracking-wider text-emerald-600">RescueOS</p>
			<h1 class="mt-2 text-2xl font-semibold text-slate-900">Set a new password</h1>
			<p class="mt-1 text-sm text-slate-500">Enter a new password for your account.</p>
		</div>

		{#if errorMessage}
			<div class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
				{errorMessage}
			</div>
		{:else if initializingSession}
			<div class="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
				Verifying your reset link...
			</div>
		{:else}
			{#if form?.serverError}
				<div class="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
					{form.serverError}
				</div>
			{/if}
			<form method="POST" class="space-y-5">
				<label class="block text-sm font-medium text-slate-700">
					<span>New password</span>
					<input
						type="password"
						name="password"
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
						placeholder="********"
						required
						autocomplete="new-password"
					/>
					{#if form?.errors?.password}
						<span class="mt-1 block text-xs text-rose-600">{form.errors.password[0]}</span>
					{/if}
				</label>
				<label class="block text-sm font-medium text-slate-700">
					<span>Confirm password</span>
					<input
						type="password"
						name="confirmPassword"
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
						placeholder="********"
						required
						autocomplete="new-password"
					/>
					{#if form?.errors?.confirmPassword}
						<span class="mt-1 block text-xs text-rose-600">{form.errors.confirmPassword[0]}</span>
					{/if}
				</label>
				<button
					type="submit"
					class="w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
				>
					Update password
				</button>
			</form>
		{/if}
	</div>
</div>
