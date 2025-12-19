import type { LayoutServerLoad } from './$types';
import { getServiceSupabase } from '$lib/server/supabaseService';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = await locals.getUser();

	if (!user) {
		locals.currentRescue = null;
		locals.currentMemberRole = null;
		return { user: null, currentRescue: null, currentMemberRole: null };
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
		return { user: null, currentRescue: null, currentMemberRole: null };
	}

	let resolvedMembership = membership;

	if (!resolvedMembership) {
		// Fallback to service role in case RLS prevented the client query (should not happen, but helps avoid onboarding loop)
		const service = getServiceSupabase();
		const { data: serviceMembership, error: serviceMembershipError } = await service
			.from('rescue_members')
			.select('role, rescue_id')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle();

		if (serviceMembershipError) {
			console.error('Service fetch rescue membership failed', serviceMembershipError);
		} else {
			resolvedMembership = serviceMembership;
		}
	}

	if (!resolvedMembership) {
		locals.currentRescue = null;
		locals.currentMemberRole = null;
		return { user, currentRescue: null, currentMemberRole: null };
	}

	let rescue = null;
	const { data: rescueData, error: rescueError } = await locals.supabase
		.from('rescues')
		.select('*')
		.eq('id', resolvedMembership.rescue_id)
		.maybeSingle();

	if (rescueError) {
		console.error('Failed to fetch rescue record', rescueError);
	} else {
		rescue = rescueData;
	}

	if (!rescue) {
		// Fallback with service role in case RLS blocked the client fetch
		const service = getServiceSupabase();
		const { data: serviceRescue, error: serviceRescueError } = await service
			.from('rescues')
			.select('*')
			.eq('id', resolvedMembership.rescue_id)
			.maybeSingle();

		if (serviceRescueError) {
			console.error('Service fetch rescue record failed', serviceRescueError);
		} else {
			rescue = serviceRescue;
		}
	}

	if (!rescue) {
		locals.currentRescue = null;
		locals.currentMemberRole = null;
		return { user, currentRescue: null, currentMemberRole: null };
	}

	const role = resolvedMembership.role ?? null;

	locals.currentRescue = rescue;
	locals.currentMemberRole = role;

	return {
		user,
		currentRescue: rescue,
		currentMemberRole: role
	};
};
