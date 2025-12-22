import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data, error } = await locals.supabase
		.from('animals')
		.select('id,name,species,status,created_at,animal_photos(image_url, sort_order),rescue:rescue_id(name,slug)')
		.eq('is_active', true)
		.in('status', ['available', 'hold'])
		.order('created_at', { ascending: false });

	if (error) {
		console.error(error);
		return { animals: [] };
	}

	const animals =
		data?.map((row) => ({
			...row,
			thumb: row.animal_photos?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.image_url ?? ''
		})) ?? [];

	return { animals };
};
