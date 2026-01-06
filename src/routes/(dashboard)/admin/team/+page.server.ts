import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { invitationSchema } from '$lib/validation';
import {
	cancelInvitation,
	createInvitation,
	listInvitations,
	listMembers,
	removeMember,
	resendInvitation,
	updateMemberRole
} from '$lib/server/team';
import { sendTemplateEmail } from '$lib/email/resend';
import { getServiceSupabase } from '$lib/server/supabaseService';

export const load: PageServerLoad = async ({ locals }) => {
	const rescue = locals.currentRescue;
	if (!rescue) {
		throw redirect(303, '/onboarding');
	}

	const { data: membersRaw, error: membersError } = await listMembers(locals.supabase, rescue.id);
	if (membersError) {
		console.error('team load members error', membersError);
	}
	let members =
		membersRaw?.map((m: any) => ({
			rescue_id: m.rescue_id,
			user_id: m.user_id,
			role: m.role,
			joined_at: m.joined_at ?? m.created_at,
			display_name: m.display_name ?? null,
			email: m.email ?? null
		})) ?? [];

	// If display names/emails missing (fallback path), enrich from profiles/auth.users via service role
	if (members.length > 0 && members.some((m) => !m.display_name || !m.email)) {
		const ids = members.map((m) => m.user_id);
		const service = getServiceSupabase();
		const { data: profileRows } = await service.from('profiles').select('id, display_name').in('id', ids);
		const { data: userRows } = await service.from('auth.users').select('id, email').in('id', ids);
		members = members.map((m) => {
			const prof = profileRows?.find((p) => p.id === m.user_id);
			const usr = userRows?.find((u) => u.id === m.user_id);
			return {
				...m,
				display_name: m.display_name ?? prof?.display_name ?? (usr?.email ? usr.email.split('@')[0] : 'Member'),
				email: m.email ?? usr?.email ?? null
			};
		});
	}

	const { data: invites, error: invitesError } = await listInvitations(locals.supabase, rescue.id);
	if (invitesError) {
		console.error('team load invites error', invitesError);
	}

	return {
		members,
		invitations: invites ?? [],
		currentMemberRole: locals.currentMemberRole ?? 'staff',
		canManage: ['owner', 'admin'].includes(locals.currentMemberRole ?? 'staff')
	};
};

export const actions: Actions = {
	invite: async ({ request, locals, url }) => {
		const rescue = locals.currentRescue;
		const user = await locals.getUser();
		if (!rescue || !user) {
			return fail(403, { serverError: 'Not authorized' });
		}

		const form = await request.formData();
		const payload = {
			email: String(form.get('email') ?? ''),
			role: String(form.get('role') ?? '') as 'owner' | 'admin' | 'staff'
		};

		const parsed = invitationSchema.safeParse(payload);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
		}

		const { data, error } = await createInvitation(
			locals.supabase,
			rescue.id,
			user.id,
			parsed.data.email,
			parsed.data.role
		);

		if (error || !data) {
			console.error(error);
			return fail(500, { serverError: 'Unable to create invitation' });
		}

		// send email (non-blocking best-effort)
		const acceptUrl = `${url.origin}/admin/invite/${data.token}`;
		await sendTemplateEmail({
			rescueId: rescue.id,
			inquiryId: null,
			to: parsed.data.email,
			subject: `You've been invited to join ${rescue.name}`,
			body: `You were invited to join ${rescue.name} as ${parsed.data.role}. Click to accept: ${acceptUrl}`,
			sendType: 'invite'
		});

		return { success: true };
	},
	updateRole: async ({ request, locals }) => {
		const rescue = locals.currentRescue;
		const actorRole = locals.currentMemberRole ?? 'staff';
		if (!rescue || !['owner', 'admin'].includes(actorRole)) {
			return fail(403, { serverError: 'Not authorized' });
		}
		const form = await request.formData();
		const userId = String(form.get('userId') ?? '');
		const role = String(form.get('role') ?? '') as 'owner' | 'admin' | 'staff';

		if (!userId || !role) return fail(400, { serverError: 'Invalid request' });
		if (role === 'owner') return fail(400, { serverError: 'Owner role cannot be assigned here' });

		// Admins can only manage staff; owners can manage admins/staff
		if (actorRole === 'admin') {
			const currentRole = String(form.get('currentRole') ?? '');
			if (currentRole !== 'staff') {
				return fail(403, { serverError: 'Admins can only manage staff roles' });
			}
		}

		const { error } = await updateMemberRole(locals.supabase, rescue.id, userId, role);
		if (error) {
			console.error(error);
			return fail(500, { serverError: 'Unable to update role' });
		}
		return { success: true };
	},
	remove: async ({ request, locals }) => {
		const rescue = locals.currentRescue;
		const actorRole = locals.currentMemberRole ?? 'staff';
		if (!rescue || !['owner', 'admin'].includes(actorRole)) {
			return fail(403, { serverError: 'Not authorized' });
		}
		const form = await request.formData();
		const userId = String(form.get('userId') ?? '');
		const currentRole = String(form.get('currentRole') ?? '');
		if (!userId) return fail(400, { serverError: 'Invalid request' });
		if (currentRole === 'owner') {
			return fail(400, { serverError: 'Cannot remove an owner via UI' });
		}
		if (actorRole === 'admin' && currentRole !== 'staff') {
			return fail(403, { serverError: 'Admins can only manage staff' });
		}

		const { error } = await removeMember(locals.supabase, rescue.id, userId);
		if (error) {
			console.error(error);
			return fail(500, { serverError: 'Unable to remove member' });
		}
		return { success: true };
	},
	resendInvite: async ({ request, locals, url }) => {
		const rescue = locals.currentRescue;
		const actorRole = locals.currentMemberRole ?? 'staff';
		if (!rescue || !['owner', 'admin'].includes(actorRole)) {
			return fail(403, { serverError: 'Not authorized' });
		}
		const form = await request.formData();
		const inviteId = String(form.get('inviteId') ?? '');
		if (!inviteId) return fail(400, { serverError: 'Invalid request' });

		const { data: invite, error } = await resendInvitation(locals.supabase, inviteId);
		if (error || !invite) {
			console.error(error);
			return fail(500, { serverError: 'Unable to resend invite' });
		}
		const acceptUrl = `${url.origin}/admin/invite/${invite.token}`;
		await sendTemplateEmail({
			rescueId: rescue.id,
			inquiryId: null,
			to: invite.email,
			subject: `Reminder: join ${rescue.name} on RescueOS`,
			body: `You were invited to join ${rescue.name} as ${invite.role}. Click to accept: ${acceptUrl}`,
			sendType: 'invite'
		});
		return { success: true };
	},
	cancelInvite: async ({ request, locals }) => {
		const rescue = locals.currentRescue;
		const actorRole = locals.currentMemberRole ?? 'staff';
		if (!rescue || !['owner', 'admin'].includes(actorRole)) {
			return fail(403, { serverError: 'Not authorized' });
		}
		const form = await request.formData();
		const inviteId = String(form.get('inviteId') ?? '');
		if (!inviteId) return fail(400, { serverError: 'Invalid request' });

		const { error } = await cancelInvitation(locals.supabase, inviteId);
		if (error) {
			console.error(error);
			return fail(500, { serverError: 'Unable to cancel invite' });
		}
		return { success: true };
	}
};
