import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { APP_BASE_URL } from '$env/static/private';
import { env as publicEnv } from '$env/dynamic/public';

const loginSchema = z.object({
	email: z.string().email('Valid email required'),
	password: z.string().min(6, 'Password required')
});

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = await locals.getUser();

	if (user) {
		throw redirect(303, '/admin');
	}
	return {
		redirectTo: url.searchParams.get('redirectTo') ?? '/admin',
		googleEnabled: publicEnv.PUBLIC_GOOGLE_AUTH_ENABLED === 'true',
		disabledNotice: url.searchParams.get('disabled') === '1'
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const requestUrl = new URL(request.url);
		const form = await request.formData();
		const payload = {
			email: String(form.get('email') ?? '').trim(),
			password: String(form.get('password') ?? ''),
			redirectTo: String(form.get('redirectTo') ?? '/admin'),
			requestOrigin: requestUrl.origin
		};

		const parsed = loginSchema.safeParse({ email: payload.email, password: payload.password });
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
		}

		const { data, error } = await locals.supabase.auth.signInWithPassword({
			email: parsed.data.email,
			password: parsed.data.password
		});

		if (error) {
			const message =
				error.status === 400 || error.status === 401
					? 'Invalid email or password.'
					: 'Unable to sign in right now.';
			return fail(400, { serverError: message });
		}

		if (!data.session) {
			return fail(400, { serverError: 'Session could not be created.' });
		}

		throw redirect(303, payload.redirectTo);
	},
	google: async ({ request, locals }) => {
		const googleEnabled = publicEnv.PUBLIC_GOOGLE_AUTH_ENABLED === 'true';
		if (!googleEnabled) {
			return fail(400, { serverError: 'Google sign-in is not enabled.' });
		}

		const requestUrl = new URL(request.url);
		const appBaseUrl = (APP_BASE_URL ?? requestUrl.origin ?? 'http://localhost:5173').replace(/\/$/, '');
		const form = await request.formData();
		const redirectTo = String(form.get('redirectTo') ?? '/admin');

		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${appBaseUrl}/admin/callback?next=${encodeURIComponent(redirectTo)}`
			}
		});

		if (error || !data?.url) {
			return fail(400, { serverError: 'Unable to start Google sign-in.' });
		}

		throw redirect(303, data.url);
	}
};
