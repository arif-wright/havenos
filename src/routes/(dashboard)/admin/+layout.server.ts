import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const {
		data: { user },
		error: userError
	} = await locals.supabase.auth.getUser();

	if (userError || !user) {
		const redirectTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/admin/login?redirectTo=${redirectTo}`);
	}

	if (!locals.currentRescue) {
		throw redirect(303, '/onboarding');
	}

	const session = await locals.getSession();

	return {
		session,
		currentRescue: locals.currentRescue,
		currentMemberRole: locals.currentMemberRole ?? 'staff'
	};
};
