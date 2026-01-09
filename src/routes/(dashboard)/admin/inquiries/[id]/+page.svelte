<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const statusOptions = data.statusOptions;
	const templateErrors = (form?.errors ?? {}) as Record<string, string[]>;
	const responseTime = data.rescue?.response_time_text ?? '1-2 days';
	const animalName = data.inquiry.animals?.name ?? 'this pet';
	const adopterName = data.inquiry.adopter_name.split(' ')[0] || data.inquiry.adopter_name;
	const canReply = data.canReplyByEmail;
	const contactEmail = data.rescue?.contact_email || 'support@rescueos.net';
	const replyHint = canReply
		? 'Reply to this email and it will go to the rescue.'
		: `Contact us at ${contactEmail} if you have more to share.`;

	const suggestions = [
		{
			key: 'confirm',
			title: 'Confirm receipt',
			subject: `Thanks for your inquiry about ${animalName}`,
			body: `Hi ${adopterName},\n\nThanks for reaching out about ${animalName}. We got your note and will reply within ${responseTime}. ${replyHint}\n\n-${data.rescue?.name ?? 'Our rescue'} team`
		},
		{
			key: 'more_info',
			title: 'Request more info',
			subject: `A few quick questions about ${animalName}`,
			body: `Hi ${adopterName},\n\nWe want to make sure ${animalName} is a great fit. Could you share a bit more about your home (yard/apartment), other pets, and your weekly schedule? Feel free to add anything else that would help us get to know you.\n\nThank you!\n-${data.rescue?.name ?? 'Our rescue'}`
		},
		{
			key: 'next_steps',
			title: 'Next steps / meet & greet',
			subject: `Next steps for ${animalName}`,
			body: `Hi ${adopterName},\n\nWe'd love to keep things moving for ${animalName}. Next up: let us know your availability for a quick meet & greet, and we'll share the adoption form. We try to respond within ${responseTime} so we can keep momentum going.\n\nLooking forward to it,\n-${data.rescue?.name ?? 'Our rescue'}`
		}
	];

	let copied: string | null = null;
	let sentQuick = false;
	let sendError = '';

	const copySuggestion = async (text: string, key: string) => {
		if (navigator?.clipboard) {
			await navigator.clipboard.writeText(text);
			copied = key;
			setTimeout(() => (copied = null), 2000);
		}
	};
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
		{#if data.inquiry.archived_at}
			<p class="text-xs text-slate-500">
				Archived on {new Date(data.inquiry.archived_at).toLocaleString()}
			</p>
		{/if}
		{#if data.inquiry.first_responded_at}
			<p class="text-xs text-slate-500">
				First responded: {new Date(data.inquiry.first_responded_at).toLocaleString()}
			</p>
		{/if}
	</header>

	{#if form?.serverError}
		<p class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
			{form.serverError}
		</p>
	{/if}

	{#if data.inquiry.isStale}
		<p class="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
			This inquiry has not yet been responded to.
		</p>
	{/if}
	{#if data.inquiry.archived_at}
		<p class="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
			This inquiry is archived. You can restore it to return it to the active list.
		</p>
	{/if}
	{#if data.hasDuplicate}
		<p class="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
			Possible duplicate inquiry from this adopter for this animal within the last 7 days.
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
							disabled={!!data.inquiry.archived_at}
						>
							{#each statusOptions as option}
								<option value={option.value} selected={option.value === data.inquiry.status}>
									{option.label}
								</option>
							{/each}
						</select>
					</label>
					{#if !data.inquiry.archived_at}
						<button
							class="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
							type="submit"
						>
							Update
						</button>
					{/if}
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
		<div class="mb-4 flex flex-wrap items-center gap-3">
			{#if data.inquiry.archived_at}
				<form method="POST" action="?/restore">
					<button
						type="submit"
						class="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
					>
						Restore to active
					</button>
				</form>
			{:else}
				<form method="POST" action="?/archive">
					<button
						type="submit"
						class="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
						on:click={(e) => {
							if (!confirm('Archive this inquiry? You can restore anytime.')) e.preventDefault();
						}}
					>
						Archive
					</button>
				</form>
			{/if}
		</div>
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
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h2 class="text-lg font-semibold text-slate-900">Suggested replies</h2>
			<p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Template-driven, no AI</p>
		</div>
		<div class="mt-4 grid gap-4">
			{#each suggestions as suggestion}
				<div class="rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-sm">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<div>
							<p class="text-sm font-semibold text-slate-900">{suggestion.title}</p>
							<p class="text-xs text-slate-500">Subject: {suggestion.subject}</p>
						</div>
						{#if copied === suggestion.key}
							<span class="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">Copied</span>
						{/if}
					</div>
					<p class="mt-2 whitespace-pre-line text-sm text-slate-700">{suggestion.body}</p>
					<div class="mt-3 flex flex-wrap gap-2">
						<button
							type="button"
							class="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
							on:click={() => copySuggestion(suggestion.body, suggestion.key)}
						>
							Copy body
						</button>
						<form
							method="POST"
							action="?/sendQuickReply"
							class="flex items-center gap-2"
							on:submit={() => {
								sentQuick = true;
								sendError = '';
								setTimeout(() => (sentQuick = false), 3000);
							}}
						>
							<input type="hidden" name="to" value={data.inquiry.adopter_email} />
							<input type="hidden" name="subject" value={suggestion.subject} />
							<textarea name="body" class="hidden">{suggestion.body}</textarea>
							<button
								type="submit"
								class="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
							>
								Send now
							</button>
						</form>
					</div>
				</div>
			{/each}
			{#if sentQuick}
				<p class="mt-2 text-xs font-semibold text-emerald-700">Email sent.</p>
			{:else if sendError}
				<p class="mt-2 text-xs font-semibold text-rose-700">{sendError}</p>
			{/if}
		</div>
	</section>

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

	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<h2 class="text-lg font-semibold text-slate-900">Send a saved reply</h2>
		{#if data.templates.length === 0}
			<p class="mt-2 text-sm text-slate-500">No templates yet.</p>
		{:else}
			<form method="POST" action="?/sendTemplate" class="mt-3 grid gap-3 md:grid-cols-3">
				<input type="hidden" name="inquiryId" value={data.inquiry.id} />
				<input type="hidden" name="sendType" value="template" />
				<label class="text-sm font-medium text-slate-700">
					Recipient
					<input
						name="to"
						value={data.inquiry.adopter_email}
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
						required
					/>
				</label>
				<label class="text-sm font-medium text-slate-700">
					Template
					<select
						name="templateId"
						class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					>
						{#each data.templates as template}
							<option value={template.id}>{template.name}</option>
						{/each}
					</select>
				</label>
				<div class="flex items-end">
					<button
						type="submit"
						class="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
					>
						Send
					</button>
				</div>
				{#if form?.emailErrors}
					<p class="text-xs text-rose-600 md:col-span-3">{form.emailErrors[0]}</p>
				{/if}
			</form>

			{#if data.inquiry.isStale}
				<form method="POST" action="?/sendTemplate" class="mt-4 grid gap-3 md:grid-cols-3">
					<input type="hidden" name="inquiryId" value={data.inquiry.id} />
					<input type="hidden" name="sendType" value="follow_up" />
					<input type="hidden" name="to" value={data.inquiry.adopter_email} />
					<label class="text-sm font-medium text-slate-700">
						Follow-up template
						<select
							name="templateId"
							class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
						>
							{#each data.templates as template}
								<option value={template.id}>{template.name}</option>
							{/each}
						</select>
					</label>
					<div class="flex items-end">
						<button
							type="submit"
							class="w-full rounded-md border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
						>
							Send follow-up
						</button>
					</div>
				</form>
			{/if}
		{/if}

		{#if data.inquiry.isStale}
			<div class="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
				<p class="text-sm font-semibold text-amber-800">Follow-up</p>
				<p class="text-xs text-amber-700">
					Send a gentle follow-up to re-engage. Uses the same saved reply flow above.
				</p>
			</div>
		{/if}
	</section>
</div>
