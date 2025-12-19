import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

const loginSchema = z.object({
	email: z.string().email('Valid email required')
});

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.session) {
		throw redirect(303, '/admin');
	}
	return {
		redirectTo: url.searchParams.get('redirectTo') ?? '/admin'
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const appBaseUrl = (env.APP_BASE_URL ?? 'http://localhost:5173').replace(/\/$/, '');
		const form = await request.formData();
		const payload = {
			email: String(form.get('email') ?? '').trim(),
			redirectTo: String(form.get('redirectTo') ?? '/admin')
		};

		const parsed = loginSchema.safeParse({ email: payload.email });
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
		}

		const { error } = await locals.supabase.auth.signInWithOtp({
			email: parsed.data.email,
			options: {
				shouldCreateUser: false,
				emailRedirectTo: `${appBaseUrl}/admin/callback?next=${encodeURIComponent(payload.redirectTo)}`
			}
		});

		if (error) {
			console.error('Magic link request failed', error);
			return fail(500, { serverError: 'Unable to send login link right now.' });
		}

		return { success: true };
	}
};
