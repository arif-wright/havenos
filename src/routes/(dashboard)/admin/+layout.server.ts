import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const user = await locals.getUser();

	if (!user) {
		console.info('Admin layout: no user, redirecting to login', {
			requested: url.pathname + url.search
		});
		const redirectTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/admin/login?redirectTo=${redirectTo}`);
	}

	if (!locals.currentRescue) {
		console.info('Admin layout: no currentRescue, redirecting to onboarding', {
			userId: user.id
		});
		throw redirect(303, '/onboarding');
	}

	return {
		user,
		currentRescue: locals.currentRescue,
		currentMemberRole: locals.currentMemberRole ?? 'staff'
	};
};
