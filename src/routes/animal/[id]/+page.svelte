<script lang="ts">
import type { ActionData, PageData } from './$types';

export let data: PageData;
export let form: ActionData;

	$: values = {
		adopterName: form?.values?.adopterName ?? '',
		adopterEmail: form?.values?.adopterEmail ?? '',
		message: form?.values?.message ?? ''
	};

	const primaryPhoto = data.animal.animal_photos?.[0]?.image_url;
</script>

<section class="border-b border-slate-200 bg-white">
	<div class="mx-auto max-w-6xl px-4 py-10">
		<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div>
				<p class="text-sm uppercase tracking-wider text-emerald-600">Meet</p>
				<h1 class="text-4xl font-semibold text-slate-900">{data.animal.name}</h1>
				<p class="mt-2 text-slate-600">
					{data.animal.rescues?.name} • Contact:
					<a
						class="text-emerald-600 underline-offset-4 hover:underline"
						href={`mailto:${data.animal.rescues?.contact_email}`}>{data.animal.rescues?.contact_email}</a
					>
				</p>
			</div>
			<div class="flex gap-3">
				<span class="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
					{data.animal.species}
				</span>
				<span
					class={`rounded-full px-3 py-1 text-sm font-semibold ${
						data.animal.status === 'available'
							? 'bg-emerald-100 text-emerald-700'
							: data.animal.status === 'hold'
								? 'bg-amber-100 text-amber-700'
								: 'bg-slate-200 text-slate-700'
					}`}
				>
					{data.animal.status}
				</span>
			</div>
		</div>
	</div>
</section>

<div class="mx-auto max-w-6xl gap-8 px-4 py-10 lg:grid lg:grid-cols-3">
	<div class="lg:col-span-2 space-y-6">
		<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
			{#if primaryPhoto}
				<img
					src={primaryPhoto}
					alt={`Primary photo of ${data.animal.name}`}
					class="w-full object-cover"
					style="aspect-ratio: 4 / 3;"
				/>
			{:else}
				<div class="flex aspect-[4/3] items-center justify-center bg-slate-50 text-slate-400">
					No photo uploaded yet
				</div>
			{/if}
			{#if data.animal.animal_photos?.length > 1}
				<div class="grid grid-cols-3 gap-3 px-4 py-4">
					{#each data.animal.animal_photos.slice(1) as photo}
						<img
							src={photo.image_url}
							alt={`Additional photo of ${data.animal.name}`}
							class="h-28 w-full rounded-xl object-cover"
							loading="lazy"
						/>
					{/each}
				</div>
			{/if}
		</div>
		<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
			<h2 class="text-xl font-semibold text-slate-900">About {data.animal.name}</h2>
			<p class="mt-4 whitespace-pre-line text-slate-700">
				{data.animal.description ?? 'Description coming soon.'}
			</p>
			<dl class="mt-6 grid gap-4 sm:grid-cols-2">
				<div>
					<dt class="text-xs uppercase tracking-wide text-slate-500">Breed</dt>
					<dd class="text-base font-medium text-slate-800">{data.animal.breed ?? 'Unknown'}</dd>
				</div>
				<div>
					<dt class="text-xs uppercase tracking-wide text-slate-500">Age</dt>
					<dd class="text-base font-medium text-slate-800">{data.animal.age ?? 'Ask rescue'}</dd>
				</div>
				<div>
					<dt class="text-xs uppercase tracking-wide text-slate-500">Sex</dt>
					<dd class="text-base font-medium text-slate-800">{data.animal.sex ?? 'Ask rescue'}</dd>
				</div>
				<div>
					<dt class="text-xs uppercase tracking-wide text-slate-500">Tags</dt>
					<dd class="mt-1 flex flex-wrap gap-2">
						{#if data.animal.tags?.length}
							{#each data.animal.tags as tag}
								<span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tag}</span>
							{/each}
						{:else}
							<span class="text-sm text-slate-500">No tags yet</span>
						{/if}
					</dd>
				</div>
			</dl>
		</section>
	</div>

	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
		<h2 class="text-2xl font-semibold text-slate-900">Apply to adopt</h2>
		<p class="mt-2 text-sm text-slate-500">Send a note to the rescue team. They will reply via email.</p>

		{#if form?.success}
			<div class="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
				Thank you! Your inquiry has been delivered. We'll email you soon.
				{#if form?.emailErrors?.length}
					<p class="mt-2 text-xs text-emerald-800">
						{form.emailErrors.join(', ')}
					</p>
				{/if}
			</div>
		{/if}

		{#if form?.serverError}
			<div class="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
				{form.serverError}
			</div>
		{/if}

		<form method="POST" class="mt-6 space-y-5">
			<label class="block text-sm font-medium text-slate-700">
				<span>Your name</span>
				<input
					name="adopterName"
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					value={values.adopterName}
					required
				/>
				{#if form?.errors?.adopterName}
					<span class="mt-1 block text-xs text-rose-600">{form.errors.adopterName[0]}</span>
				{/if}
			</label>

			<label class="block text-sm font-medium text-slate-700">
				<span>Email</span>
				<input
					type="email"
					name="adopterEmail"
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					value={values.adopterEmail}
					required
				/>
				{#if form?.errors?.adopterEmail}
					<span class="mt-1 block text-xs text-rose-600">{form.errors.adopterEmail[0]}</span>
				{/if}
			</label>

			<label class="block text-sm font-medium text-slate-700">
				<span>Message</span>
				<textarea
					name="message"
					rows="5"
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					placeholder="Share why you're a great match, home info, other pets..."
				>{values.message}</textarea>
				{#if form?.errors?.message}
					<span class="mt-1 block text-xs text-rose-600">{form.errors.message[0]}</span>
				{/if}
			</label>

			<button
				type="submit"
				class="w-full rounded-md bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
			>
				Send inquiry
			</button>
			<p class="text-xs text-slate-500">
				By submitting you agree that {data.animal.rescues?.name} may contact you about this animal.
			</p>
		</form>
	</section>
</div>
