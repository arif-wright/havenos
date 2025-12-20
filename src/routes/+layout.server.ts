import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const user = await locals.getUser();

	if (!user) {
		locals.currentRescue = null;
		locals.currentMemberRole = null;
		return { user: null, currentRescue: null, currentMemberRole: null };
	}

	return {
		user,
		currentRescue: locals.currentRescue ?? null,
		currentMemberRole: locals.currentMemberRole ?? null
	};
};
