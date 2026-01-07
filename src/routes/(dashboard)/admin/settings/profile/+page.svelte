<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const errors = (form?.errors ?? {}) as Record<string, string[]>;
</script>

<section class="space-y-2">
	<h1 class="text-2xl font-semibold text-slate-900">Your profile</h1>
	<p class="text-sm text-slate-600">Update how your name appears to teammates.</p>
</section>

<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	<h2 class="text-lg font-semibold text-slate-900">Profile settings</h2>
	<p class="text-sm text-slate-600">Only you can edit your profile. Your email stays private.</p>

	{#if form?.serverError}
		<p class="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
			{form.serverError}
		</p>
	{/if}
	{#if form?.success}
		<p class="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
			Profile saved.
		</p>
	{/if}

	<form class="mt-4 space-y-4" method="POST" action="?/save">
		<label class="block text-sm font-medium text-slate-700">
			Display name
			<input
				name="display_name"
				required
				value={data.profile?.display_name ?? ''}
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			/>
			{#if errors.display_name}
				<span class="text-xs text-rose-600">{errors.display_name[0]}</span>
			{/if}
		</label>
		<label class="block text-sm font-medium text-slate-700">
			Title (optional)
			<input
				name="title"
				value={data.profile?.title ?? ''}
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			/>
		</label>
		<label class="block text-sm font-medium text-slate-700">
			Phone (optional)
			<input
				name="phone"
				value={data.profile?.phone ?? ''}
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			/>
		</label>
		<label class="block text-sm font-medium text-slate-700">
			Email
			<input
				readonly
				value={data.userEmail ?? ''}
				class="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
			/>
		</label>

		<div class="flex items-center gap-3">
			<button
				type="submit"
				class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
			>
				Save changes
			</button>
		</div>
	</form>

	<div class="mt-6 space-y-3">
		<h3 class="text-sm font-semibold text-slate-900">Avatar</h3>
		<div class="flex items-center gap-4">
			<div class="h-14 w-14 overflow-hidden rounded-full bg-slate-100">
				{#if data.profile?.avatar_url}
					<img src={data.profile.avatar_url} alt="Avatar" class="h-full w-full object-cover" />
				{:else}
					<div class="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
						{(data.profile?.display_name ?? 'Member').slice(0, 2).toUpperCase()}
					</div>
				{/if}
			</div>
			<form method="POST" action="?/uploadAvatar" enctype="multipart/form-data" class="flex items-center gap-2">
				<input type="file" name="avatar" accept="image/*" class="text-sm" />
				<button
					type="submit"
					class="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
				>
					Upload
				</button>
			</form>
			{#if data.profile?.avatar_url}
				<form method="POST" action="?/removeAvatar">
					<button
						type="submit"
						class="text-xs font-semibold text-rose-600 hover:text-rose-700"
					>
						Remove
					</button>
				</form>
			{/if}
		</div>
		<p class="text-xs text-slate-500">Stored in public-assets bucket.</p>
	</div>
</section>
