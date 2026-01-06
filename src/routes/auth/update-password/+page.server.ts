import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

const schema = z
	.object({
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords must match',
		path: ['confirmPassword']
	});

export const load: PageServerLoad = async ({ url, locals }) => {
	const code = url.searchParams.get('code');

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (!error) {
			// Remove the code from the URL after exchanging so refreshes are clean.
			throw redirect(303, '/auth/update-password');
		}
		return { errorMessage: 'Invalid or expired reset link.' };
	}

	const user = await locals.getUser();
	if (!user) {
		return { needsSession: true };
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user) {
			return fail(401, { serverError: 'Session expired. Please request a new reset link.' });
		}

		const form = await request.formData();
		const payload = {
			password: String(form.get('password') ?? ''),
			confirmPassword: String(form.get('confirmPassword') ?? '')
		};

		const parsed = schema.safeParse(payload);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
		}

		const { error } = await locals.supabase.auth.updateUser({
			password: parsed.data.password
		});

		if (error) {
			return fail(400, { serverError: 'Unable to update password. Please try again.' });
		}

		throw redirect(303, '/admin');
	}
};
