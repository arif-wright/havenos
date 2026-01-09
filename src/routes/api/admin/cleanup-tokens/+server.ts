import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getServiceSupabase } from '$lib/server/supabaseService';

export const GET: RequestHandler = async ({ url, request }) => {
	const adminToken = request.headers.get('x-admin-token') ?? url.searchParams.get('token');
	if (!env.ADMIN_MAINTENANCE_TOKEN || adminToken !== env.ADMIN_MAINTENANCE_TOKEN) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const dryRun = url.searchParams.get('dryRun') !== '0' && url.searchParams.get('dryRun') !== 'false';
	const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
	const filter = `expires_at.lt.${cutoff},revoked_at.lt.${cutoff}`;
	const service = getServiceSupabase();

	const { count: candidateCount, error: countError } = await service
		.from('shortlists')
		.select('id', { count: 'exact', head: true })
		.or(filter);

	if (countError) {
		console.error('cleanup tokens count failed', countError);
		return json({ error: 'Unable to calculate cleanup set' }, { status: 500 });
	}

	if (dryRun) {
		return json({ dryRun: true, deletable: candidateCount ?? 0, cutoff });
	}

	const { error: deleteError, count: deleted } = await service
		.from('shortlists')
		.delete({ count: 'exact' })
		.or(filter)
		.select('id');

	if (deleteError) {
		console.error('cleanup tokens delete failed', deleteError);
		return json({ error: 'Cleanup failed' }, { status: 500 });
	}

	return json({ dryRun: false, deleted: deleted ?? 0, cutoff });
};
