<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	let tab: 'reports' | 'verification' = 'reports';
</script>

<div class="space-y-6">
	<header class="flex items-center justify-between">
		<div>
			<p class="text-xs uppercase tracking-wide text-emerald-600">Admin</p>
			<h1 class="text-2xl font-semibold text-slate-900">Moderation</h1>
			<p class="text-sm text-slate-600">Reports, verification requests, and disable rescues.</p>
		</div>
	</header>

	{#if form?.serverError}
		<p class="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{form.serverError}</p>
	{:else if form?.success}
		<p class="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Updated.</p>
	{/if}

	<div class="flex gap-3 text-sm font-semibold text-slate-700">
		<button
			class={`rounded-full px-4 py-2 ${tab === 'reports' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}
			on:click={() => (tab = 'reports')}
		>
			Reports ({data.reports.length})
		</button>
		<button
			class={`rounded-full px-4 py-2 ${tab === 'verification' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}
			on:click={() => (tab = 'verification')}
		>
			Verification ({data.verifications.length})
		</button>
	</div>

	{#if tab === 'reports'}
		<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<h2 class="text-lg font-semibold text-slate-900">Abuse reports</h2>
			{#if data.reports.length === 0}
				<p class="mt-2 text-sm text-slate-500">No reports yet.</p>
			{:else}
				<div class="mt-4 divide-y divide-slate-100">
					{#each data.reports as report}
						<div class="grid gap-2 py-3 md:grid-cols-[1.1fr,auto] md:items-center">
							<div class="space-y-1">
								<p class="text-sm font-semibold text-slate-900">
									{report.type === 'rescue' ? 'Rescue' : report.type === 'animal' ? 'Animal' : 'Inquiry'}
									{#if report.rescues?.name} · {report.rescues.name}{/if}
									{#if report.animals?.name} · {report.animals.name}{/if}
								</p>
								<p class="text-xs text-slate-500">
									{report.reporter_name || 'Anon'} {report.reporter_email ? `(${report.reporter_email})` : ''}
									· {new Date(report.created_at).toLocaleString()}
								</p>
								<p class="text-sm text-slate-700 whitespace-pre-line">{report.message}</p>
							</div>
							<form method="POST" action="?/updateReport" class="flex items-center gap-2 justify-end">
								<input type="hidden" name="reportId" value={report.id} />
								<select
									name="status"
									class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
								>
									{#each ['open', 'triaged', 'closed'] as status}
										<option value={status} selected={report.status === status}>{status}</option>
									{/each}
								</select>
								<button
									type="submit"
									class="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
								>
									Save
								</button>
							</form>
							{#if report.rescue_id}
								<form method="POST" action="?/disableRescue" class="flex items-center gap-2 justify-end">
									<input type="hidden" name="rescueId" value={report.rescue_id} />
									<input type="hidden" name="disabled" value={report.rescues?.disabled ? '0' : '1'} />
									<button
										type="submit"
										class={`rounded-md px-3 py-1 text-xs font-semibold ${
											report.rescues?.disabled
												? 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
												: 'border border-rose-200 text-rose-700 hover:bg-rose-50'
										}`}
									>
										{report.rescues?.disabled ? 'Enable rescue' : 'Disable rescue'}
									</button>
								</form>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{:else}
		<section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<h2 class="text-lg font-semibold text-slate-900">Verification requests</h2>
			{#if data.verifications.length === 0}
				<p class="mt-2 text-sm text-slate-500">No verification requests.</p>
			{:else}
				<div class="mt-4 divide-y divide-slate-100">
					{#each data.verifications as request}
						<div class="grid gap-3 py-3 md:grid-cols-[1.1fr,auto] md:items-center">
							<div class="space-y-1">
								<p class="text-sm font-semibold text-slate-900">
									{request.rescues?.name ?? 'Rescue'} · {request.status}
								</p>
								<p class="text-xs text-slate-500">Submitted {new Date(request.created_at).toLocaleString()}</p>
								<div class="flex flex-wrap gap-2 text-xs text-slate-600">
									{#if request.website_url}<a class="text-emerald-700" href={request.website_url} target="_blank">Website</a>{/if}
									{#if request.facebook_url}<a class="text-emerald-700" href={request.facebook_url} target="_blank">Facebook</a>{/if}
									{#if request.instagram_url}<a class="text-emerald-700" href={request.instagram_url} target="_blank">Instagram</a>{/if}
									{#if request.ein}<span>EIN: {request.ein}</span>{/if}
									{#if request.legal_name}<span>Legal: {request.legal_name}</span>{/if}
								</div>
								{#if request.notes}
									<p class="text-sm text-slate-700 whitespace-pre-line">Notes: {request.notes}</p>
								{/if}
							</div>
							<div class="flex flex-wrap items-center gap-2 justify-end">
								<form method="POST" action="?/approveVerification" class="flex items-center gap-2">
									<input type="hidden" name="requestId" value={request.id} />
									<input type="hidden" name="rescueId" value={request.rescue_id} />
									<input type="hidden" name="hasEin" value={request.ein ? '1' : '0'} />
									<button
										type="submit"
										class="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
									>
										Approve
									</button>
								</form>
								<form method="POST" action="?/rejectVerification">
									<input type="hidden" name="requestId" value={request.id} />
									<button
										type="submit"
										class="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
									>
										Reject
									</button>
								</form>
								{#if request.rescue_id}
									<form method="POST" action="?/disableRescue">
										<input type="hidden" name="rescueId" value={request.rescue_id} />
										<input type="hidden" name="disabled" value="1" />
										<button
											type="submit"
											class="rounded-md border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
										>
											Disable rescue
										</button>
									</form>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</div>
