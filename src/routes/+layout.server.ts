import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.getSession();

	if (!session) {
		locals.currentRescue = null;
		return { session: null, currentRescue: null };
	}

	const { data, error } = await locals.supabase
		.from('rescue_admins')
		.select('rescue_id, rescues(*)')
		.eq('user_id', session.user.id)
		.maybeSingle();

	if (error) {
		console.error('Failed to load current rescue', error);
		locals.currentRescue = null;
		return { session, currentRescue: null };
	}

	const rescue = data?.rescues ?? null;
	locals.currentRescue = rescue;

	return {
		session,
		currentRescue: rescue
	};
};
