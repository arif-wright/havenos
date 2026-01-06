<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
	<div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
		<div class="mb-6 text-center">
			<p class="text-sm uppercase tracking-wider text-emerald-600">RescueOS Admin</p>
			<h1 class="mt-2 text-2xl font-semibold text-slate-900">Sign in to your rescue workspace.</h1>
			<p class="mt-1 text-sm text-slate-500">Only approved team members can access RescueOS.</p>
		</div>

		{#if form?.serverError}
			<div class="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
				{form.serverError}
			</div>
		{/if}

		<form method="POST" class="space-y-5">
			<input type="hidden" name="redirectTo" value={data.redirectTo} />
			<label class="block text-sm font-medium text-slate-700">
				<span>Email</span>
				<input
					type="email"
					name="email"
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					placeholder="you@rescue.org"
					required
				/>
				{#if form?.errors?.email}
					<span class="mt-1 block text-xs text-rose-600">{form.errors.email[0]}</span>
				{/if}
			</label>
			<label class="block text-sm font-medium text-slate-700">
				<span>Password</span>
				<input
					type="password"
					name="password"
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					placeholder="********"
					required
					autocomplete="current-password"
				/>
				{#if form?.errors?.password}
					<span class="mt-1 block text-xs text-rose-600">{form.errors.password[0]}</span>
				{/if}
			</label>
			<div class="flex items-center justify-between text-sm">
				<span class="text-slate-500">Forgot password?</span>
				<a class="font-semibold text-emerald-700 hover:text-emerald-600" href="/auth/reset">Reset it</a>
			</div>
			<button
				type="submit"
				class="w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
			>
				Sign in
			</button>
		</form>
		{#if data.googleEnabled}
			<form method="POST" action="?/google" class="mt-4">
				<input type="hidden" name="redirectTo" value={data.redirectTo} />
				<button
					type="submit"
					class="w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2"
				>
					Continue with Google
				</button>
			</form>
		{/if}
		<p class="mt-6 text-center text-xs text-slate-400">Need access? Ask your rescue owner.</p>
	</div>
</div>
