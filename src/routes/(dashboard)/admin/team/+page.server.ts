import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { invitationSchema } from '$lib/validation';
import { createInvitation, listInvitations, listMembers } from '$lib/server/team';
import { sendTemplateEmail } from '$lib/email/resend';

export const load: PageServerLoad = async ({ locals }) => {
	const rescue = locals.currentRescue;
	if (!rescue) {
		throw redirect(303, '/onboarding');
	}

	const { data: members } = await listMembers(locals.supabase, rescue.id);
	const { data: invites } = await listInvitations(locals.supabase, rescue.id);

	return {
		members: members ?? [],
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
	}
};
