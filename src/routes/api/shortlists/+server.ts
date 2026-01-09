import { randomBytes } from 'crypto';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getServiceSupabase } from '$lib/server/supabaseService';

const normalizeIds = (value: unknown) =>
	Array.isArray(value) ? value.map((v) => String(v)).filter(Boolean) : [];

const dedupeAndLimit = (ids: string[], limit = 50) => Array.from(new Set(ids)).slice(0, limit);

const buildToken = () => randomBytes(12).toString('hex');

export const POST: RequestHandler = async ({ request, url }) => {
	const payload = await request.json().catch(() => ({}));
	const animalIds = dedupeAndLimit(normalizeIds((payload as any).animals));
	const rescueIds = dedupeAndLimit(normalizeIds((payload as any).rescues));

	if (animalIds.length === 0 && rescueIds.length === 0) {
		return json({ error: 'No favorites to share' }, { status: 400 });
	}

	let service;
	try {
		service = getServiceSupabase();
	} catch (error) {
		console.error('shortlist service client missing', error);
		return json({ error: 'Shortlist service is not configured' }, { status: 500 });
	}
	let token = buildToken();

	for (let attempt = 0; attempt < 3; attempt++) {
		const { data, error } = await service
			.from('shortlists')
			.insert({
				token,
				animal_ids: animalIds,
				rescue_ids: rescueIds,
				payload: {
					animalIds,
					rescueIds,
					snapshot_at: new Date().toISOString()
				}
			})
			.select('token')
			.single();

		if (!error && data?.token) {
			const shareUrl = `${url.origin}/saved/${data.token}`;
			return json({ token: data.token, shareUrl });
		}

		if (error && error.code !== '23505') {
			console.error('shortlist insert failed', error);
			return json({ error: 'Unable to create shortlist' }, { status: 500 });
		}

		token = buildToken();
	}

	return json({ error: 'Unable to create shortlist' }, { status: 500 });
};
