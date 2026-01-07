<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0b1f29] via-[#0f2c36] to-[#102a3a] px-4 text-white">
	<div class="w-full max-w-md rounded-2xl border border-white/15 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
		<div class="mb-6 text-center">
			<p class="text-sm uppercase tracking-wider text-emerald-200">RescueOS Admin</p>
			<h1 class="mt-2 text-2xl font-semibold text-white">Sign in to your rescue workspace.</h1>
			<p class="mt-1 text-sm text-slate-200/80">Only approved team members can access RescueOS.</p>
		</div>

		{#if data.disabledNotice}
			<div class="mb-4 rounded-md border border-amber-200/60 bg-amber-500/20 p-3 text-sm text-amber-50">
				This rescue has been disabled. Contact RescueOS to regain access.
			</div>
		{/if}

		{#if form?.serverError}
			<div class="mb-4 rounded-md border border-rose-200/60 bg-rose-500/20 p-3 text-sm text-rose-50">
				{form.serverError}
			</div>
		{/if}

		<form method="POST" class="space-y-5">
			<input type="hidden" name="redirectTo" value={data.redirectTo} />
			<label class="block text-sm font-medium text-slate-100">
				<span>Email</span>
				<input
					type="email"
					name="email"
					class="mt-1 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-300 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
					placeholder="you@rescue.org"
					required
				/>
				{#if form?.errors?.email}
					<span class="mt-1 block text-xs text-rose-200">{form.errors.email[0]}</span>
				{/if}
			</label>
			<label class="block text-sm font-medium text-slate-100">
				<span>Password</span>
				<input
					type="password"
					name="password"
					class="mt-1 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-300 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
					placeholder="********"
					required
					autocomplete="current-password"
				/>
				{#if form?.errors?.password}
					<span class="mt-1 block text-xs text-rose-200">{form.errors.password[0]}</span>
				{/if}
			</label>
			<div class="flex items-center justify-between text-sm">
				<span class="text-slate-200/80">Forgot password?</span>
				<a class="font-semibold text-emerald-200 hover:text-emerald-100" href="/auth/reset">Reset it</a>
			</div>
			<button
				type="submit"
				class="w-full rounded-md bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-slate-900"
			>
				Sign in
			</button>
		</form>
		{#if data.googleEnabled}
			<form method="POST" action="?/google" class="mt-4">
				<input type="hidden" name="redirectTo" value={data.redirectTo} />
				<button
					type="submit"
					class="w-full rounded-md border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 focus:ring-offset-slate-900"
				>
					Continue with Google
				</button>
			</form>
		{/if}
		<div class="mt-6 text-center text-xs text-slate-300 space-y-1">
			<p>Need an account? <a class="font-semibold text-emerald-200 hover:text-emerald-100" href="/auth/signup">Create one</a>.</p>
			<p class="text-slate-400">Need access? Ask your rescue owner.</p>
		</div>
	</div>
</div>
