import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const rescue = locals.currentRescue;
	if (!rescue) {
		throw redirect(303, '/onboarding');
	}

	return {
		currentRescue: rescue
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
