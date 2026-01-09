import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { getAnimalForRescue } from '$lib/server/animals';
import { animalFormSchema, inquiryStatusSchema } from '$lib/validation';
import { parseBoolean, parseTagList } from '$lib/utils/form';
import { extractStoragePath, removeAnimalPhoto, uploadAnimalPhoto } from '$lib/server/storage';

const updateSchema = animalFormSchema.extend({
	id: z.string().uuid(),
	pipeline_stage: z.enum(['intake', 'foster', 'available', 'hold', 'adopted']).optional()
});

type PipelineStage = 'intake' | 'foster' | 'available' | 'hold' | 'adopted';
const resolveStage = (stage: string | null | undefined, status: 'available' | 'hold' | 'adopted'): PipelineStage => {
	if (stage === 'adopted' || status === 'adopted') return 'adopted';
	if (stage === 'hold' || status === 'hold') return 'hold';
	if (stage === 'foster') return 'foster';
	if (stage === 'intake') return 'intake';
	return 'available';
};

const reorderSchema = z.object({
	photoId: z.string().uuid(),
	direction: z.enum(['up', 'down'])
});

const deletePhotoSchema = z.object({
	photoId: z.string().uuid(),
	imageUrl: z.string().url()
});

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data, error: loadError } = await getAnimalForRescue(locals.supabase, params.id);
	if (loadError) {
		console.error(loadError);
		throw error(500, 'Unable to load animal');
	}
	if (!data) {
		throw redirect(303, '/admin/animals');
	}

	return {
		animal: data
	};
};

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		if (!locals.currentRescue) {
			throw error(403, 'Missing rescue context');
		}
		const user = await locals.getUser();
		if (!user) {
			return fail(403, { serverError: 'Not authenticated' });
		}
		const form = await request.formData();
		const payload = {
			id: params.id,
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
			status: String(form.get('status') ?? 'available') as 'available' | 'hold' | 'adopted',
			pipeline_stage: String(form.get('pipeline_stage') ?? '') || null,
			tags: parseTagList(form.get('tags')),
			is_active: parseBoolean(form.get('is_active'), true)
		};

		const parsed = updateSchema.safeParse(payload);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors, values: payload });
		}

		const { data: existing, error: existingError } = await locals.supabase
			.from('animals')
			.select('status,pipeline_stage')
			.eq('id', params.id)
			.maybeSingle();
		if (existingError || !existing) {
			console.error(existingError);
			return fail(404, { serverError: 'Animal not found.', values: payload });
		}

		const nextStage = resolveStage(parsed.data.pipeline_stage ?? existing.pipeline_stage, parsed.data.status);
		const nextStatus =
			nextStage === 'adopted'
				? 'adopted'
				: nextStage === 'hold'
					? 'hold'
					: parsed.data.status ?? existing.status;

		const { error: updateError } = await locals.supabase
			.from('animals')
			.update({
				name: parsed.data.name,
				species: parsed.data.species,
				breed: parsed.data.breed,
				age: parsed.data.age,
				sex: parsed.data.sex,
				description: parsed.data.description,
				personality_traits: parsed.data.personality_traits,
				energy_level: parsed.data.energy_level,
				good_with: parsed.data.good_with,
				training: parsed.data.training,
				medical_needs: parsed.data.medical_needs,
				ideal_home: parsed.data.ideal_home,
				status: nextStatus,
				pipeline_stage: nextStage,
				tags: parsed.data.tags,
				is_active: parsed.data.is_active
			})
			.eq('id', parsed.data.id);

		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to update animal.', values: payload });
		}

		if ((existing.pipeline_stage as PipelineStage | null) !== nextStage) {
			await locals.supabase.from('animal_stage_events').insert({
				animal_id: params.id,
				from_stage: existing.pipeline_stage as any,
				to_stage: nextStage,
				changed_by: user.id
			});
		}

		return { success: true };
	},

	uploadPhoto: async ({ request, locals, params }) => {
		if (!locals.currentRescue) {
			throw error(403, 'Missing rescue context');
		}
		const form = await request.formData();
		const file = form.get('photo');
		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { photoError: 'Photo file is required.' });
		}

		const { data: lastPhoto } = await locals.supabase
			.from('animal_photos')
			.select('sort_order')
			.eq('animal_id', params.id)
			.order('sort_order', { ascending: false })
			.limit(1)
			.maybeSingle();

		const nextSort = (lastPhoto?.sort_order ?? 0) + 1;

		const uploadResult = await uploadAnimalPhoto({ animalId: params.id, file });

		const { error: insertError } = await locals.supabase.from('animal_photos').insert({
			animal_id: params.id,
			image_url: uploadResult.publicUrl,
			sort_order: nextSort
		});

		if (insertError) {
			console.error(insertError);
			return fail(500, { photoError: 'Unable to save photo.' });
		}

		return { success: true };
	},

	reorderPhoto: async ({ request, locals, params }) => {
		if (!locals.currentRescue) {
			throw error(403, 'Missing rescue context');
		}
		const form = await request.formData();
		const parsed = reorderSchema.safeParse({
			photoId: String(form.get('photoId') ?? ''),
			direction: String(form.get('direction') ?? '')
		});
		if (!parsed.success) {
			return fail(400, { serverError: 'Invalid reorder request.' });
		}

		const { data: photos, error: photoError } = await locals.supabase
			.from('animal_photos')
			.select('id, sort_order')
			.eq('animal_id', params.id)
			.order('sort_order', { ascending: true });

		if (photoError || !photos) {
			console.error(photoError);
			return fail(500, { serverError: 'Unable to reorder photos.' });
		}

		const currentIndex = photos.findIndex((p) => p.id === parsed.data.photoId);
		if (currentIndex === -1) {
			return fail(400, { serverError: 'Photo not found.' });
		}
		const targetIndex = parsed.data.direction === 'up' ? currentIndex - 1 : currentIndex + 1;
		if (targetIndex < 0 || targetIndex >= photos.length) {
			return fail(400, { serverError: 'Cannot move photo further.' });
		}

		const current = photos[currentIndex];
		const target = photos[targetIndex];

		const { error: firstUpdate } = await locals.supabase
			.from('animal_photos')
			.update({ sort_order: target.sort_order })
			.eq('id', current.id);
		const { error: secondUpdate } = await locals.supabase
			.from('animal_photos')
			.update({ sort_order: current.sort_order })
			.eq('id', target.id);

		if (firstUpdate || secondUpdate) {
			console.error(firstUpdate || secondUpdate);
			return fail(500, { serverError: 'Unable to reorder photos.' });
		}

		return { success: true };
	},

	deletePhoto: async ({ request, locals }) => {
		if (!locals.currentRescue) {
			throw error(403, 'Missing rescue context');
		}
		const form = await request.formData();
		const parsed = deletePhotoSchema.safeParse({
			photoId: String(form.get('photoId') ?? ''),
			imageUrl: String(form.get('imageUrl') ?? '')
		});
		if (!parsed.success) {
			return fail(400, { serverError: 'Invalid delete payload.' });
		}

		const { error: deleteError } = await locals.supabase
			.from('animal_photos')
			.delete()
			.eq('id', parsed.data.photoId);

		if (deleteError) {
			console.error(deleteError);
			return fail(500, { serverError: 'Unable to delete photo.' });
		}

		const path = extractStoragePath(parsed.data.imageUrl);
		if (path) {
			try {
				await removeAnimalPhoto(path);
			} catch (err) {
				console.error('Storage cleanup failed', err);
			}
		}

		return { success: true };
	},

	updateInquiry: async ({ request, locals, params }) => {
		if (!locals.currentRescue) {
			throw error(403, 'Missing rescue context');
		}
		const form = await request.formData();
		const parsed = inquiryStatusSchema.safeParse({
			inquiryId: String(form.get('inquiryId') ?? ''),
			status: String(form.get('status') ?? '')
		});
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
		}

		const { error: updateError } = await locals.supabase
			.from('inquiries')
			.update({ status: parsed.data.status })
			.eq('id', parsed.data.inquiryId)
			.eq('animal_id', params.id);

		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to update inquiry.' });
		}

		return { success: true };
	}
};
