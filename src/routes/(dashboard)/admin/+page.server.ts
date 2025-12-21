import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

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
		.select('id, adopter_name, status, created_at, first_responded_at, animals(name)')
		.eq('rescue_id', rescue.id)
		.order('created_at', { ascending: false })
		.limit(5);

	if (inquiryError) {
		console.error(inquiryError);
		throw error(500, 'Unable to load inquiries');
	}

	const newInquiries = inquiries?.filter((inq) => inq.status === 'new').length ?? 0;
	const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
	const staleCutoff = Date.now() - 48 * 60 * 60 * 1000;

	const { data: allInquiries } = await locals.supabase
		.from('inquiries')
		.select('id, status, created_at, first_responded_at, animals(name)')
		.eq('rescue_id', rescue.id);

	const recentNew = allInquiries?.filter((inq) => new Date(inq.created_at).getTime() >= recentCutoff) ?? [];
	const noResponse =
		allInquiries?.filter(
			(inq) => inq.status === 'new' && new Date(inq.created_at).getTime() <= staleCutoff
		) ?? [];

	const { data: animals } = await locals.supabase
		.from('animals')
		.select('id, name, status, inquiries(count)')
		.eq('rescue_id', rescue.id)
		.eq('is_active', true);

	const animalsNoInquiries =
		animals?.filter((animal) => Array.isArray(animal.inquiries) && animal.inquiries[0]?.count === 0) ?? [];

	const timeToFirstResponse = (() => {
		if (!allInquiries) return null;
		const deltas: number[] = [];
		for (const inq of allInquiries) {
			if (inq.first_responded_at) {
				deltas.push(new Date(inq.first_responded_at).getTime() - new Date(inq.created_at).getTime());
			}
		}
		if (!deltas.length) return null;
		const avgMs = deltas.reduce((a, b) => a + b, 0) / deltas.length;
		return Math.round(avgMs / (1000 * 60 * 60)); // hours
	})();

	const staleCount =
		allInquiries?.filter(
			(inq) => inq.status === 'new' && new Date(inq.created_at).getTime() <= staleCutoff
		).length ?? 0;

	return {
		stats: {
			...stats,
			newInquiries
		},
		recentInquiries: inquiries ?? [],
		crmSlices: {
			recentNew,
			noResponse,
			animalsNoInquiries
		},
		analytics: {
			timeToFirstResponseHours: timeToFirstResponse,
			inquiriesPerAnimal: animals && animals.length ? (allInquiries?.length ?? 0) / animals.length : 0,
			staleCount
		}
	};
};

export const actions: Actions = {
	updateRescue: async ({ request, locals }) => {
		const rescue = locals.currentRescue;
		if (!rescue) {
			return { serverError: 'Missing rescue' };
		}
		const form = await request.formData();
		const payload = {
			mission_statement: String(form.get('mission_statement') ?? '').trim() || null,
			adoption_process: String(form.get('adoption_process') ?? '').trim() || null,
			response_time_text: String(form.get('response_time_text') ?? '').trim() || null
		};

		const { error: updateError } = await locals.supabase
			.from('rescues')
			.update(payload)
			.eq('id', rescue.id);

		if (updateError) {
			console.error(updateError);
			return { serverError: 'Unable to update rescue profile.' };
		}

		return { success: true };
	}
};
