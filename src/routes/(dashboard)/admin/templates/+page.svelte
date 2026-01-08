<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const errors = (form?.errors ?? {}) as Record<string, string[]>;
	const canManage = data.canManage;

	let search = '';
	let selectedId: string | null = null;
	let showCreate = false;
	let confirmDeleteId: string | null = null;
	let confirmDeleteName = '';
	let activeTab: 'edit' | 'preview' = 'edit';
	let dirty = false;

	// Editor fields
	let editName = '';
	let editSubject = '';
	let editBody = '';

	const templates = data.templates ?? [];

	// Ensure something is selected as soon as templates are available (SSR + CSR)
	$: {
		if (!selectedId && templates.length > 0) {
			selectTemplate(templates[0].id);
		}
		// If the current selection was removed (e.g., after delete), reset to first
		if (selectedId && !templates.find((t) => t.id === selectedId) && templates.length > 0) {
			selectTemplate(templates[0].id);
		}
		if (templates.length === 0) {
			selectedId = null;
		}
	}

	const filtered = () => {
		if (!search) return templates;
		const q = search.toLowerCase();
		return templates.filter(
			(t) =>
				t.name.toLowerCase().includes(q) ||
				t.subject.toLowerCase().includes(q) ||
				(t.body ?? '').toLowerCase().includes(q)
		);
	};

	const selectTemplate = (id: string) => {
		if (dirty && !confirm('Discard unsaved changes?')) return;
		const tmpl = templates.find((t) => t.id === id);
		if (!tmpl) return;
		selectedId = id;
		editName = tmpl.name;
		editSubject = tmpl.subject;
		editBody = tmpl.body ?? '';
		dirty = false;
		activeTab = 'edit';
	};

	const markDirty = () => {
		dirty = true;
	};
	const selectedTemplate = () => templates.find((t) => t.id === selectedId);
</script>

