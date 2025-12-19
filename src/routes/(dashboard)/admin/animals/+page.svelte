<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const statusOptions = [
		{ label: 'Available', value: 'available' },
		{ label: 'On Hold', value: 'hold' },
		{ label: 'Adopted', value: 'adopted' }
	];
</script>

<div class="grid gap-8 lg:grid-cols-2">
	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold text-slate-900">Add a new animal</h2>
		<p class="text-sm text-slate-500">You can add photos after saving.</p>

		{#if form?.serverError}
			<p class="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
				{form.serverError}
			</p>
		{/if}

		<form method="POST" action="?/create" class="mt-6 space-y-4">
			<label class="block text-sm font-medium text-slate-700">
				Name
				<input
					name="name"
					required
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				/>
				{#if form?.errors?.name}
					<span class="mt-1 block text-xs text-rose-600">{form.errors.name[0]}</span>
				{/if}
			</label>
			<label class="block text-sm font-medium text-slate-700">
				Species
				<input
					name="species"
					required
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				/>
				{#if form?.errors?.species}
					<span class="mt-1 block text-xs text-rose-600">{form.errors.species[0]}</span>
				{/if}
			</label>
			<div class="grid gap-4 md:grid-cols-2">
				<label class="block text-sm font-medium text-slate-700">
					Breed
					<input
						name="breed"
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
				<label class="block text-sm font-medium text-slate-700">
					Age
					<input
						name="age"
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<label class="block text-sm font-medium text-slate-700">
					Sex
					<input
						name="sex"
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
				<label class="block text-sm font-medium text-slate-700">
					Status
					<select
						name="status"
						class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					>
						{#each statusOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</label>
			</div>
			<label class="block text-sm font-medium text-slate-700">
				Tags (comma separated)
				<input
					name="tags"
					placeholder="foster ready,house trained"
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				/>
			</label>
			<label class="block text-sm font-medium text-slate-700">
				Description
				<textarea
					name="description"
					rows="4"
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				></textarea>
			</label>
			<button
				type="submit"
				class="w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
			>
				Create animal
			</button>
		</form>
	</section>

	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold text-slate-900">Current animals</h2>
		<p class="text-sm text-slate-500">Manage availability and jump into details.</p>

		{#if data.animals.length === 0}
			<p class="mt-6 text-sm text-slate-500">No animals yet.</p>
		{:else}
			<div class="mt-6 space-y-4">
				{#each data.animals as animal}
					<div class="rounded-xl border border-slate-200 p-4">
						<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p class="text-lg font-semibold text-slate-900">{animal.name}</p>
								<p class="text-xs uppercase tracking-wide text-slate-500">
									{animal.species} · {animal.status}
								</p>
							</div>
							<div class="flex flex-wrap gap-2">
								<a
									class="rounded-md border border-emerald-600 px-3 py-1 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
									href={`/admin/animals/${animal.id}`}
									>Manage</a
								>
								<form method="POST" action="?/toggle" class="inline">
									<input type="hidden" name="animalId" value={animal.id} />
									<input type="hidden" name="isActive" value={animal.is_active ? 'false' : 'true'} />
									<button
										type="submit"
										class={`rounded-md px-3 py-1 text-sm font-semibold ${
											animal.is_active
												? 'border border-slate-300 text-slate-600 hover:bg-slate-50'
												: 'border border-amber-500 text-amber-700 hover:bg-amber-50'
										}`}
									>
										{animal.is_active ? 'Archive' : 'Activate'}
									</button>
								</form>
							</div>
						</div>
						{#if animal.tags?.length}
							<div class="mt-3 flex flex-wrap gap-2">
								{#each animal.tags as tag}
									<span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tag}</span>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
