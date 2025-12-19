import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const {
		data: { user },
		error: userError
	} = await locals.supabase.auth.getUser();

	const session = await locals.getSession();

	if (userError) {
		console.error('Failed to resolve user session', userError);
		locals.currentRescue = null;
		locals.currentMemberRole = null;
		return { session: null, currentRescue: null, currentMemberRole: null };
	}

	if (!user || !session) {
		locals.currentRescue = null;
		locals.currentMemberRole = null;
		return { session: null, currentRescue: null, currentMemberRole: null };
	}

	const { data, error } = await locals.supabase
		.from('rescue_members')
		.select('role, rescues(*)')
		.eq('user_id', user.id)
		.order('created_at', { ascending: false })
		.limit(1);

	if (error) {
		console.error('Failed to load current rescue', error);
		locals.currentRescue = null;
		locals.currentMemberRole = null;
		return { session, currentRescue: null, currentMemberRole: null };
	}

	const membership = data?.[0] ?? null;
	const rescue = membership?.rescues ?? null;
	const role = membership?.role ?? null;

	locals.currentRescue = rescue;
	locals.currentMemberRole = role;

	return {
		session,
		currentRescue: rescue,
		currentMemberRole: role
	};
};
