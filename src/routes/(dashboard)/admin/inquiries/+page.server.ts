import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { inquiryStatusSchema } from '$lib/validation';

export const load: PageServerLoad = async ({ locals, url }) => {
	const rescue = locals.currentRescue;
	if (!rescue) {
		throw error(403, 'Missing rescue');
	}

	const { data, error: inquiryError } = await locals.supabase
		.from('inquiries')
		.select('id, adopter_name, adopter_email, message, status, created_at, animals(id, name)')
		.eq('rescue_id', rescue.id)
		.order('created_at', { ascending: false });

	if (inquiryError) {
		console.error(inquiryError);
		throw error(500, 'Unable to load inquiries');
	}

	return {
		inquiries: data ?? [],
		focus: url.searchParams.get('focus')
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, locals }) => {
		const form = await request.formData();
		const payload = {
			inquiryId: String(form.get('inquiryId') ?? ''),
			status: String(form.get('status') ?? '')
		};

		const parsed = inquiryStatusSchema.safeParse(payload);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
		}

		const { error: updateError } = await locals.supabase
			.from('inquiries')
			.update({ status: parsed.data.status })
			.eq('id', parsed.data.inquiryId);

		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to update inquiry.' });
		}

		return { success: true };
	}
};
