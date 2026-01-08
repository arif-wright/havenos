<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

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
	let activeTab: 'rescue' | 'profile' = get(page).url.searchParams.get('tab') === 'profile' ? 'profile' : 'rescue';

	const addStep = () => (adoptionSteps = [...adoptionSteps, '']);
	const updateStep = (i: number, val: string) => (adoptionSteps = adoptionSteps.map((s, idx) => (idx === i ? val : s)));
	const removeStep = (i: number) => (adoptionSteps = adoptionSteps.filter((_, idx) => idx !== i));

	const isAction = (name: string) => form?.action === name;
	const profile = data.profile;
</script>

<div class="flex items-center gap-3">
	<h1 class="text-2xl font-semibold text-slate-900">Settings</h1>
	<div class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
		{rescue.name}
	</div>
</div>
<p class="text-sm text-slate-600">Manage your rescue profile and your personal settings.</p>

<div class="mt-6 flex flex-wrap gap-3">
	<button
		class={`rounded-full px-4 py-2 text-sm font-semibold transition ${
			activeTab === 'rescue'
				? 'bg-emerald-500 text-white shadow'
				: 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-200'
		}`}
		type="button"
		on:click={() => (activeTab = 'rescue')}
	>
		Rescue profile
	</button>
	<button
		class={`rounded-full px-4 py-2 text-sm font-semibold transition ${
			activeTab === 'profile'
				? 'bg-emerald-500 text-white shadow'
				: 'border border-slate-200 bg-white text-slate-700 hover:border-emerald-200'
		}`}
		type="button"
		on:click={() => (activeTab = 'profile')}
	>
		Your profile
	</button>
</div>

