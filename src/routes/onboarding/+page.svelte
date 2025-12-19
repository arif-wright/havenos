<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData | undefined;

	$: values = {
		name: form?.values?.name ?? '',
		slug: form?.values?.slug ?? data.defaults.slug,
		contact_email: form?.values?.contact_email ?? data.defaults.contact_email
	};
</script>

<div class="mx-auto max-w-2xl px-4 py-16">
	<h1 class="text-3xl font-semibold text-slate-900">Create your rescue</h1>
	<p class="mt-2 text-sm text-slate-600">
		Welcome to HavenOS. We just need a few details about your rescue to finish onboarding. This will create
		your dashboard and assign this account as the owner.
	</p>

	{#if form?.serverError}
		<p class="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
			{form.serverError}
		</p>
	{/if}

	<form method="POST" class="mt-8 space-y-6">
		<label class="block text-sm font-semibold text-slate-700">
			<span>Rescue name</span>
			<input
				name="name"
				value={values.name}
				required
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				placeholder="Haven Animal Rescue"
			/>
			{#if form?.errors?.name}
				<span class="mt-1 block text-xs text-rose-600">{form.errors.name[0]}</span>
			{/if}
		</label>

		<label class="block text-sm font-semibold text-slate-700">
			<span>Public slug</span>
			<input
				name="slug"
				value={values.slug}
				required
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm lowercase focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				placeholder="haven-animal-rescue"
			/>
			<p class="mt-1 text-xs text-slate-500">Used for your public URL: /rescue/{values.slug || 'your-slug'}</p>
			{#if form?.errors?.slug}
				<span class="mt-1 block text-xs text-rose-600">{form.errors.slug[0]}</span>
			{/if}
		</label>

		<label class="block text-sm font-semibold text-slate-700">
			<span>Contact email</span>
			<input
				type="email"
				name="contact_email"
				value={values.contact_email}
				required
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				placeholder="adoptions@example.org"
			/>
			{#if form?.errors?.contact_email}
				<span class="mt-1 block text-xs text-rose-600">{form.errors.contact_email[0]}</span>
			{/if}
		</label>

		<button
			type="submit"
			class="w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
		>
			Save and continue
		</button>
	</form>
</div>
