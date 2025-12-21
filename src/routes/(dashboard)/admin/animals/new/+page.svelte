<script lang="ts">
	import type { ActionData } from './$types';

	export let form: ActionData;

	const statusOptions = [
		{ label: 'Available', value: 'available' },
		{ label: 'On hold', value: 'hold' },
		{ label: 'Adopted', value: 'adopted' }
	];

	$: values = {
		name: form?.values?.name ?? '',
		species: form?.values?.species ?? '',
		breed: form?.values?.breed ?? '',
		age: form?.values?.age ?? '',
		sex: form?.values?.sex ?? '',
		description: form?.values?.description ?? '',
		status: form?.values?.status ?? 'available',
		tags: form?.values?.tags ?? ''
	};

	$: fieldErrors = (form?.errors ?? {}) as Record<string, string[]>;
</script>

<section class="space-y-2">
	<h1 class="text-2xl font-semibold text-slate-900">Add animal</h1>
	<p class="text-sm text-slate-600">Create a new listing for your rescue.</p>
</section>

<section class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
	{#if form?.serverError}
		<p class="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
			{form.serverError}
		</p>
	{/if}
	<form method="POST" class="grid gap-4 md:grid-cols-2">
		<label class="text-sm font-medium text-slate-700">
			Name
			<input
				name="name"
				value={values.name}
				required
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			/>
			{#if fieldErrors.name}
				<span class="mt-1 block text-xs text-rose-600">{fieldErrors.name[0]}</span>
			{/if}
		</label>
		<label class="text-sm font-medium text-slate-700">
			Species
			<input
				name="species"
				value={values.species}
				required
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			/>
			{#if fieldErrors.species}
				<span class="mt-1 block text-xs text-rose-600">{fieldErrors.species[0]}</span>
			{/if}
		</label>
		<label class="text-sm font-medium text-slate-700">
			Breed
			<input
				name="breed"
				value={values.breed}
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			/>
		</label>
		<label class="text-sm font-medium text-slate-700">
			Age
			<input
				name="age"
				value={values.age}
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			/>
		</label>
		<label class="text-sm font-medium text-slate-700">
			Sex
			<input
				name="sex"
				value={values.sex}
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			/>
		</label>
		<label class="text-sm font-medium text-slate-700">
			Status
			<select
				name="status"
				class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			>
				{#each statusOptions as option}
					<option value={option.value} selected={values.status === option.value}>{option.label}</option>
				{/each}
			</select>
		</label>
		<label class="text-sm font-medium text-slate-700 md:col-span-2">
			Tags (comma separated)
			<input
				name="tags"
				value={values.tags}
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			/>
		</label>
		<label class="text-sm font-medium text-slate-700 md:col-span-2">
			Description
			<textarea
				name="description"
				rows="4"
				class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
			>{values.description}</textarea>
		</label>
		<div class="md:col-span-2">
			<button
				type="submit"
				class="inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
			>
				Create animal
			</button>
		</div>
	</form>
</section>
