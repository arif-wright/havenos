<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0b1f29] via-[#0f2c36] to-[#102a3a] px-4 text-white">
	<div class="w-full max-w-md rounded-2xl border border-white/12 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
		<div class="mb-6 text-center">
			<p class="text-sm uppercase tracking-wider text-emerald-200">RescueOS</p>
			<h1 class="mt-2 text-2xl font-semibold text-white">Reset your password</h1>
			<p class="mt-1 text-sm text-slate-200/80">Enter the email associated with your RescueOS account.</p>
		</div>

		{#if form?.serverError}
			<div class="mb-4 rounded-md border border-rose-200/60 bg-rose-500/20 p-3 text-sm text-rose-50">
				{form.serverError}
			</div>
		{/if}

		{#if form?.success}
			<div class="rounded-md border border-emerald-200/60 bg-emerald-500/20 p-4 text-sm text-emerald-50">
				Check your email for a link to reset your password.
			</div>
		{:else}
			<form method="POST" class="space-y-5">
				<label class="block text-sm font-medium text-slate-100">
					<span>Email</span>
					<input
						type="email"
						name="email"
						class="mt-1 w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-200/70 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/60"
						placeholder="you@rescue.org"
						required
					/>
					{#if form?.errors?.email}
						<span class="mt-1 block text-xs text-rose-200">{form.errors.email[0]}</span>
					{/if}
				</label>
				<button
					type="submit"
					class="w-full rounded-md bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-900 shadow-lg hover:-translate-y-0.5 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200/70 focus:ring-offset-2 focus:ring-offset-slate-900"
				>
					Send reset link
				</button>
			</form>
			<p class="mt-6 text-center text-xs text-slate-300">
				Remembered your password?
				<a class="font-semibold text-emerald-200 hover:text-emerald-100" href="/admin/login">Back to sign in</a>
			</p>
		{/if}
	</div>
</div>
