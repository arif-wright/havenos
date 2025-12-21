<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const errors = (form?.errors ?? {}) as Record<string, string[]>;
	const canManage = data.canManage;
</script>

<div class="space-y-8">
	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-semibold text-slate-900">Saved reply templates</h1>
				<p class="text-sm text-slate-600">Reuse language and respond faster.</p>
			</div>
		</div>
		{#if form?.serverError}
			<p class="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{form.serverError}</p>
		{/if}
		{#if canManage}
			<form method="POST" action="?/create" class="mt-6 grid gap-4 md:grid-cols-3">
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
				<label class="text-sm font-medium text-slate-700 md:col-span-3">
					Body
					<textarea
						name="body"
						rows="4"
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
						required
					></textarea>
					{#if errors.body}<span class="text-xs text-rose-600">{errors.body[0]}</span>{/if}
				</label>
				<div class="md:col-span-3">
					<button
						type="submit"
						class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
					>
						Save template
					</button>
				</div>
			</form>
		{:else}
			<p class="mt-3 text-sm text-slate-500">Templates are managed by owners or admins.</p>
		{/if}
	</section>

	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<h2 class="text-xl font-semibold text-slate-900">Existing templates</h2>
		{#if data.templates.length === 0}
			<p class="mt-3 text-sm text-slate-500">No templates yet.</p>
		{:else}
			<div class="mt-4 divide-y divide-slate-100">
				{#each data.templates as template}
					<div class="py-4">
						<div class="flex items-start justify-between gap-4">
							<div>
								<p class="text-sm font-semibold text-slate-900">{template.name}</p>
								<p class="text-xs text-slate-500">{template.subject}</p>
							</div>
							{#if canManage}
								<form method="POST" action="?/delete">
									<input type="hidden" name="templateId" value={template.id} />
									<button
										type="submit"
										class="text-xs font-semibold text-rose-600 hover:text-rose-700"
									>
										Delete
									</button>
								</form>
							{/if}
						</div>
						<p class="mt-2 whitespace-pre-line text-sm text-slate-700">{template.body}</p>
						{#if canManage}
							<form method="POST" action="?/update" class="mt-3 grid gap-2 md:grid-cols-3">
								<input type="hidden" name="templateId" value={template.id} />
								<input
									name="name"
									value={template.name}
									class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
								/>
								<input
									name="subject"
									value={template.subject}
									class="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
								/>
								<textarea
									name="body"
									rows="2"
									class="md:col-span-3 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
								>{template.body}</textarea>
								<div class="md:col-span-3">
									<button
										type="submit"
										class="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
									>
										Update
									</button>
								</div>
							</form>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
