import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { listAnimalsForRescue } from '$lib/server/animals';
import { animalFormSchema } from '$lib/validation';
import { parseTagList } from '$lib/utils/form';

const createSchema = animalFormSchema.omit({ id: true, is_active: true });

const toggleSchema = z.object({
	animalId: z.string().uuid(),
	isActive: z.enum(['true', 'false'])
});

export const load: PageServerLoad = async ({ locals }) => {
	const rescue = locals.currentRescue;
	if (!rescue) {
		throw error(403, 'Missing rescue');
	}

	const { data, error: loadError } = await listAnimalsForRescue(locals.supabase, rescue.id);
	if (loadError) {
		console.error(loadError);
		throw error(500, 'Unable to load animals');
	}

	return {
		animals: data ?? []
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
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

		const parsed = createSchema.safeParse(payload);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
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
			return fail(500, { serverError: 'Unable to create animal.' });
		}

		throw redirect(303, `/admin/animals/${data.id}`);
	},

	toggle: async ({ request, locals }) => {
		if (!locals.currentRescue) {
			throw error(403, 'Missing rescue context');
		}

		const form = await request.formData();
		const parsed = toggleSchema.safeParse({
			animalId: String(form.get('animalId') ?? ''),
			isActive: String(form.get('isActive') ?? '')
		});

		if (!parsed.success) {
			return fail(400, { serverError: 'Invalid toggle payload.' });
		}

		const { error: updateError } = await locals.supabase
			.from('animals')
			.update({ is_active: parsed.data.isActive === 'true' })
			.eq('id', parsed.data.animalId);

		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to update animal.' });
		}

		return { success: true };
	}
};
