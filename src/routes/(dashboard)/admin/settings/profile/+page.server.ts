import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const rescue = locals.currentRescue;
	const user = await locals.getUser();
	if (!rescue || !user) {
		throw redirect(303, '/onboarding');
	}

	const { data: profile, error } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.maybeSingle();

	if (error) {
		console.error('profile load error', error);
	}

	return {
		profile: profile ?? null,
		userEmail: user.email
	};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user) {
			return fail(403, { serverError: 'Not authorized' });
		}

		const form = await request.formData();
		const display_name = String(form.get('display_name') ?? '').trim();
		const title = String(form.get('title') ?? '').trim() || null;
		const phone = String(form.get('phone') ?? '').trim() || null;

		if (!display_name) {
			return fail(400, { errors: { display_name: ['Display name is required'] } });
		}

		const { error } = await locals.supabase
			.from('profiles')
			.upsert({ id: user.id, display_name, title, phone, email: user.email ?? null });

		if (error) {
			console.error('profile save error', error);
			return fail(500, { serverError: 'Unable to save profile' });
		}

		return { success: true };
	}
};
