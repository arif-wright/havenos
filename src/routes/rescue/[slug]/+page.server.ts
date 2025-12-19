import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPublicRescueBySlug, listPublicAnimals } from '$lib/server/animals';

export const load: PageServerLoad = async ({ params, url, locals }) => {
	const { data: rescue, error: rescueError } = await getPublicRescueBySlug(
		locals.supabase,
		params.slug
	);

	if (rescueError) {
		console.error(rescueError);
		throw error(500, 'Unable to load rescue');
	}

	if (!rescue) {
		throw error(404, 'Rescue not found');
	}

	const filters = {
		species: url.searchParams.get('species') || undefined,
		status: url.searchParams.get('status') as 'available' | 'hold' | 'adopted' | undefined
	};

	if (filters.status && !['available', 'hold', 'adopted'].includes(filters.status)) {
		filters.status = undefined;
	}
	if (filters.species) {
		filters.species = filters.species.toLowerCase();
	}

	const { data: animals, error: animalError } = await listPublicAnimals(locals.supabase, rescue.id, filters);

	if (animalError) {
		console.error(animalError);
		throw error(500, 'Unable to load animals');
	}

	const { data: filterRecords, error: filterError } = await locals.supabase
		.from('animals')
		.select('species,status')
		.eq('rescue_id', rescue.id)
		.eq('is_active', true);

	if (filterError) {
		console.error(filterError);
	}

	const speciesOptions = Array.from(new Set(filterRecords?.map((row) => row.species)?.filter(Boolean) ?? [])).sort(
		(a, b) => a.localeCompare(b)
	);
	const statusOptions = Array.from(new Set(filterRecords?.map((row) => row.status) ?? [])).sort((a, b) =>
		a.localeCompare(b)
	);

	return {
		rescue,
		animals: animals ?? [],
		filters,
		searchParams: Object.fromEntries(url.searchParams.entries()),
		speciesOptions,
		statusOptions
	};
};
