<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const rescue = data.currentRescue;
	const responseOptions = [
		{ value: 'same_day', label: 'Same day' },
		{ value: '24_48', label: '24–48 hours' },
		{ value: '3_5', label: '3–5 days' },
		{ value: '1w_plus', label: '1+ week' }
	];

	let adoptionSteps: string[] = (rescue.adoption_steps as string[] | null) ?? [];

	const addStep = () => adoptionSteps = [...adoptionSteps, ''];
	const updateStep = (i: number, val: string) => adoptionSteps = adoptionSteps.map((s, idx) => idx === i ? val : s);
	const removeStep = (i: number) => adoptionSteps = adoptionSteps.filter((_, idx) => idx !== i);
</script>

<section class="space-y-2">
	<h1 class="text-2xl font-semibold text-slate-900">Rescue profile</h1>
	<p class="text-sm text-slate-600">Keep your public rescue page up to date with branding and adoption details.</p>
</section>

{#if form?.serverError}
	<p class="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{form.serverError}</p>
{/if}
{#if form?.success}
	<p class="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Saved.</p>
{/if}

<div class="mt-6 space-y-6">
	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-lg font-semibold text-slate-900">Visual identity</h2>
				<p class="text-sm text-slate-600">Logo and header image for your public page.</p>
			</div>
		</div>
		<div class="grid gap-4 md:grid-cols-2">
			<div class="space-y-3 rounded-xl border border-slate-100 p-4">
				<p class="text-sm font-semibold text-slate-800">Rescue logo</p>
				<div class="flex items-center gap-4">
					<div class="h-16 w-16 overflow-hidden rounded-full bg-slate-100">
						{#if rescue.logo_url}
							<img src={rescue.logo_url} alt="Rescue logo" class="h-full w-full object-cover" />
						{:else}
							<div class="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
								{rescue.name?.slice(0, 2).toUpperCase()}
							</div>
						{/if}
					</div>
					<form method="POST" action="?/uploadLogo" enctype="multipart/form-data" class="flex items-center gap-2">
						<input type="file" name="logo" accept="image/*" class="text-sm" />
						<button
							type="submit"
							class="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
						>
							Upload
						</button>
					</form>
					{#if rescue.logo_url}
						<form method="POST" action="?/removeLogo">
							<button
								type="submit"
								class="text-xs font-semibold text-rose-600 hover:text-rose-700"
							>
								Remove
							</button>
						</form>
					{/if}
				</div>
				<p class="text-xs text-slate-500">Square image works best. Stored securely in RescueOS.</p>
			</div>

			<div class="space-y-3 rounded-xl border border-slate-100 p-4">
				<p class="text-sm font-semibold text-slate-800">Header image</p>
				<div class="overflow-hidden rounded-lg border border-slate-100 bg-slate-100">
					{#if rescue.cover_url}
						<img src={rescue.cover_url} alt="Header" class="h-32 w-full object-cover" />
					{:else}
						<div class="flex h-32 items-center justify-center text-sm text-slate-500">No header image yet</div>
					{/if}
				</div>
				<div class="flex items-center gap-2">
					<form method="POST" action="?/uploadCover" enctype="multipart/form-data" class="flex items-center gap-2">
						<input type="file" name="cover" accept="image/*" class="text-sm" />
						<button
							type="submit"
							class="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
						>
							Upload
						</button>
					</form>
					{#if rescue.cover_url}
						<form method="POST" action="?/removeCover">
							<button
								type="submit"
								class="text-xs font-semibold text-rose-600 hover:text-rose-700"
							>
								Remove
							</button>
						</form>
					{/if}
				</div>
				<p class="text-xs text-slate-500">Wide image recommended. We’ll scale it to fit.</p>
			</div>
		</div>
	</section>

	<form method="POST" action="?/updateRescue" class="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<section class="space-y-4">
			<div>
				<h2 class="text-lg font-semibold text-slate-900">Public URL & basics</h2>
				<p class="text-sm text-slate-600">Slug, tagline, location.</p>
			</div>
			<div class="grid gap-4 md:grid-cols-3">
				<label class="block text-sm font-medium text-slate-700">
					Slug
					<input
						name="slug"
						value={rescue.slug}
						required
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
					<span class="text-xs text-slate-500">Public page: /rescue/{rescue.slug}</span>
				</label>
				<label class="block text-sm font-medium text-slate-700">
					Tagline
					<input
						name="tagline"
						value={rescue.tagline ?? ''}
						maxlength="80"
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
				<label class="block text-sm font-medium text-slate-700">
					Location
					<input
						name="location_text"
						value={rescue.location_text ?? ''}
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<label class="block text-sm font-medium text-slate-700">
					Rescue name
					<input
						name="name"
						value={rescue.name}
						required
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
				<label class="block text-sm font-medium text-slate-700">
					Contact email
					<input
						name="contact_email"
						type="email"
						value={rescue.contact_email}
						required
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<label class="block text-sm font-medium text-slate-700">
					Website URL
					<input
						name="website_url"
						value={rescue.website_url ?? ''}
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
				<label class="block text-sm font-medium text-slate-700">
					Donation URL
					<input
						name="donation_url"
						value={rescue.donation_url ?? ''}
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
			</div>
			<div class="grid gap-4 md:grid-cols-3">
				<label class="block text-sm font-medium text-slate-700">
					Facebook URL
					<input
						name="facebook_url"
						value={rescue.facebook_url ?? ''}
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
				<label class="block text-sm font-medium text-slate-700">
					Instagram URL
					<input
						name="instagram_url"
						value={rescue.instagram_url ?? ''}
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
				<div class="flex items-center gap-3 pt-6">
					<label class="flex items-center gap-2 text-sm font-medium text-slate-700">
						<input type="checkbox" name="is_public" checked={rescue.is_public} class="rounded border-slate-300" />
						Public page visible
					</label>
				</div>
			</div>
		</section>

		<section class="space-y-4">
			<div>
				<h2 class="text-lg font-semibold text-slate-900">Mission & adoption</h2>
				<p class="text-sm text-slate-600">Share your mission and how adoption works.</p>
			</div>
			<label class="block text-sm font-medium text-slate-700">
				Mission statement
				<textarea
					name="mission_statement"
					rows="3"
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				>{rescue.mission_statement ?? ''}</textarea>
			</label>
			<label class="block text-sm font-medium text-slate-700">
				Response time
				<select
					name="response_time_enum"
					class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				>
					<option value="">Select response time</option>
					{#each responseOptions as option}
						<option value={option.value} selected={rescue.response_time_enum === option.value}>{option.label}</option>
					{/each}
				</select>
			</label>
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<p class="text-sm font-medium text-slate-700">Adoption steps</p>
					<button
						type="button"
						class="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
						on:click={addStep}
					>
						Add step
					</button>
				</div>
				{#if adoptionSteps.length === 0}
					<p class="text-sm text-slate-500">No steps yet. Add the first step.</p>
				{/if}
				<div class="space-y-2">
					{#each adoptionSteps as step, idx}
						<div class="flex items-center gap-2">
							<input
								name="adoption_steps[]"
								value={step}
								class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
								on:input={(e) => updateStep(idx, (e.target as HTMLInputElement).value)}
							/>
							<button
								type="button"
								class="text-xs font-semibold text-rose-600 hover:text-rose-700"
								on:click={() => removeStep(idx)}
							>
								Remove
							</button>
						</div>
					{/each}
				</div>
			</div>
			<label class="block text-sm font-medium text-slate-700">
				Additional adoption details
				<textarea
					name="adoption_process"
					rows="4"
					class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
				>{rescue.adoption_process ?? ''}</textarea>
			</label>
		</section>

		<div class="flex items-center justify-between">
			<div class="space-x-3">
				<button
					type="submit"
					class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
				>
					Save changes
				</button>
				{#if rescue.slug}
					<a
						class="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
						href={`/rescue/${rescue.slug}`}
						target="_blank"
						rel="noreferrer"
					>
						View public page
					</a>
				{:else}
					<span class="text-xs text-slate-500">Set a slug to enable public page.</span>
				{/if}
			</div>
		</div>
	</form>
</div>
