<script lang="ts">
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<div class="space-y-8">
	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<div class="flex items-center justify-between">
			<div>
				<h1 class="text-2xl font-semibold text-slate-900">Team</h1>
				<p class="text-sm text-slate-600">Invite teammates to collaborate.</p>
			</div>
		</div>
		{#if form?.serverError}
			<p class="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{form.serverError}</p>
		{/if}
		{#if data.canManage}
			<form method="POST" action="?/invite" class="mt-6 grid gap-4 md:grid-cols-3">
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
						<option value="owner">Owner</option>
					</select>
				</label>
				<div class="flex items-end">
					<button
						type="submit"
						class="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
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
		{#if data.members.length === 0}
			<p class="mt-2 text-sm text-slate-500">No members yet.</p>
		{:else}
			<ul class="mt-3 space-y-2 text-sm text-slate-700">
				{#each data.members as member}
					<li class="rounded-lg border border-slate-200 p-3">
						<p class="font-semibold text-slate-900">User {member.user_id.slice(0, 8)}…</p>
						<p class="text-xs text-slate-500">Role: {member.role}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
		<h2 class="text-lg font-semibold text-slate-900">Pending invitations</h2>
		{#if data.invitations.length === 0}
			<p class="mt-2 text-sm text-slate-500">No pending invites.</p>
		{:else}
			<ul class="mt-3 space-y-2 text-sm text-slate-700">
				{#each data.invitations as invite}
					<li class="rounded-lg border border-slate-200 p-3 flex justify-between">
						<div>
							<p class="font-semibold text-slate-900">{invite.email}</p>
							<p class="text-xs text-slate-500">Role: {invite.role}</p>
						</div>
						<p class="text-xs text-slate-500">Expires {new Date(invite.expires_at).toLocaleDateString()}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</div>
