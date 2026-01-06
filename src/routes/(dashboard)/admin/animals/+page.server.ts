import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { animalFormSchema } from '$lib/validation';
import { parseTagList } from '$lib/utils/form';

type SortOption = 'newest' | 'oldest' | 'most_inquiries' | 'longest_listed';

const PAGE_SIZE = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

export const load: PageServerLoad = async ({ locals, url }) => {
	const rescue = locals.currentRescue;
	if (!rescue) {
		throw error(403, 'Missing rescue');
	}

	const search = url.searchParams.get('q')?.trim() || '';
	const statusFilter = url.searchParams.get('status') || '';
	const speciesFilter = url.searchParams.get('species') || '';
	const inquiriesFilterParam = url.searchParams.get('inquiries') || '';
	const zeroInquiries = url.searchParams.get('zeroInquiries') === '1';
	const inquiriesFilter = zeroInquiries ? 'none' : inquiriesFilterParam;
	const sort = (url.searchParams.get('sort') as SortOption) || 'newest';
	const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
	const usePagination = inquiriesFilter ? false : true;

	let query = locals.supabase
		.from('animals')
		.select('id,name,species,status,is_active,created_at,animal_photos(image_url, sort_order),inquiries(count)', {
			count: 'exact'
		})
		.eq('rescue_id', rescue.id);

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

	if (sort === 'newest') {
		query = query.order('created_at', { ascending: false });
	} else if (sort === 'oldest') {
		query = query.order('created_at', { ascending: true });
	} else if (sort === 'most_inquiries') {
		query = query.order('count', { referencedTable: 'inquiries', ascending: false }).order('created_at', {
			ascending: false
		});
	} else if (sort === 'longest_listed') {
		query = query.order('created_at', { ascending: true });
	}

	if (usePagination) {
		const from = (page - 1) * PAGE_SIZE;
		const to = from + PAGE_SIZE - 1;
		query = query.range(from, to);
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
		const payload = {
			name: String(form.get('name') ?? ''),
			species: String(form.get('species') ?? ''),
			breed: String(form.get('breed') ?? '') || null,
			age: String(form.get('age') ?? '') || null,
			sex: String(form.get('sex') ?? '') || null,
			description: String(form.get('description') ?? '') || null,
			status: (String(form.get('status') ?? 'available') as 'available' | 'hold' | 'adopted') ?? 'available',
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
		const status = String(form.get('status') ?? '');
		if (!ids.length || !['available', 'hold', 'adopted'].includes(status)) {
			return fail(400, { serverError: 'Invalid payload' });
		}
		const { error: updateError } = await locals.supabase
			.from('animals')
			.update({ status, is_active: true })
			.in('id', ids);
		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to update selection.' });
		}
		return { success: true };
	}
};
