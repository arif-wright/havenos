import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { animalFormSchema } from '$lib/validation';
import { parseTagList } from '$lib/utils/form';

type SortOption = 'newest' | 'oldest' | 'most_inquiries' | 'longest_listed';
type PipelineStage = 'intake' | 'foster' | 'available' | 'hold' | 'adopted';

const PAGE_SIZE = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

const resolveDefaultStage = (status: 'available' | 'hold' | 'adopted'): PipelineStage => {
	if (status === 'adopted') return 'adopted';
	if (status === 'hold') return 'hold';
	return 'available';
};

export const load: PageServerLoad = async ({ locals, url }) => {
	const rescue = locals.currentRescue;
	if (!rescue) {
		throw error(403, 'Missing rescue');
	}

	const search = url.searchParams.get('q')?.trim() || '';
	const statusFilter = url.searchParams.get('status') || '';
	const speciesFilter = url.searchParams.get('species') || '';
	const inquiriesFilterParam = url.searchParams.get('inquiries') || '';
	const view = url.searchParams.get('view') === 'board' ? 'board' : 'list';
	const zeroInquiries = url.searchParams.get('zeroInquiries') === '1';
	const inquiriesFilter = zeroInquiries ? 'none' : inquiriesFilterParam;
	const sort = (url.searchParams.get('sort') as SortOption) || 'newest';
	const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
	const usePagination = view === 'list' && !inquiriesFilter;

	let query = locals.supabase
		.from('animals')
		.select(
			[
				'id',
				'name',
				'species',
				'age',
				'breed',
				'status',
				'pipeline_stage',
				'is_active',
				'created_at',
				'energy_level',
				'personality_traits',
				'good_with',
				'tags',
				'animal_photos(image_url, sort_order)',
				'inquiries(count)'
			].join(','),
			{ count: 'exact' }
		)
		.eq('rescue_id', rescue.id);

	if (view === 'board') {
		query = query.order('created_at', { ascending: false });
	} else if (sort === 'newest') {
		query = query.order('created_at', { ascending: false });
	} else if (sort === 'oldest') {
		query = query.order('created_at', { ascending: true });
	} else if (sort === 'most_inquiries') {
		query = query
			.order('count', { referencedTable: 'inquiries', ascending: false })
			.order('created_at', { ascending: false });
	} else if (sort === 'longest_listed') {
		query = query.order('created_at', { ascending: true });
	}

	if (usePagination) {
		const from = (page - 1) * PAGE_SIZE;
		const to = from + PAGE_SIZE - 1;
		query = query.range(from, to);
	}

	if (search) {
		query = query.ilike('name', `%${search}%`);
	}

	if (statusFilter === 'archived') {
		query = query.eq('is_active', false);
	} else if (statusFilter) {
		query = query.eq('status', statusFilter).eq('is_active', true);
	}

	if (speciesFilter) {
		query = query.ilike('species', `%${speciesFilter}%`);
	}

	if (view === 'board') {
		query = query.order('pipeline_stage', { ascending: true }).order('created_at', { ascending: false });
	}

	const { data, error: loadError, count } = await query;
	if (loadError) {
		console.error(loadError);
		throw error(500, 'Unable to load animals');
	}

	let filtered = data ?? [];

	if (inquiriesFilter === 'has') {
		filtered = filtered.filter((row) => (row.inquiries?.[0]?.count ?? 0) > 0);
	} else if (inquiriesFilter === 'none') {
		filtered = filtered.filter((row) => (row.inquiries?.[0]?.count ?? 0) === 0);
	}

	const animals = filtered.map((row) => ({
		...row,
		pipeline_stage: (row.pipeline_stage as PipelineStage) ?? resolveDefaultStage(row.status as any),
		thumb: row.animal_photos?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.image_url ?? '',
		inquiryCount: row.inquiries?.[0]?.count ?? 0,
		isArchived: !row.is_active,
		isStale: Date.now() - new Date(row.created_at).getTime() > 30 * DAY_MS
	}));

	const total = inquiriesFilter ? animals.length : count ?? animals.length;
	const totalPages = usePagination ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : 1;
	const currentPage = usePagination ? page : 1;

	return {
		animals,
		view,
		filters: {
			search,
			status: statusFilter,
			species: speciesFilter,
			inquiries: inquiriesFilter,
			sort,
			page: currentPage,
			totalPages
		}
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const rescueId = locals.currentRescue?.id;
		const role = locals.currentMemberRole ?? 'staff';
		if (!rescueId || role === 'staff') {
			return fail(403, { serverError: 'Not authorized', action: 'create' });
		}

		const form = await request.formData();
		const formStatus = (String(form.get('status') ?? 'available') as 'available' | 'hold' | 'adopted') ?? 'available';
		const defaultStage = resolveDefaultStage(formStatus);
		const pipelineStage = (String(form.get('pipeline_stage') ?? '') as PipelineStage) || defaultStage;
		const payload = {
			name: String(form.get('name') ?? ''),
			species: String(form.get('species') ?? ''),
			breed: String(form.get('breed') ?? '') || null,
			age: String(form.get('age') ?? '') || null,
			sex: String(form.get('sex') ?? '') || null,
			description: String(form.get('description') ?? '') || null,
			personality_traits: parseTagList(form.get('personality_traits')),
			energy_level: String(form.get('energy_level') ?? '') || null,
			good_with: parseTagList(form.get('good_with')),
			training: String(form.get('training') ?? '') || null,
			medical_needs: String(form.get('medical_needs') ?? '') || null,
			ideal_home: String(form.get('ideal_home') ?? '') || null,
			status: formStatus,
			pipeline_stage: pipelineStage,
			tags: parseTagList(form.get('tags'))
		};

		const parsed = animalFormSchema.omit({ id: true, is_active: true }).safeParse(payload);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors, values: payload, action: 'create' });
		}

		const { data, error: insertError } = await locals.supabase
			.from('animals')
			.insert({
				...parsed.data,
				rescue_id: rescueId,
				is_active: true
			})
			.select('id')
			.single();

		if (insertError || !data) {
			console.error(insertError);
			return fail(500, { serverError: 'Unable to create animal.', values: payload, action: 'create' });
		}

		throw redirect(303, `/admin/animals/${data.id}`);
	},
	bulkArchive: async ({ request, locals }) => {
		const role = locals.currentMemberRole ?? 'staff';
		if (role === 'staff') {
			return fail(403, { serverError: 'Not authorized' });
		}
		const form = await request.formData();
		const ids = String(form.get('ids') ?? '')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (!ids.length) {
			return fail(400, { serverError: 'No animals selected' });
		}
		const { error: updateError } = await locals.supabase.from('animals').update({ is_active: false }).in('id', ids);
		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to archive selection.' });
		}
		return { success: true };
	},
	bulkActivate: async ({ request, locals }) => {
		const role = locals.currentMemberRole ?? 'staff';
		if (role === 'staff') {
			return fail(403, { serverError: 'Not authorized' });
		}
		const form = await request.formData();
		const ids = String(form.get('ids') ?? '')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		if (!ids.length) {
			return fail(400, { serverError: 'No animals selected' });
		}
		const { error: updateError } = await locals.supabase.from('animals').update({ is_active: true }).in('id', ids);
		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to activate selection.' });
		}
		return { success: true };
	},
	bulkStatus: async ({ request, locals }) => {
		const role = locals.currentMemberRole ?? 'staff';
		if (role === 'staff') {
			return fail(403, { serverError: 'Not authorized' });
		}
		const form = await request.formData();
		const ids = String(form.get('ids') ?? '')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
		const status = String(form.get('status') ?? '') as PipelineStage;
		if (!ids.length || !['available', 'hold', 'adopted'].includes(status)) {
			return fail(400, { serverError: 'Invalid payload' });
		}
		const nextStage = resolveDefaultStage(status as 'available' | 'hold' | 'adopted');
		const { error: updateError } = await locals.supabase
			.from('animals')
			.update({ status: status as any, pipeline_stage: nextStage, is_active: true })
			.in('id', ids);
		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to update selection.' });
		}
		return { success: true };
	},
	moveStage: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user) {
			return fail(403, { serverError: 'Not authenticated' });
		}
		const form = await request.formData();
		const animalId = String(form.get('animalId') ?? '');
		const toStage = String(form.get('toStage') ?? '') as PipelineStage;
		const validStages: PipelineStage[] = ['intake', 'foster', 'available', 'hold', 'adopted'];
		if (!animalId || !validStages.includes(toStage)) {
			return fail(400, { serverError: 'Invalid stage update.' });
		}

		const { data: existing, error: fetchError } = await locals.supabase
			.from('animals')
			.select('status,pipeline_stage')
			.eq('id', animalId)
			.maybeSingle();
		if (fetchError || !existing) {
			console.error(fetchError);
			return fail(404, { serverError: 'Animal not found.' });
		}

		const nextStatus: 'available' | 'hold' | 'adopted' =
			toStage === 'adopted' ? 'adopted' : toStage === 'hold' ? 'hold' : 'available';

		const { error: updateError } = await locals.supabase
			.from('animals')
			.update({ pipeline_stage: toStage, status: nextStatus })
			.eq('id', animalId);

		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to move card.' });
		}

		await locals.supabase.from('animal_stage_events').insert({
			animal_id: animalId,
			from_stage: existing.pipeline_stage as any,
			to_stage: toStage,
			changed_by: user.id
		});

		return { success: true };
	}
};
