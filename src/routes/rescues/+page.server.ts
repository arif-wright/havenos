import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const search = url.searchParams.get('q')?.trim().toLowerCase() ?? '';

	const { data: rescues, error: rescueError } = await locals.supabase
		.from('public_rescues')
		.select('id,name,slug,tagline,location_text,mission_statement,logo_url')
		.order('name', { ascending: true });

	if (rescueError) {
		console.error(rescueError);
		return { rescues: [], counts: {}, search };
	}

	const { data: animals, error: animalError } = await locals.supabase
		.from('animals')
		.select('rescue_id,status,is_active');

	if (animalError) {
		console.error(animalError);
	}

	const counts: Record<string, number> = {};
	(animals ?? []).forEach((row) => {
		if (!row.is_active) return;
		if (!['available', 'hold'].includes(row.status)) return;
		counts[row.rescue_id] = (counts[row.rescue_id] ?? 0) + 1;
	});

	const filtered = (rescues ?? []).filter((r) => {
		if (!search) return true;
		const text = `${r.name ?? ''} ${r.tagline ?? ''} ${r.location_text ?? ''}`.toLowerCase();
		return text.includes(search);
	});

	return { rescues: filtered, counts, search };
};
