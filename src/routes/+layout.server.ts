import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.getSession();

	if (!session) {
		locals.currentRescue = null;
		locals.currentMemberRole = null;
		return { session: null, currentRescue: null, currentMemberRole: null };
	}

	const {
		data: { user },
		error: userError
	} = await locals.supabase.auth.getUser();

	if (userError) {
		console.error('Failed to resolve user session', userError);
		locals.currentRescue = null;
		locals.currentMemberRole = null;
		return { session: null, currentRescue: null, currentMemberRole: null };
	}

	if (!user) {
		locals.currentRescue = null;
		locals.currentMemberRole = null;
		return { session: null, currentRescue: null, currentMemberRole: null };
	}

	const { data, error } = await locals.supabase
		.from('rescue_members')
		.select('role, rescues(*)')
		.eq('user_id', user.id)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	if (error) {
		console.error('Failed to load current rescue', error);
		locals.currentRescue = null;
		locals.currentMemberRole = null;
		return { session, currentRescue: null, currentMemberRole: null };
	}

	const rescue = data?.rescues ?? null;
	const role = data?.role ?? null;

	locals.currentRescue = rescue;
	locals.currentMemberRole = role;

	return {
		session,
		currentRescue: rescue,
		currentMemberRole: role
	};
};
