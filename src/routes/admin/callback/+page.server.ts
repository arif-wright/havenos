import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type OtpType = 'magiclink' | 'recovery' | 'invite' | 'signup' | 'email_change';

export const load: PageServerLoad = async ({ url, locals }) => {
	const next = url.searchParams.get('next') ?? '/admin';
	const code = url.searchParams.get('code');
	const tokenHash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as OtpType | null;
	const email = url.searchParams.get('email');

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (error) {
			return { errorMessage: error.message };
		}
		throw redirect(303, next);
	}

	if (tokenHash && type && email) {
		const { error } = await locals.supabase.auth.verifyOtp({
			type,
			token_hash: tokenHash,
			email
		});
		if (error) {
			return { errorMessage: error.message };
		}
		throw redirect(303, next);
	}

	return { errorMessage: 'Invalid or expired verification link.' };
};
