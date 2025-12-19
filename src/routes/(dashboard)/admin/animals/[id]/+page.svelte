<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	$: formValues = {
		name: form?.values?.name ?? data.animal.name,
		species: form?.values?.species ?? data.animal.species,
		breed: form?.values?.breed ?? data.animal.breed ?? '',
		age: form?.values?.age ?? data.animal.age ?? '',
		sex: form?.values?.sex ?? data.animal.sex ?? '',
		description: form?.values?.description ?? data.animal.description ?? '',
		status: form?.values?.status ?? data.animal.status,
		tags: form?.values?.tags ?? data.animal.tags?.join(', ') ?? '',
		is_active: form?.values?.is_active ?? data.animal.is_active
	};

	$: fieldErrors = (form?.errors ?? {}) as Record<string, string[]>;

	const statusOptions = [
		{ label: 'Available', value: 'available' },
		{ label: 'On hold', value: 'hold' },
		{ label: 'Adopted', value: 'adopted' }
	];

	const inquiryStatuses = [
		{ value: 'new', label: 'New' },
		{ value: 'responded', label: 'Responded' },
		{ value: 'closed', label: 'Closed' }
	];
</script>

<div class="space-y-10">
	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<div class="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-2xl font-semibold text-slate-900">{data.animal.name}</h1>
				<p class="text-sm text-slate-500">Update core details.</p>
			</div>
			<a class="text-sm font-semibold text-emerald-600" href={`/animal/${data.animal.id}`} target="_blank">View public page</a>
		</div>

		{#if form?.serverError}
			<p class="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
				{form.serverError}
			</p>
		{/if}

		<form method="POST" action="?/update" class="mt-6 grid gap-4 md:grid-cols-2">
			<label class="text-sm font-medium text-slate-700">
				Name
				<input
					name="name"
					value={formValues.name}
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
					value={formValues.species}
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
					value={formValues.breed}
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				/>
			</label>
			<label class="text-sm font-medium text-slate-700">
				Age
				<input
					name="age"
					value={formValues.age}
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				/>
			</label>
			<label class="text-sm font-medium text-slate-700">
				Sex
				<input
					name="sex"
					value={formValues.sex}
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
						<option value={option.value} selected={formValues.status === option.value}>{option.label}</option>
					{/each}
				</select>
			</label>
			<label class="text-sm font-medium text-slate-700 md:col-span-2">
				Tags (comma separated)
				<input
					name="tags"
					value={formValues.tags}
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				/>
			</label>
			<label class="text-sm font-medium text-slate-700 md:col-span-2">
				Description
				<textarea
					name="description"
					rows="4"
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				>{formValues.description}</textarea>
			</label>
			<label class="flex items-center gap-2 text-sm font-medium text-slate-700">
				<input type="checkbox" name="is_active" value="true" checked={formValues.is_active} class="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
				Active listing
			</label>
			<div class="md:col-span-2">
				<button
					type="submit"
					class="inline-flex rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
				>
					Save changes
				</button>
			</div>
		</form>
	</section>

	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-semibold text-slate-900">Photos</h2>
				<p class="text-sm text-slate-500">Upload and reorder gallery images.</p>
			</div>
		</div>
		<form method="POST" action="?/uploadPhoto" enctype="multipart/form-data" class="mt-4 flex items-center gap-3">
			<input type="file" name="photo" accept="image/*" class="text-sm" required />
			<button
				type="submit"
				class="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
			>
				Upload
			</button>
		</form>
		{#if form?.photoError}
			<p class="mt-2 text-sm text-rose-600">{form.photoError}</p>
		{/if}
		{#if data.animal.animal_photos?.length === 0}
			<p class="mt-4 text-sm text-slate-500">No photos yet.</p>
		{:else}
			<div class="mt-6 grid gap-4 md:grid-cols-3">
				{#each data.animal.animal_photos as photo, index}
					<div class="space-y-2 rounded-xl border border-slate-200 p-3">
						<img src={photo.image_url} alt={data.animal.name} class="h-40 w-full rounded-lg object-cover" />
						<div class="flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
							<form method="POST" action="?/reorderPhoto">
								<input type="hidden" name="photoId" value={photo.id} />
								<input type="hidden" name="direction" value="up" />
								<button
									type="submit"
									disabled={index === 0}
									class="rounded border border-slate-300 px-2 py-1 disabled:opacity-40"
								>
									↑
								</button>
							</form>
							<form method="POST" action="?/reorderPhoto">
								<input type="hidden" name="photoId" value={photo.id} />
								<input type="hidden" name="direction" value="down" />
								<button
									type="submit"
									disabled={index === data.animal.animal_photos.length - 1}
									class="rounded border border-slate-300 px-2 py-1 disabled:opacity-40"
								>
									↓
								</button>
							</form>
							<form method="POST" action="?/deletePhoto" class="ml-auto">
								<input type="hidden" name="photoId" value={photo.id} />
								<input type="hidden" name="imageUrl" value={photo.image_url} />
								<button
									type="submit"
									class="rounded border border-rose-200 px-2 py-1 text-rose-600 hover:bg-rose-50"
								>
									Delete
								</button>
							</form>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold text-slate-900">Inquiries</h2>
		<p class="text-sm text-slate-500">Respond faster by tracking status per inquiry.</p>
		{#if data.animal.inquiries?.length === 0}
			<p class="mt-4 text-sm text-slate-500">No inquiries for this animal yet.</p>
		{:else}
			<div class="mt-6 divide-y divide-slate-100">
				{#each data.animal.inquiries as inquiry}
					<div class="flex flex-col gap-3 py-4 md:flex-row md:justify-between md:gap-8">
						<div>
							<p class="text-sm font-semibold text-slate-900">
								{inquiry.adopter_name} · {inquiry.adopter_email}
							</p>
							<p class="text-xs text-slate-500">
								{new Date(inquiry.created_at).toLocaleString()}
							</p>
							<p class="mt-2 rounded-md bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-line">
								{inquiry.message || 'No message provided.'}
							</p>
						</div>
						<form method="POST" action="?/updateInquiry" class="w-full max-w-xs space-y-2">
							<input type="hidden" name="inquiryId" value={inquiry.id} />
							<label class="block text-xs font-semibold uppercase tracking-wide text-slate-500">
								Status
								<select
									name="status"
									class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
								>
									{#each inquiryStatuses as option}
										<option value={option.value} selected={option.value === inquiry.status}>
											{option.label}
										</option>
									{/each}
								</select>
							</label>
							<button
								type="submit"
								class="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
							>
								Update
							</button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
