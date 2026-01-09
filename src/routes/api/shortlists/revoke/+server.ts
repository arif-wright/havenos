import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getServiceSupabase } from '$lib/server/supabaseService';

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json().catch(() => ({}));
	const token = String((payload as any)?.token ?? '').trim();

	if (!token) {
		return json({ error: 'Token is required' }, { status: 400 });
	}

	let service;
	try {
		service = getServiceSupabase();
	} catch (error) {
		console.error('shortlist revoke: service client missing', error);
		return json({ error: 'Shortlist service is not configured' }, { status: 500 });
	}

	const revokedAt = new Date().toISOString();
	const { data, error: revokeError } = await service
		.from('shortlists')
		.update({ revoked_at: revokedAt })
		.eq('token', token)
		.is('revoked_at', null)
		.select('token')
		.maybeSingle();

	if (revokeError) {
		console.error('shortlist revoke failed', revokeError);
		return json({ error: 'Unable to revoke shortlist' }, { status: 500 });
	}

	if (!data) {
		return json({ error: 'Shortlist not found or already revoked' }, { status: 404 });
	}

	return json({ success: true, revokedAt });
};