<div class="space-y-6">
	<header class="flex items-center justify-between gap-3">
		<div>
			<p class="text-xs uppercase tracking-wide text-emerald-600">RescueOS</p>
			<h1 class="text-2xl font-semibold text-slate-900">Reply templates</h1>
			<p class="text-sm text-slate-600">Save replies you use often, so you can respond faster.</p>
		</div>
		{#if canManage}
			<button
				type="button"
				class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
				on:click={() => (showCreate = !showCreate)}
			>
				{showCreate ? 'Close' : 'New template'}
			</button>
		{/if}
	</header>

	{#if form?.serverError}
		<p class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{form.serverError}</p>
	{/if}

	{#if canManage && showCreate}
		<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<h2 class="text-lg font-semibold text-slate-900">Create template</h2>
			<p class="text-sm text-slate-500">Add a reusable reply.</p>
			<form method="POST" action="?/create" class="mt-4 space-y-3">
				<div class="grid gap-3 md:grid-cols-2">
					<label class="text-sm font-medium text-slate-700">
						Name
						<input
							name="name"
							class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
							required
						/>
						{#if errors.name}<span class="text-xs text-rose-600">{errors.name[0]}</span>{/if}
					</label>
					<label class="text-sm font-medium text-slate-700">
						Subject
						<input
							name="subject"
							class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
							required
						/>
						{#if errors.subject}<span class="text-xs text-rose-600">{errors.subject[0]}</span>{/if}
					</label>
				</div>
				<label class="text-sm font-medium text-slate-700">
					Body
					<textarea
						name="body"
						rows="5"
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
						required
					></textarea>
					{#if errors.body}<span class="text-xs text-rose-600">{errors.body[0]}</span>{/if}
				</label>
				<div class="flex items-center gap-3">
					<button
						type="submit"
						class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
					>
						Save template
					</button>
					<button
						type="button"
						class="text-sm font-semibold text-slate-600"
						on:click={() => (showCreate = false)}
					>
						Cancel
					</button>
				</div>
			</form>
		</section>
	{/if}

	<div class="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
		<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<div class="flex items-center justify-between gap-3">
				<h2 class="text-lg font-semibold text-slate-900">Templates</h2>
			</div>
			<label class="mt-3 block">
				<input
					type="search"
					placeholder="Search templates"
					class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					bind:value={search}
				/>
			</label>
			{#if filtered().length === 0}
				<p class="mt-4 text-sm text-slate-500">No templates match your search.</p>
			{:else}
				<div class="mt-4 divide-y divide-slate-100">
					{#each filtered() as template}
						<button
							type="button"
							class={`w-full text-left py-3 px-2 rounded-lg transition ${
								selectedId === template.id ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-slate-50'
							}`}
							on:click={() => selectTemplate(template.id)}
						>
							<p class="text-sm font-semibold text-slate-900">{template.name}</p>
							<p class="text-xs text-slate-600 line-clamp-1">{template.subject}</p>
							{#if template.updated_at}
								<p class="text-[11px] text-slate-400">
									Updated {Math.round((Date.now() - new Date(template.updated_at).getTime()) / (1000 * 60 * 60 * 24))}d ago
								</p>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</section>

		<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm min-h-[320px]">
			{#if !selectedTemplate()}
				<div class="flex h-full flex-col items-start justify-center space-y-3">
					<p class="text-lg font-semibold text-slate-900">No templates yet</p>
					<p class="text-sm text-slate-600">Create a saved reply to respond faster and more consistently.</p>
					{#if canManage}
						<button
							type="button"
							class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
							on:click={() => (showCreate = true)}
						>
							New template
						</button>
					{/if}
				</div>
			{:else}
				<div class="flex items-center justify-between gap-3">
					<div>
						<p class="text-sm uppercase tracking-wide text-slate-500">Reusable reply</p>
						<h2 class="text-xl font-semibold text-slate-900">{selectedTemplate()?.name}</h2>
					</div>
					{#if canManage}
						<div class="flex items-center gap-2">
							<button
								type="button"
								class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
								on:click={() => {
									const formEl = document.getElementById('edit-form') as HTMLFormElement;
									formEl?.requestSubmit();
								}}
							>
								Save changes
							</button>
							<form method="POST" action="?/duplicate">
								<input type="hidden" name="templateId" value={selectedTemplate()?.id} />
								<button
									type="submit"
									class="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
								>
									Duplicate
								</button>
							</form>
							<button
								type="button"
								class="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
								on:click={() => {
									confirmDeleteId = selectedTemplate()?.id ?? null;
									confirmDeleteName = selectedTemplate()?.name ?? '';
								}}
							>
								Delete
							</button>
						</div>
					{/if}
				</div>

				<div class="mt-4 flex items-center gap-4 border-b border-slate-200 text-sm font-semibold text-slate-600">
					<button
						type="button"
						class={`relative px-2 pb-2 border-b-2 border-transparent transition ${
							activeTab === 'edit' ? 'border-emerald-600 text-emerald-700' : 'hover:text-slate-800'
						}`}
						on:click={() => (activeTab = 'edit')}
					>
						Edit
					</button>
					<button
						type="button"
						class={`relative px-2 pb-2 border-b-2 border-transparent transition ${
							activeTab === 'preview' ? 'border-emerald-600 text-emerald-700' : 'hover:text-slate-800'
						}`}
						on:click={() => (activeTab = 'preview')}
					>
						Preview
					</button>
				</div>

				{#if activeTab === 'edit'}
					<form id="edit-form" method="POST" action="?/update" class="mt-4 space-y-4">
						<input type="hidden" name="templateId" value={selectedTemplate()?.id} />
						<label class="text-sm font-medium text-slate-700">
							Name
							<input
								name="name"
								bind:value={editName}
								on:input={markDirty}
								class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
							/>
						</label>
						<label class="text-sm font-medium text-slate-700">
							Subject
							<input
								name="subject"
								bind:value={editSubject}
								on:input={markDirty}
								class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
							/>
						</label>
						<label class="text-sm font-medium text-slate-700">
							Body
							<textarea
								name="body"
								rows="8"
								bind:value={editBody}
								on:input={markDirty}
								class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
							></textarea>
						</label>
					</form>
				{:else}
					<div class="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 shadow-inner space-y-3">
						<div class="flex flex-wrap gap-3 text-xs text-slate-600">
							<p><span class="font-semibold text-slate-800">From:</span> noreply@rescueos.net</p>
							<p><span class="font-semibold text-slate-800">To:</span> adopter@example.com</p>
							<p class="w-full sm:w-auto">
								<span class="font-semibold text-slate-800">Subject:</span>
								{editSubject || selectedTemplate()?.subject || 'Subject line here'}
							</p>
						</div>
						<div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm space-y-3">
							<div class="whitespace-pre-line text-sm leading-relaxed text-slate-700">
								{editBody || selectedTemplate()?.body || 'Your email body will appear here.'}
							</div>
						</div>
					</div>
				{/if}
			{/if}
		</section>
	</div>

	{#if confirmDeleteId}
		<div class="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/50 px-4">
			<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
				<h3 class="text-lg font-semibold text-slate-900">Delete template?</h3>
				<p class="mt-2 text-sm text-slate-600">
					This will permanently delete “{confirmDeleteName}”. This can’t be undone.
				</p>
				<div class="mt-4 flex items-center justify-end gap-3">
					<button
						type="button"
						class="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
						on:click={() => {
							confirmDeleteId = null;
							confirmDeleteName = '';
						}}
					>
						Cancel
					</button>
					<form method="POST" action="?/delete">
						<input type="hidden" name="templateId" value={confirmDeleteId} />
						<button
							type="submit"
							class="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
						>
							Delete
						</button>
					</form>
				</div>
			</div>
		</div>
	{/if}
</div>
