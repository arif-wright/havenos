<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const statusOptions = data.statusOptions;
</script>

<div class="space-y-8">
	<header class="flex flex-col gap-2">
		<p class="text-xs uppercase tracking-wide text-emerald-600">Inquiry</p>
		<h1 class="text-2xl font-semibold text-slate-900">
			{data.inquiry.adopter_name} · {data.inquiry.adopter_email}
		</h1>
		<p class="text-sm text-slate-500">
			For {data.inquiry.animals?.name ?? 'Unknown animal'} ·
			{new Date(data.inquiry.created_at).toLocaleString()}
		</p>
	</header>

	{#if form?.serverError}
		<p class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
			{form.serverError}
		</p>
	{/if}

	<div class="grid gap-6 lg:grid-cols-3">
		<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold text-slate-900">Status</h2>
				<form method="POST" action="?/updateStatus" class="flex items-center gap-3">
					<label class="text-sm font-medium text-slate-700">
						<select
							name="status"
							class="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
						>
							{#each statusOptions as option}
								<option value={option.value} selected={option.value === data.inquiry.status}>
									{option.label}
								</option>
							{/each}
						</select>
					</label>
					<button
						class="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
						type="submit"
					>
						Update
					</button>
				</form>
			</div>
			<p class="mt-2 text-sm text-slate-600">{data.inquiry.message || 'No public message.'}</p>
			<div class="mt-6">
				<h3 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Status history</h3>
				{#if !data.inquiry.inquiry_status_history?.length}
					<p class="mt-2 text-sm text-slate-500">No changes yet.</p>
				{:else}
					<div class="mt-3 space-y-2">
						{#each data.inquiry.inquiry_status_history as item}
							<div class="rounded-md border border-slate-200 p-3 text-sm">
								<p class="font-semibold text-slate-900">
									{item.from_status || 'new'} → {item.to_status}
								</p>
								<p class="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</section>

		<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
			<h2 class="text-lg font-semibold text-slate-900">Internal notes</h2>
			<form method="POST" action="?/addNote" class="mt-3 space-y-3">
				<input type="hidden" name="inquiryId" value={data.inquiry.id} />
				<textarea
					name="body"
					rows="4"
					class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					placeholder="Add a note for your team"
				></textarea>
				{#if form?.errors?.body}
					<p class="text-xs text-rose-600">{form.errors.body[0]}</p>
				{/if}
				<button
					type="submit"
					class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
				>
					Save note
				</button>
			</form>
			<div class="mt-4 space-y-3">
				{#if !data.inquiry.inquiry_notes?.length}
					<p class="text-sm text-slate-500">No notes yet.</p>
				{:else}
					{#each data.inquiry.inquiry_notes as note}
						<div class="rounded-md border border-slate-200 p-3 text-sm">
							<p class="text-slate-900 whitespace-pre-line">{note.body}</p>
							<p class="text-xs text-slate-500">{new Date(note.created_at).toLocaleString()}</p>
						</div>
					{/each}
				{/if}
			</div>
		</section>
	</div>

	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<h2 class="text-lg font-semibold text-slate-900">Email activity</h2>
		{#if !data.inquiry.email_logs?.length}
			<p class="mt-2 text-sm text-slate-500">No emails logged yet.</p>
		{:else}
			<div class="mt-3 divide-y divide-slate-100">
				{#each data.inquiry.email_logs as log}
					<div class="py-3">
						<p class="text-sm font-semibold text-slate-900">
							{log.to_email} · {log.subject} · {log.status}
						</p>
						<p class="text-xs text-slate-500">{new Date(log.created_at).toLocaleString()}</p>
						{#if log.error_message}
							<p class="text-xs text-rose-600">Error: {log.error_message}</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
