import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// If Supabase sends the recovery link to the site root with query params, forward it to the reset page.
	if (url.searchParams.has('code')) {
		const query = url.searchParams.toString();
		throw redirect(303, `/auth/update-password?${query}`);
	}

	return {};
};
