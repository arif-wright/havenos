import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { animalFormSchema } from '$lib/validation';
import { parseTagList } from '$lib/utils/form';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.currentRescue) {
		throw redirect(303, '/onboarding');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const rescueId = locals.currentRescue?.id;
		if (!rescueId) {
			throw error(403, 'Missing rescue context');
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
			return fail(400, { errors: parsed.error.flatten().fieldErrors, values: payload });
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
			return fail(500, { serverError: 'Unable to create animal.', values: payload });
		}

		throw redirect(303, `/admin/animals/${data.id}`);
	}
};
