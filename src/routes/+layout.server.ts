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

	const { data: membership, error: membershipError } = await locals.supabase
		.from('rescue_members')
		.select('role, rescue_id')
		.eq('user_id', user.id)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	if (membershipError) {
		console.error('Failed to load current rescue membership', membershipError);
		locals.currentRescue = null;
		locals.currentMemberRole = null;
		return { session: null, currentRescue: null, currentMemberRole: null };
	}

	if (!membership) {
		locals.currentRescue = null;
		locals.currentMemberRole = null;
		return { session: null, currentRescue: null, currentMemberRole: null };
	}

	const { data: rescue, error: rescueError } = await locals.supabase
		.from('rescues')
		.select('*')
		.eq('id', membership.rescue_id)
		.maybeSingle();

	if (rescueError) {
		console.error('Failed to fetch rescue record', rescueError);
		locals.currentRescue = null;
		locals.currentMemberRole = null;
		return { session: null, currentRescue: null, currentMemberRole: null };
	}

	const role = membership.role ?? null;

	locals.currentRescue = rescue;
	locals.currentMemberRole = role;

	return {
		session,
		currentRescue: rescue,
		currentMemberRole: role
	};
};