{#if activeTab === 'rescue'}
	{#if form?.serverError && !isAction('saveProfile') && !isAction('changePassword')}
		<p class="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{form.serverError}</p>
	{/if}
	{#if form?.success && isAction('updateRescue')}
		<p class="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Saved.</p>
	{/if}

	<div class="mt-6 space-y-6">
		<section class="card-surface border p-6 space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-lg font-semibold text-slate-900">Visual identity</h2>
					<p class="text-sm text-slate-600">Profile and header images used on your public rescue page.</p>
				</div>
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
					<p class="text-sm font-semibold text-slate-800">Profile image</p>
					<div class="flex items-center justify-start">
						<div class="aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-100">
							{#if rescue.profile_image_url || rescue.logo_url}
								<img src={rescue.profile_image_url ?? rescue.logo_url} alt="Profile" class="block h-full w-full object-cover" />
							{:else}
								<div class="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
									{rescue.name?.slice(0, 2).toUpperCase()}
								</div>
							{/if}
						</div>
					</div>
					<div class="flex flex-wrap items-center gap-2">
						<form method="POST" action="?/uploadProfile" enctype="multipart/form-data" class="flex items-center gap-2">
							<input type="file" name="profile" accept="image/*" class="text-sm" />
							<button
								type="submit"
								class="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
							>
								Upload
							</button>
						</form>
						{#if rescue.profile_image_url ?? rescue.logo_url}
							<form method="POST" action="?/removeProfile" class="flex items-center">
								<button type="submit" class="text-xs font-semibold text-rose-600 hover:text-rose-700">Remove</button>
							</form>
						{/if}
					</div>
					<p class="text-xs text-slate-500">Square image works best. Used in directory + page avatar.</p>
					{#if form?.success && isAction('uploadProfile')}
						<p class="text-xs text-emerald-700">Profile image updated.</p>
					{/if}
				</div>

				<div class="space-y-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
					<p class="text-sm font-semibold text-slate-800">Header image</p>
					<div class="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
						{#if rescue.header_image_url ?? rescue.cover_url}
							<img src={rescue.header_image_url ?? rescue.cover_url} alt="Header" class="h-32 w-full object-cover" />
						{:else}
							<div class="flex h-32 items-center justify-center text-sm text-slate-500">No header image yet</div>
						{/if}
					</div>
					<div class="flex items-center gap-2">
						<form method="POST" action="?/uploadHeader" enctype="multipart/form-data" class="flex items-center gap-2">
							<input type="file" name="header" accept="image/*" class="text-sm" />
							<button
								type="submit"
								class="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
							>
								Upload
							</button>
						</form>
						{#if rescue.header_image_url ?? rescue.cover_url}
							<form method="POST" action="?/removeHeader">
								<button type="submit" class="text-xs font-semibold text-rose-600 hover:text-rose-700">Remove</button>
							</form>
						{/if}
					</div>
					<p class="text-xs text-slate-500">Wide image recommended. Used as the page banner.</p>
					{#if form?.success && isAction('uploadHeader')}
						<p class="text-xs text-emerald-700">Header image updated.</p>
					{/if}
				</div>
			</div>
		</section>

		<form method="POST" action="?/updateRescue" class="card-surface border p-6 space-y-6">
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
						<button type="button" class="text-xs font-semibold text-emerald-700 hover:text-emerald-800" on:click={addStep}>
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

		<section class="card-surface border p-6 space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h2 class="text-lg font-semibold text-slate-900">Verification</h2>
					<p class="text-sm text-slate-600">
						Verified badge: website/socials match your rescue. Verified 501(c)(3): EIN + legal name.
					</p>
				</div>
				<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
					Status: {rescue.verification_status}
				</span>
			</div>
			{#if data.verification}
				<p class="text-sm text-slate-600">
					Last submission: {new Date(data.verification.created_at).toLocaleString()} · {data.verification.status}
					{#if data.verification.reviewed_at} · reviewed {new Date(data.verification.reviewed_at).toLocaleString()}{/if}
				</p>
			{/if}
			{#if form?.success && isAction('submitVerification')}
				<p class="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
					Verification submitted.
				</p>
			{/if}
			<form method="POST" action="?/submitVerification" class="space-y-3">
				<div class="grid gap-3 md:grid-cols-3">
					<label class="text-sm font-medium text-slate-700">
						Website URL
						<input
							name="website_url"
							class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
							placeholder="https://yourrescue.org"
						/>
					</label>
					<label class="text-sm font-medium text-slate-700">
						Facebook URL
						<input
							name="facebook_url"
							class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
							placeholder="https://facebook.com/yourrescue"
						/>
					</label>
					<label class="text-sm font-medium text-slate-700">
						Instagram URL
						<input
							name="instagram_url"
							class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
							placeholder="https://instagram.com/yourrescue"
						/>
					</label>
				</div>
				<div class="grid gap-3 md:grid-cols-2">
					<label class="text-sm font-medium text-slate-700">
						EIN (optional, required for 501(c)(3))
						<input
							name="ein"
							class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
						/>
					</label>
					<label class="text-sm font-medium text-slate-700">
						Legal name (optional)
						<input
							name="legal_name"
							class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
						/>
					</label>
				</div>
				<label class="text-sm font-medium text-slate-700">
					Notes for reviewer
					<textarea
						name="notes"
						rows="3"
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					></textarea>
				</label>
				<button
					type="submit"
					class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
				>
					Submit verification
				</button>
			</form>
		</section>
	</div>
{:else}
	<div class="mt-6 space-y-6">
		<section class="card-surface border p-6 space-y-4">
			<div>
				<h2 class="text-lg font-semibold text-slate-900">Your profile</h2>
				<p class="text-sm text-slate-600">Update how your name appears to teammates.</p>
			</div>

			{#if form?.serverError && isAction('saveProfile')}
				<p class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{form.serverError}</p>
			{/if}
			{#if form?.success && isAction('saveProfile')}
				<p class="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Profile saved.</p>
			{/if}

			<form class="space-y-4" method="POST" action="?/saveProfile">
				<label class="block text-sm font-medium text-slate-700">
					Display name
					<input
						name="display_name"
						required
						value={profile?.display_name ?? ''}
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
					{#if form?.errors?.display_name && isAction('saveProfile')}
						<span class="text-xs text-rose-600">{form.errors.display_name[0]}</span>
					{/if}
				</label>
				<label class="block text-sm font-medium text-slate-700">
					Title (optional)
					<input
						name="title"
						value={profile?.title ?? ''}
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
				<label class="block text-sm font-medium text-slate-700">
					Phone (optional)
					<input
						name="phone"
						value={profile?.phone ?? ''}
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
		</section>

		<section class="card-surface border p-6 space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<h3 class="text-sm font-semibold text-slate-900">Avatar</h3>
					<p class="text-xs text-slate-600">Square image works best.</p>
				</div>
				{#if form?.success && (isAction('uploadAvatar') || isAction('removeAvatar'))}
					<p class="text-xs font-semibold text-emerald-700">Avatar updated.</p>
				{/if}
			</div>
			<div class="flex items-center gap-4">
				<div class="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-100 aspect-square">
					{#if profile?.avatar_url}
						<img src={profile.avatar_url} alt="Avatar" class="h-full w-full object-cover block" />
					{:else}
						<div class="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
							{(profile?.display_name ?? 'Member').slice(0, 2).toUpperCase()}
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
				{#if profile?.avatar_url}
					<form method="POST" action="?/removeAvatar">
						<button type="submit" class="text-xs font-semibold text-rose-600 hover:text-rose-700">Remove</button>
					</form>
				{/if}
			</div>
		</section>

		<section class="card-surface border p-6 space-y-4">
			<div>
				<h3 class="text-sm font-semibold text-slate-900">Change password</h3>
				<p class="text-xs text-slate-600">Email + password auth only.</p>
			</div>
			{#if form?.serverError && isAction('changePassword')}
				<p class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{form.serverError}</p>
			{/if}
			{#if form?.success && isAction('changePassword')}
				<p class="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
					Password updated. You can sign in with the new password next time.
				</p>
			{/if}
			<form method="POST" action="?/changePassword" class="grid gap-3 md:grid-cols-2">
				<label class="text-sm font-medium text-slate-700">
					Current password
					<input
						name="current_password"
						type="password"
						required
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
				<div class="grid gap-3 md:grid-cols-2 md:col-span-2">
					<label class="text-sm font-medium text-slate-700">
						New password
						<input
							name="new_password"
							type="password"
							required
							minlength="8"
							class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
						/>
					</label>
					<label class="text-sm font-medium text-slate-700">
						Confirm new password
						<input
							name="confirm_password"
							type="password"
							required
							minlength="8"
							class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
						/>
					</label>
				</div>
				<div class="md:col-span-2">
					<button
						type="submit"
						class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
					>
						Update password
					</button>
				</div>
			</form>
		</section>
	</div>
{/if}
