import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { APP_BASE_URL } from '$env/static/private';

const schema = z.object({
	email: z.string().email('Valid email required')
});

export const load: PageServerLoad = async ({ locals }) => {
	const user = await locals.getUser();
	if (user) {
		throw redirect(303, '/admin');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const appBaseUrl = (APP_BASE_URL ?? 'http://localhost:5173').replace(/\/$/, '');
		const form = await request.formData();
		const payload = {
			email: String(form.get('email') ?? '').trim()
		};

		const parsed = schema.safeParse(payload);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
		}

		const { error } = await locals.supabase.auth.resetPasswordForEmail(parsed.data.email, {
			redirectTo: `${appBaseUrl}/auth/update-password`
		});

		if (error) {
			const message =
				error.status === 400 || error.status === 429
					? 'Unable to send reset email right now.'
					: 'Something went wrong.';
			return fail(400, { serverError: message });
		}

		return { success: true };
	}
};
