import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: rescues, error: rescueError } = await locals.supabase
		.from('rescues')
		.select('id,name,slug,mission_statement')
		.order('name', { ascending: true });

	if (rescueError) {
		console.error(rescueError);
		return { rescues: [], counts: {} };
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

	return { rescues: rescues ?? [], counts };
};
