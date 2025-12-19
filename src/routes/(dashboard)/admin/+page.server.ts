import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const rescue = locals.currentRescue;
	if (!rescue) {
		throw error(403, 'Missing rescue context');
	}

	const { data: animalRows, error: animalError } = await locals.supabase
		.from('animals')
		.select('status, is_active, updated_at')
		.eq('rescue_id', rescue.id);

	if (animalError) {
		console.error(animalError);
		throw error(500, 'Unable to load animals');
	}

	const stats = {
		totalAnimals: animalRows?.length ?? 0,
		activeAnimals: animalRows?.filter((row) => row.is_active).length ?? 0,
		adopted: animalRows?.filter((row) => row.status === 'adopted').length ?? 0
	};

	const { data: inquiries, error: inquiryError } = await locals.supabase
		.from('inquiries')
		.select('id, adopter_name, status, created_at, animals(name)')
		.eq('rescue_id', rescue.id)
		.order('created_at', { ascending: false })
		.limit(5);

	if (inquiryError) {
		console.error(inquiryError);
		throw error(500, 'Unable to load inquiries');
	}

	const newInquiries = inquiries?.filter((inq) => inq.status === 'new').length ?? 0;

	return {
		stats: {
			...stats,
			newInquiries
		},
		recentInquiries: inquiries ?? []
	};
};
