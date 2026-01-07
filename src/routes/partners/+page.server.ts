import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({});

export const actions: Actions = {
	submit: async ({ request, locals }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const email = String(form.get('email') ?? '').trim();
		const org = String(form.get('org') ?? '').trim() || null;
		const message = String(form.get('message') ?? '').trim() || null;

		if (!name || !email) {
			return fail(400, { serverError: 'Name and email required.' });
		}

		const { error } = await locals.supabase.from('partner_leads').insert({ name, email, org, message });
		if (error) {
			console.error('partner lead insert error', error);
			return fail(500, { serverError: 'Unable to submit lead.' });
		}
		return { success: true };
	}
};
