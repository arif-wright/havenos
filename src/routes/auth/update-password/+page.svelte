<script lang="ts">
	import type { ActionData, PageServerLoad } from './$types';

	export let data: Awaited<ReturnType<PageServerLoad>>;
	export let form: ActionData;
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
	<div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
		<div class="mb-6 text-center">
			<p class="text-sm uppercase tracking-wider text-emerald-600">RescueOS</p>
			<h1 class="mt-2 text-2xl font-semibold text-slate-900">Set a new password</h1>
			<p class="mt-1 text-sm text-slate-500">Enter a new password for your account.</p>
		</div>

		{#if data.errorMessage}
			<div class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
				{data.errorMessage}
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
