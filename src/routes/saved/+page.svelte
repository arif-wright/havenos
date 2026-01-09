<script lang="ts">
	import AmbientPage from '$lib/components/AmbientPage.svelte';
	import { favorites, isFavorite, toggleFavorite } from '$lib/utils/favorites';
	import { onMount } from 'svelte';

	type AnimalPreview = {
		id: string;
		name: string;
		species: string;
		status: string;
		thumb?: string;
		rescue?: { name?: string | null; slug?: string | null; location_text?: string | null };
	};

	type RescuePreview = {
		id: string;
		name: string;
		slug: string | null;
		tagline?: string | null;
		location_text?: string | null;
		avatar?: string | null;
		verification_status?: string | null;
	};

	let preview: { animals: AnimalPreview[]; rescues: RescuePreview[] } = { animals: [], rescues: [] };
	let loading = false;
	let error = '';
	let activeTab: 'pets' | 'rescues' = 'pets';
	let shareUrl: string | null = null;
	let shareMessage = '';
	let shareError = '';
	let mounted = false;
	let lastKey = '';

	const fetchPreview = async () => {
		if (!mounted) return;
		loading = true;
		error = '';
		try {
			const response = await fetch('/api/favorites/preview', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ animals: $favorites.animals, rescues: $favorites.rescues })
			});
			const result = await response.json();
			if (!response.ok) {
				error = 'Unable to load saved items right now.';
			} else {
				preview = {
					animals: result.animals ?? [],
					rescues: result.rescues ?? []
				};
			}
		} catch (err) {
			console.error(err);
			error = 'Unable to load saved items.';
		} finally {
			loading = false;
		}
	};

	onMount(() => {
		mounted = true;
		lastKey = `${$favorites.animals.join(',')}|${$favorites.rescues.join(',')}`;
		fetchPreview();
	});

	$: currentKey = `${$favorites.animals.join(',')}|${$favorites.rescues.join(',')}`;
	$: if (mounted && currentKey !== lastKey) {
		lastKey = currentKey;
		fetchPreview();
	}

	const shareShortlist = async () => {
		shareMessage = '';
		shareError = '';
		shareUrl = null;
		if ($favorites.animals.length === 0 && $favorites.rescues.length === 0) {
			shareError = 'Add pets or rescues to save first.';
			return;
		}
		try {
			const response = await fetch('/api/shortlists', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ animals: $favorites.animals, rescues: $favorites.rescues })
			});
			const result = await response.json();
			if (!response.ok || result.error) {
				shareError = result.error ?? 'Unable to create shortlist.';
			} else {
				const origin = typeof window !== 'undefined' ? window.location.origin : '';
				shareUrl = result.shareUrl ?? (origin ? `${origin}/saved/${result.token}` : `/saved/${result.token}`);
				shareMessage = 'Shareable link ready.';
			}
		} catch (error) {
			console.error(error);
			shareError = 'Unable to create shortlist.';
		}
	};

	const copyShareLink = async () => {
		if (!shareUrl || typeof navigator === 'undefined' || !navigator.clipboard) return;
		try {
			await navigator.clipboard.writeText(shareUrl);
			shareMessage = 'Link copied.';
		} catch (error) {
			console.error(error);
			shareError = 'Copy failed—select and copy manually.';
		}
	};
</script>

<AmbientPage
	title="Saved favorites"
	kicker="Shortlist"
	subtitle="Keep pets and rescues in one calm list. No account needed—share a read-only link when you’re ready."
