import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { acceptInvitation } from '$lib/server/team';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ params, locals }) => {
		const user = await locals.getUser();
		if (!user) {
			throw redirect(303, `/admin/login?redirectTo=/admin/invite/${params.token}`);
		}

		const { error, invite } = await acceptInvitation(params.token, user.id);
		if (error || !invite) {
			return fail(400, { serverError: 'Invitation invalid or expired.' });
		}

		return { success: true };
	}
};
