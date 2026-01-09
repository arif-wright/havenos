<script lang="ts">
import type { ActionData, PageData } from './$types';
import { favorites, isFavorite, toggleFavorite } from '$lib/utils/favorites';
import { buildPetStory } from '$lib/utils/story';

export let data: PageData;
export let form: ActionData;

	$: values = {
		adopterName: form?.values?.adopterName ?? '',
		adopterEmail: form?.values?.adopterEmail ?? '',
		message: form?.values?.message ?? ''
	};

	const primaryPhoto = data.animal.animal_photos?.[0]?.image_url;
	$: saved = isFavorite($favorites, 'animal', data.animal.id);
	$: statusLink =
		form?.statusPath ??
		((form as Record<string, unknown>)?.publicToken
			? `/inquiry/${(form as Record<string, unknown>).publicToken as string}`
			: null);
	$: displayDescription =
		data.animal.description ||
		buildPetStory({
			name: data.animal.name,
			species: data.animal.species,
			breed: data.animal.breed,
			age: data.animal.age,
			energyLevel: data.animal.energy_level,
			personalityTraits: data.animal.personality_traits ?? [],
			goodWith: data.animal.good_with ?? [],
			training: data.animal.training,
			medicalNeeds: data.animal.medical_needs,
			idealHome: data.animal.ideal_home
		});
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
				<button
					type="button"
					class={`flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold transition ${
						saved
							? 'border-rose-200 bg-rose-50 text-rose-700'
							: 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
					}`}
					on:click={() => toggleFavorite('animal', data.animal.id)}
				>
					<span aria-hidden="true">❤</span>
					{saved ? 'Saved' : 'Save'}
				</button>
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
				{displayDescription ?? 'Description coming soon.'}
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
				<div>
					<dt class="text-xs uppercase tracking-wide text-slate-500">Energy</dt>
					<dd class="text-base font-medium text-slate-800">{data.animal.energy_level ?? 'Ask rescue'}</dd>
				</div>
				<div>
					<dt class="text-xs uppercase tracking-wide text-slate-500">Good with</dt>
					<dd class="mt-1 flex flex-wrap gap-2">
						{#if data.animal.good_with?.length}
							{#each data.animal.good_with as tag}
								<span class="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">{tag}</span>
							{/each}
						{:else}
							<span class="text-sm text-slate-500">Ask rescue</span>
						{/if}
					</dd>
				</div>
				{#if data.animal.training}
					<div class="sm:col-span-2">
						<dt class="text-xs uppercase tracking-wide text-slate-500">Training</dt>
						<dd class="text-base font-medium text-slate-800">{data.animal.training}</dd>
					</div>
				{/if}
				{#if data.animal.medical_needs}
					<div class="sm:col-span-2">
						<dt class="text-xs uppercase tracking-wide text-slate-500">Medical notes</dt>
						<dd class="text-base font-medium text-slate-800 whitespace-pre-line">{data.animal.medical_needs}</dd>
					</div>
				{/if}
				{#if data.animal.ideal_home}
					<div class="sm:col-span-2">
						<dt class="text-xs uppercase tracking-wide text-slate-500">Ideal home</dt>
						<dd class="text-base font-medium text-slate-800 whitespace-pre-line">{data.animal.ideal_home}</dd>
					</div>
				{/if}
			</dl>
		</section>
	</div>

	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
		<h2 class="text-2xl font-semibold text-slate-900">Apply to adopt</h2>
		<p class="mt-2 text-sm text-slate-500">Send a note to the rescue team. They will reply via email.</p>
		{#if data.animal.rescues?.response_time_text}
			<p class="mt-1 text-xs text-slate-500">Expected response: {data.animal.rescues.response_time_text}</p>
		{/if}

		{#if form?.success}
			<div class="mt-4 space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
				<div class="flex items-center gap-2 text-emerald-800">
					<span class="text-lg" aria-hidden="true">✔</span>
					<p class="font-semibold">Inquiry received</p>
				</div>
				<p>
					We delivered your note to {data.animal.rescues?.name}. Check your email for confirmation and follow the status link below anytime.
				</p>
				{#if statusLink}
					<a
						class="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-500"
						href={statusLink}
					>
						View status page
						<span aria-hidden="true">→</span>
					</a>
					<p class="text-[11px] text-emerald-900">Bookmark this link to follow updates.</p>
				{/if}
				<p class="text-xs text-emerald-900">
					{data.animal.rescues?.adoption_process ||
						'The rescue will review and reply with next steps. Feel free to share extra details if needed.'}
				</p>
				{#if form?.emailErrors?.length}
					<p class="rounded-lg bg-white/70 px-3 py-2 text-[11px] text-emerald-800 ring-1 ring-emerald-100">
						Email notes: {form.emailErrors.join(', ')}
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
		<div class="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
			<p class="font-semibold text-slate-900">What happens next</p>
			<p class="mt-1">
				{data.animal.rescues?.adoption_process ||
					'The rescue team will review your inquiry and reach out with next steps.'}
			</p>
		</div>
	</section>
</div>