>
	<section class="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<div class="flex gap-2">
				<button
					class={`rounded-full px-4 py-2 text-sm font-semibold transition ${
						activeTab === 'pets'
							? 'bg-emerald-600 text-white shadow'
							: 'bg-slate-100 text-slate-800 hover:bg-slate-200'
					}`}
					on:click={() => (activeTab = 'pets')}
				>
					Pets ({$favorites.animals.length})
				</button>
				<button
					class={`rounded-full px-4 py-2 text-sm font-semibold transition ${
						activeTab === 'rescues'
							? 'bg-emerald-600 text-white shadow'
							: 'bg-slate-100 text-slate-800 hover:bg-slate-200'
					}`}
					on:click={() => (activeTab = 'rescues')}
				>
					Rescues ({$favorites.rescues.length})
				</button>
			</div>
			<div class="flex flex-col items-start gap-2 text-sm sm:flex-row sm:items-center">
				<button
					class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 disabled:opacity-50"
					on:click={shareShortlist}
					disabled={$favorites.animals.length === 0 && $favorites.rescues.length === 0}
				>
					Share shortlist
				</button>
				{#if shareUrl}
					<div class="flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200">
						<span class="truncate max-w-xs">{shareUrl}</span>
						<button class="font-semibold text-emerald-700" type="button" on:click={copyShareLink}>Copy</button>
					</div>
				{/if}
				{#if shareMessage}
					<p class="text-xs font-semibold text-emerald-700">{shareMessage}</p>
				{:else if shareError}
					<p class="text-xs font-semibold text-rose-700">{shareError}</p>
				{/if}
			</div>
		</div>
	</section>

	{#if error}
		<div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
			{error}
		</div>
	{:else if loading}
		<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each Array(6) as _}
				<div class="h-36 animate-pulse rounded-2xl bg-slate-100"></div>
			{/each}
		</div>
	{:else}
		{#if activeTab === 'pets'}
			{#if preview.animals.length === 0}
				<div class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-700 shadow">
					<p class="text-lg font-semibold text-slate-900">No pets saved yet</p>
					<p class="text-sm text-slate-600">Tap “❤ Save” on a pet to add it here.</p>
				</div>
			{:else}
				<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
					{#each preview.animals as animal}
						<div class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg ring-1 ring-slate-200">
							{#if animal.thumb}
								<img src={animal.thumb} alt={animal.name} class="aspect-[4/3] w-full object-cover" loading="lazy" />
							{:else}
								<div class="aspect-[4/3] w-full bg-slate-100"></div>
							{/if}
							<div class="space-y-2 px-4 py-3">
								<div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
									<span class="text-emerald-700">{animal.species}</span>
									<span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700 ring-1 ring-slate-200">
										{animal.status}
									</span>
								</div>
								<div class="flex items-start justify-between gap-2">
									<div>
										<p class="text-lg font-semibold text-slate-900">{animal.name}</p>
										{#if animal.rescue?.name}
											<p class="text-xs text-slate-600">
										{animal.rescue.name ?? 'Rescue'}
										{#if animal.rescue.location_text}
											• {animal.rescue.location_text}
										{/if}
									</p>
								{/if}
									</div>
									<button
										type="button"
										class={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
											isFavorite($favorites, 'animal', animal.id)
												? 'border-rose-200 bg-rose-50 text-rose-700'
												: 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
										}`}
										on:click={() => toggleFavorite('animal', animal.id)}
									>
										❤ {isFavorite($favorites, 'animal', animal.id) ? 'Saved' : 'Save'}
									</button>
								</div>
								<a
									class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-200"
									href={`/animal/${animal.id}`}
								>
									View details
									<span aria-hidden="true">→</span>
								</a>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		{:else}
			{#if preview.rescues.length === 0}
				<div class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-700 shadow">
					<p class="text-lg font-semibold text-slate-900">No rescues saved yet</p>
					<p class="text-sm text-slate-600">Tap “❤ Save” on a rescue to track it here.</p>
				</div>
			{:else}
				<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{#each preview.rescues as rescue}
						<div class="relative flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg ring-1 ring-slate-200">
							<div class="flex items-start gap-3">
								<div class="h-12 w-12 overflow-hidden rounded-full bg-emerald-50 ring-1 ring-emerald-100">
									{#if rescue.avatar}
										<img src={rescue.avatar} alt={rescue.name ?? 'Rescue'} class="h-full w-full object-cover" loading="lazy" />
									{:else}
										<div class="flex h-full items-center justify-center text-sm font-semibold text-emerald-700">
											{(rescue.name ?? 'R').slice(0, 2).toUpperCase()}
										</div>
									{/if}
								</div>
								<div class="flex-1">
									<p class="text-base font-semibold text-slate-900">{rescue.name ?? 'Rescue'}</p>
									{#if rescue.location_text}
										<p class="text-xs text-slate-600">{rescue.location_text}</p>
									{/if}
									{#if rescue.tagline}
										<p class="text-xs text-slate-600 line-clamp-2">{rescue.tagline}</p>
									{/if}
								</div>
								<button
									type="button"
									class={`rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
										isFavorite($favorites, 'rescue', rescue.id ?? '')
											? 'border-rose-200 bg-rose-50 text-rose-700'
											: 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
									}`}
									on:click={() => {
										if (!rescue.id) return;
										toggleFavorite('rescue', rescue.id);
									}}
								>
									❤ {isFavorite($favorites, 'rescue', rescue.id ?? '') ? 'Saved' : 'Save'}
								</button>
							</div>
							{#if rescue.slug}
								<a
									class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-200"
									href={`/rescue/${rescue.slug}`}
								>
									View profile
									<span aria-hidden="true">→</span>
								</a>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	{/if}
</AmbientPage>
