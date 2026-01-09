import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { getServiceSupabase } from '$lib/server/supabaseService';

export const GET: RequestHandler = async ({ request }) => {
	const token = request.headers.get('x-cron-token');
	const cronToken = env.SAVED_SEARCH_CRON_TOKEN;

	if (cronToken && token !== cronToken) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	if (!cronToken) {
		return json({
			ready: false,
			message: 'Set SAVED_SEARCH_CRON_TOKEN to enable cron triggering. Alerts are stored only (no emails sent).'
		});
	}

	let service;
	try {
		service = getServiceSupabase();
	} catch (error) {
		console.error('saved search cron service missing', error);
		return json({ error: 'Alerts service not configured' }, { status: 500 });
	}
	const { data, error } = await service
		.from('saved_search_alerts')
		.select('id, created_at, frequency')
		.order('created_at', { ascending: false })
		.limit(50);

	if (error) {
		console.error('cron saved search read failed', error);
		return json({ error: 'Unable to load alert queue' }, { status: 500 });
	}

	return json({
		ready: true,
		queued: data?.length ?? 0,
		message: 'Email delivery not yet wired; integrate Resend/batch sender when ready.'
	});
};
