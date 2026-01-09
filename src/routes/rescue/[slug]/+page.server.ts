import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getPublicRescueBySlug, listPublicAnimals } from '$lib/server/animals';
import { getServiceSupabase } from '$lib/server/supabaseService';

export const load: PageServerLoad = async ({ params, url, locals }) => {
	let { data: rescue, error: rescueError } = await getPublicRescueBySlug(locals.supabase, params.slug);

	// Allow owners/admins to preview even if is_public=false
	if (!rescue && locals.currentRescue?.slug === params.slug) {
		const service = getServiceSupabase();
		const { data: fallback, error: fallbackError } = await service.from('rescues').select('*').eq('slug', params.slug).maybeSingle();
		if (fallbackError) rescueError = fallbackError;
		rescue = fallback ?? null;
	}

	if (rescueError) {
		console.error(rescueError);
		throw error(500, 'Unable to load rescue');
	}

	if (!rescue) {
		throw error(404, 'Rescue not found');
	}

	if (!rescue.id) {
		throw error(500, 'Rescue is missing an id');
	}
	const rescueId = rescue.id as string;

	if (rescue.disabled && locals.currentRescue?.id !== rescue.id) {
		throw error(404, 'Rescue not available');
	}

	const filters = {
		species: url.searchParams.get('species') || undefined,
		status: url.searchParams.get('status') as 'available' | 'hold' | 'adopted' | undefined
	};
	const pageSize = 9;
	const pageParam = parseInt(url.searchParams.get('page') || '1', 10);
	const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;

	if (filters.status && !['available', 'hold', 'adopted'].includes(filters.status)) {
		filters.status = undefined;
	}
	if (filters.species) {
		filters.species = filters.species.toLowerCase();
	}

	const { data: animals, error: animalError, count } = await listPublicAnimals(
		locals.supabase,
		rescueId,
		filters,
		{ page, pageSize }
	);

	if (animalError) {
		console.error(animalError);
		throw error(500, 'Unable to load animals');
	}

	const { data: filterRecords, error: filterError } = await locals.supabase
		.from('animals')
		.select('species,status')
		.eq('rescue_id', rescueId)
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

	const latestAnimalUpdated = animals?.reduce((max, a) => {
		const t = a.updated_at ? new Date(a.updated_at).getTime() : 0;
		return t > max ? t : max;
	}, 0) ?? 0;
	const lastUpdatedAt = new Date(Math.max(new Date(rescue.updated_at ?? rescue.created_at ?? Date.now()).getTime(), latestAnimalUpdated || 0)).toISOString();

	return {
		rescue,
		animals: animals ?? [],
		total: count ?? animals?.length ?? 0,
		page,
		pageSize,
		filters,
		searchParams: Object.fromEntries(url.searchParams.entries()),
		speciesOptions,
		statusOptions,
		lastUpdatedAt
	};
};

export const actions: Actions = {
	report: async ({ request, locals }) => {
		const form = await request.formData();
		const rescue_id = String(form.get('rescue_id') ?? '');
		const animal_id = String(form.get('animal_id') ?? '') || null;
		const reporter_email = String(form.get('reporter_email') ?? '').trim() || null;
		const reporter_name = String(form.get('reporter_name') ?? '').trim() || null;
		const message = String(form.get('message') ?? '').trim();

		if (!rescue_id || !message) {
			return fail(400, { serverError: 'Report requires a message.' });
		}

		const { error } = await locals.supabase.from('abuse_reports').insert({
			type: animal_id ? 'animal' : 'rescue',
			rescue_id,
			animal_id,
			reporter_email,
			reporter_name,
			message
		});

		if (error) {
			console.error('report insert failed', error);
			return fail(500, { serverError: 'Unable to submit report.' });
		}

		return { success: true };
	}
};
