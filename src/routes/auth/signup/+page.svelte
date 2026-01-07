<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;

	const errors = (form?.errors ?? {}) as Record<string, string[]>;
</script>

<div class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
	<div class="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur">
		<p class="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">RescueOS</p>
		<h1 class="mt-2 text-3xl font-bold text-slate-900">Create your rescue account</h1>
		<p class="mt-1 text-sm text-slate-600">
			Use email and password. No magic links. After signup we’ll create your rescue workspace.
		</p>

		{#if form?.serverError}
			<div class="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
				{form.serverError}
			</div>
		{/if}

		<form method="POST" class="mt-6 grid gap-4 md:grid-cols-2">
			<label class="text-sm font-semibold text-slate-800 md:col-span-2">
				<span>Rescue name</span>
				<input
					name="name"
					required
					class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
					value={form?.values?.name ?? ''}
					placeholder="Your rescue name"
				/>
				{#if errors.name}
					<span class="mt-1 block text-xs text-rose-600">{errors.name[0]}</span>
				{/if}
			</label>

			<label class="text-sm font-semibold text-slate-800">
				<span>Email</span>
				<input
					name="email"
					type="email"
					required
					autocomplete="email"
					class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
					value={form?.values?.email ?? ''}
					placeholder="you@rescue.org"
				/>
				{#if errors.email}
					<span class="mt-1 block text-xs text-rose-600">{errors.email[0]}</span>
				{/if}
			</label>

			<label class="text-sm font-semibold text-slate-800">
				<span>Password</span>
				<input
					name="password"
					type="password"
					required
					minlength="8"
					autocomplete="new-password"
					class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
					placeholder="********"
				/>
				{#if errors.password}
					<span class="mt-1 block text-xs text-rose-600">{errors.password[0]}</span>
				{/if}
			</label>

			<label class="text-sm font-semibold text-slate-800">
				<span>Confirm password</span>
				<input
					name="confirm_password"
					type="password"
					required
					minlength="8"
					autocomplete="new-password"
					class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
					placeholder="********"
				/>
				{#if errors.confirm_password}
					<span class="mt-1 block text-xs text-rose-600">{errors.confirm_password[0]}</span>
				{/if}
			</label>

			<label class="text-sm font-semibold text-slate-800">
				<span>Location (optional)</span>
				<input
					name="location"
					class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
					value={form?.values?.location ?? ''}
					placeholder="Boerne, TX"
				/>
			</label>

			<label class="text-sm font-semibold text-slate-800">
				<span>Website (optional)</span>
				<input
					name="website_url"
					type="url"
					class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
					value={form?.values?.website_url ?? ''}
					placeholder="https://yourrescue.org"
				/>
				{#if errors.website_url}
					<span class="mt-1 block text-xs text-rose-600">{errors.website_url[0]}</span>
				{/if}
			</label>

			<label class="text-sm font-semibold text-slate-800">
				<span>Instagram (optional)</span>
				<input
					name="instagram_url"
					type="url"
					class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
					value={form?.values?.instagram_url ?? ''}
					placeholder="https://instagram.com/yourrescue"
				/>
				{#if errors.instagram_url}
					<span class="mt-1 block text-xs text-rose-600">{errors.instagram_url[0]}</span>
				{/if}
			</label>

			<label class="text-sm font-semibold text-slate-800">
				<span>Facebook (optional)</span>
				<input
					name="facebook_url"
					type="url"
					class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
					value={form?.values?.facebook_url ?? ''}
					placeholder="https://facebook.com/yourrescue"
				/>
				{#if errors.facebook_url}
					<span class="mt-1 block text-xs text-rose-600">{errors.facebook_url[0]}</span>
				{/if}
			</label>

			<div class="md:col-span-2 flex flex-col gap-3 pt-2">
				<button
					type="submit"
					class="w-full rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200"
				>
					Create account
				</button>
				<button
					type="button"
					disabled
					class="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500"
				>
					Google (coming soon)
				</button>
				<div class="flex items-center justify-between text-sm text-slate-600">
					<a class="font-semibold text-emerald-700 hover:text-emerald-800" href="/admin/login">Back to login</a>
					<a class="text-slate-500 hover:text-slate-700" href="/auth/reset">Forgot password?</a>
				</div>
			</div>
		</form>
	</div>
</div>
