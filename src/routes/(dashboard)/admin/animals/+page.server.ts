import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

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
	const inquiriesFilter = url.searchParams.get('inquiries') || '';
	const sort = (url.searchParams.get('sort') as SortOption) || 'newest';
	const page = Math.max(1, Number(url.searchParams.get('page') || '1'));

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

	if (inquiriesFilter === 'has') {
		query = query.gt('count', 0, { referencedTable: 'inquiries' });
	} else if (inquiriesFilter === 'none') {
		query = query.eq('count', 0, { referencedTable: 'inquiries' });
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

	const from = (page - 1) * PAGE_SIZE;
	const to = from + PAGE_SIZE - 1;
	query = query.range(from, to);

	const { data, error: loadError, count } = await query;
	if (loadError) {
		console.error(loadError);
		throw error(500, 'Unable to load animals');
	}

	const animals = (data ?? []).map((row) => ({
		...row,
		thumb: row.animal_photos?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.image_url ?? '',
		inquiryCount: row.inquiries?.[0]?.count ?? 0,
		isArchived: !row.is_active,
		isStale: Date.now() - new Date(row.created_at).getTime() > 30 * DAY_MS
	}));

	const total = count ?? animals.length;
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

	return {
		animals,
		filters: {
			search,
			status: statusFilter,
			species: speciesFilter,
			inquiries: inquiriesFilter,
			sort,
			page,
			totalPages
		}
	};
};

export const actions: Actions = {
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
