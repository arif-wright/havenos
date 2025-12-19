import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const session = locals.session;
	if (!session) {
		const redirectTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/admin/login?redirectTo=${redirectTo}`);
	}

	if (!locals.currentRescue) {
		throw redirect(303, '/onboarding');
	}

	return {
		session,
		currentRescue: locals.currentRescue,
		currentMemberRole: locals.currentMemberRole ?? 'staff'
	};
};
