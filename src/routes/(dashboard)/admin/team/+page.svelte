<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	const roleLabel = (role: string) => role[0].toUpperCase() + role.slice(1);
	const initials = (name: string) =>
		name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.slice(0, 2)
			.toUpperCase();
</script>

<div class="space-y-8">
	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-semibold text-slate-900">Team</h1>
				<p class="text-sm text-slate-600">Invite teammates and manage roles.</p>
			</div>
			<a class="text-sm font-semibold text-emerald-700 hover:text-emerald-800" href="/admin/settings?tab=profile">
				Edit my profile
			</a>
		</div>
		{#if form?.serverError}
			<p class="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{form.serverError}</p>
		{/if}
		{#if form?.success}
			<p class="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Updated.</p>
		{/if}
		{#if data.canManage}
			<form method="POST" action="?/invite" class="mt-6 grid gap-4 md:grid-cols-[2fr,1fr,auto]">
				<label class="text-sm font-medium text-slate-700">
					Email
					<input
						name="email"
						type="email"
						required
						class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					/>
				</label>
				<label class="text-sm font-medium text-slate-700">
					Role
					<select
						name="role"
						class="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
					>
						<option value="staff">Staff</option>
						<option value="admin">Admin</option>
					</select>
				</label>
				<div class="flex items-end">
					<button
						type="submit"
						class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
					>
						Send invite
					</button>
				</div>
			</form>
		{:else}
			<p class="mt-3 text-sm text-slate-500">Only owners/admins can send invites.</p>
		{/if}
	</section>

	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<h2 class="text-lg font-semibold text-slate-900">Members</h2>
		<p class="text-sm text-slate-600">Change roles or remove teammates.</p>
		{#if data.members.length === 0}
			<p class="mt-2 text-sm text-slate-500">No members yet.</p>
		{:else}
			<div class="mt-4 divide-y divide-slate-100">
				{#each data.members as member}
					<div class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
								{initials(member.display_name ?? 'Member')}
							</div>
							<div>
								<p class="text-sm font-semibold text-slate-900">{member.display_name ?? 'Member'}</p>
								<p class="text-xs text-slate-500">{member.email ?? '—'}</p>
							</div>
						</div>
						<div class="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
							<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{roleLabel(member.role)}</span>
							{#if data.canManage && member.role !== 'owner'}
								<form method="POST" action="?/updateRole" class="flex items-center gap-2">
									<input type="hidden" name="userId" value={member.user_id} />
									<input type="hidden" name="currentRole" value={member.role} />
									<select
										name="role"
										class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
									>
										<option value="staff" selected={member.role === 'staff'}>Staff</option>
										<option value="admin" selected={member.role === 'admin'}>Admin</option>
									</select>
									<button
										type="submit"
										class="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
									>
										Update
									</button>
								</form>
								<form
									method="POST"
									action="?/remove"
									on:submit|preventDefault={(e) => {
										if (confirm(`Remove ${member.display_name ?? 'this member'} from this rescue?`)) {
											(e.currentTarget as HTMLFormElement).submit();
										}
									}}
								>
									<input type="hidden" name="userId" value={member.user_id} />
									<input type="hidden" name="currentRole" value={member.role} />
									<button
										type="submit"
										class="text-xs font-semibold text-rose-600 hover:text-rose-700"
									>
										Remove
									</button>
								</form>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<h2 class="text-lg font-semibold text-slate-900">Pending invitations</h2>
		<p class="text-sm text-slate-600">Manage outstanding invites.</p>
		{#if data.invitations.length === 0}
			<p class="mt-2 text-sm text-slate-500">No pending invites.</p>
		{:else}
			<div class="mt-3 divide-y divide-slate-100">
				{#each data.invitations as invite}
					<div class="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p class="text-sm font-semibold text-slate-900">{invite.email}</p>
							<p class="text-xs text-slate-500">Role: {roleLabel(invite.role)}</p>
							<p class="text-[11px] text-slate-400">Sent {new Date(invite.created_at ?? '').toLocaleDateString()}</p>
						</div>
						{#if data.canManage}
							<div class="flex items-center gap-2">
								<form method="POST" action="?/resendInvite">
									<input type="hidden" name="inviteId" value={invite.id} />
									<button
										type="submit"
										class="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
									>
										Resend
									</button>
								</form>
								<form
									method="POST"
									action="?/cancelInvite"
									on:submit|preventDefault={(e) => {
										if (confirm('Cancel this invite?')) {
											(e.currentTarget as HTMLFormElement).submit();
										}
									}}
								>
									<input type="hidden" name="inviteId" value={invite.id} />
									<button
										type="submit"
										class="text-xs font-semibold text-rose-600 hover:text-rose-700"
									>
										Cancel
									</button>
								</form>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>
