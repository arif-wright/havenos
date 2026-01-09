import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getServiceSupabase } from '$lib/server/supabaseService';
import type { Tables } from '$lib/supabase/types';

const allowedKinds = new Set(['rescue_directory', 'rescue_animals']);
const allowedFrequencies = new Set(['daily', 'weekly']);

const sanitizeQuery = (value: unknown) => {
	if (!value || typeof value !== 'object') return {};
	return value;
};

export const POST: RequestHandler = async ({ request, url }) => {
	const payload = await request.json().catch(() => ({}));
	const kindRaw = String((payload as any).kind ?? 'rescue_directory');
	const kind = allowedKinds.has(kindRaw) ? kindRaw : 'rescue_directory';
	const email = String((payload as any).email ?? '').trim().toLowerCase();
	const frequencyRaw = String((payload as any).frequency ?? 'daily');
	const frequency = allowedFrequencies.has(frequencyRaw) ? frequencyRaw : 'daily';
	const rescueId =
		kind === 'rescue_animals' && (payload as any).rescueId
			? String((payload as any).rescueId)
			: null;
	const queryParams = sanitizeQuery((payload as any).query ?? (payload as any).query_params ?? {});

	if (!email || !email.includes('@')) {
		return json({ error: 'Valid email required' }, { status: 400 });
	}

	if (kind === 'rescue_animals' && !rescueId) {
		return json({ error: 'Missing rescue id' }, { status: 400 });
	}

	let service;
	try {
		service = getServiceSupabase();
	} catch (error) {
		console.error('saved search service client missing', error);
		return json({ error: 'Alerts service is not configured' }, { status: 500 });
	}
	const alertPayload: Tables['saved_search_alerts']['Insert'] = {
		kind,
		rescue_id: rescueId,
		email,
		frequency,
		query_params: {
			...queryParams,
			source_path: url.pathname,
			created_at: new Date().toISOString()
		}
	};

	const { error } = await service.from('saved_search_alerts').insert(alertPayload);

	if (error) {
		console.error('save search alert failed', error);
		return json({ error: 'Unable to save alert right now' }, { status: 500 });
	}

	return json({
		success: true,
		message: 'Alert saved. We will email you when matching pets are available.'
	});
};
