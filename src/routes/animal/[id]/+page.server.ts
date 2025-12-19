import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getPublicAnimalById } from '$lib/server/animals';
import { publicInquirySchema } from '$lib/validation';
import { dispatchInquiryEmails } from '$lib/email/resend';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data, error: loadError } = await getPublicAnimalById(locals.supabase, params.id);

	if (loadError) {
		console.error(loadError);
		throw error(500, 'Unable to load animal');
	}

	if (!data) {
		throw redirect(302, '/');
	}

	return { animal: data };
};

export const actions: Actions = {
	default: async ({ request, locals, params }) => {
		const form = await request.formData();
		const payload = {
			animalId: params.id,
			adopterName: String(form.get('adopterName') ?? ''),
			adopterEmail: String(form.get('adopterEmail') ?? ''),
			message: String(form.get('message') ?? '')
		};

		const parsed = publicInquirySchema.safeParse(payload);
		if (!parsed.success) {
			return fail(400, {
				errors: parsed.error.flatten().fieldErrors,
				values: payload
			});
		}

		const { data: animal, error: animalError } = await locals.supabase
			.from('animals')
			.select('id, name, rescues(name, contact_email)')
			.eq('id', params.id)
			.eq('is_active', true)
			.maybeSingle();

		if (animalError) {
			console.error(animalError);
			return fail(500, { serverError: 'Unable to submit inquiry right now.' });
		}

		if (!animal) {
			return fail(404, { serverError: 'This animal is no longer available.' });
		}

		const { data: inserted, error: insertError } = await locals.supabase
			.from('inquiries')
			.insert({
				animal_id: animal.id,
				adopter_name: parsed.data.adopterName,
				adopter_email: parsed.data.adopterEmail,
				message: parsed.data.message
			})
			.select('id')
			.single();

		if (insertError || !inserted) {
			console.error(insertError);
			return fail(500, { serverError: 'Unable to submit inquiry right now.' });
		}

		const emailResult = await dispatchInquiryEmails({
			inquiryId: inserted.id,
			animalId: animal.id,
			animalName: animal.name,
			rescueName: animal.rescues?.name ?? 'Your rescue',
			rescueEmail: animal.rescues?.contact_email ?? '',
			adopterName: parsed.data.adopterName,
			adopterEmail: parsed.data.adopterEmail,
			message: parsed.data.message
		});

		return {
			success: true,
			emailErrors: emailResult.errors,
			values: { adopterName: '', adopterEmail: '', message: '' }
		};
	}
};
