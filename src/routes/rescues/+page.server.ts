import type { PageServerLoad } from './$types';
const PAGE_SIZE = 12;

export const load: PageServerLoad = async ({ locals, url }) => {
	const search = url.searchParams.get('q')?.trim() ?? '';
	const sort = url.searchParams.get('sort') ?? 'a_z';
	const hasPets = url.searchParams.get('hasPets') === '1';
	const page = Math.max(1, Number(url.searchParams.get('page') ?? '1') || 1);

	// Adoptable counts grouped (client side)
	const { data: animalRows, error: animalError } = await locals.supabase
		.from('animals')
		.select('rescue_id,status,is_active');

	if (animalError) {
		console.error(animalError);
	}

	const adoptableCounts: Record<string, number> = {};
	(animalRows ?? []).forEach((row) => {
		if (!row.is_active) return;
		if (!['available', 'hold'].includes(row.status)) return;
		adoptableCounts[row.rescue_id] = (adoptableCounts[row.rescue_id] ?? 0) + 1;
	});

	const idsWithPets = Object.keys(adoptableCounts).filter((id) => adoptableCounts[id] > 0);

	let query = locals.supabase
		.from('public_rescues')
		.select('*', { count: 'exact' });

	if (search) {
		const like = `%${search}%`;
		query = query.or(
			`name.ilike.${like},tagline.ilike.${like},location_text.ilike.${like}`,
			{ foreignTable: undefined }
		);
	}

	if (hasPets && idsWithPets.length === 0) {
		return {
			rescues: [],
			total: 0,
			page,
			pageSize: PAGE_SIZE,
			search,
			sort,
			hasPets,
			counts: adoptableCounts
		};
	}

	if (hasPets) {
		query = query.in('id', idsWithPets);
	}

	if (sort === 'newest') {
		query = query.order('created_at', { ascending: false });
	} else if (sort === 'a_z') {
		query = query.order('name', { ascending: true });
	}
	// adoptable sort handled after fetch (best effort within page)

	const from = (page - 1) * PAGE_SIZE;
	const to = from + PAGE_SIZE - 1;

	const { data: rescues, error: rescueError, count } = await query.range(from, to);

	if (rescueError) {
		console.error(rescueError);
		return { rescues: [], counts: adoptableCounts, search, sort, hasPets, page, pageSize: PAGE_SIZE, total: 0 };
	}

	let rescuesWithCounts =
		rescues?.map((r) => ({
			...r,
			adoptable_count: adoptableCounts[r.id] ?? 0
		})) ?? [];

	if (sort === 'adoptable') {
		rescuesWithCounts = rescuesWithCounts.sort((a, b) => (b.adoptable_count ?? 0) - (a.adoptable_count ?? 0));
	}

	return {
		rescues: rescuesWithCounts,
		total: count ?? rescuesWithCounts.length,
		page,
		pageSize: PAGE_SIZE,
		search,
		sort,
		hasPets,
		counts: adoptableCounts
	};
};
