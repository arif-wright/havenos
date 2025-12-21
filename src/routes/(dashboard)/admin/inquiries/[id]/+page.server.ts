import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { inquiryNoteSchema, inquiryStatusSchema } from '$lib/validation';
import { addInquiryNote, getInquiryDetail, logInquiryStatusChange } from '$lib/server/inquiries';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = await locals.getUser();
	if (!user) {
		throw redirect(303, '/admin/login');
	}

	const rescue = locals.currentRescue;
	if (!rescue) {
		throw redirect(303, '/onboarding');
	}

	const { data, error: inquiryError } = await getInquiryDetail(locals.supabase, params.id);
	if (inquiryError) {
		console.error(inquiryError);
		throw error(500, 'Unable to load inquiry');
	}

	if (!data || data.rescue_id !== rescue.id) {
		throw error(404, 'Inquiry not found');
	}

	return {
		inquiry: {
			...data,
			isStale: data.status === 'new' && new Date(data.created_at).getTime() <= Date.now() - 48 * 60 * 60 * 1000
		},
		statusOptions: [
			{ value: 'new', label: 'New' },
			{ value: 'contacted', label: 'Contacted' },
			{ value: 'meet_greet', label: 'Meet & Greet' },
			{ value: 'application', label: 'Application' },
			{ value: 'approved', label: 'Approved' },
			{ value: 'adopted', label: 'Adopted' },
			{ value: 'closed', label: 'Closed' }
		]
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, locals, params }) => {
		const user = await locals.getUser();
		if (!user) {
			return fail(403, { serverError: 'Not authenticated' });
		}

		const form = await request.formData();
		const payload = {
			inquiryId: params.id,
			status: String(form.get('status') ?? '')
		};

		const parsed = inquiryStatusSchema.safeParse(payload);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
		}

		const { data: existing, error: fetchError } = await locals.supabase
			.from('inquiries')
			.select('status, first_responded_at')
			.eq('id', params.id)
			.maybeSingle();

		if (fetchError || !existing) {
			console.error(fetchError);
			return fail(404, { serverError: 'Inquiry not found.' });
		}

		const shouldSetFirstResponse =
			existing.status === 'new' && parsed.data.status !== 'new' && !existing.first_responded_at;

		const { error: updateError } = await locals.supabase
			.from('inquiries')
			.update({
				status: parsed.data.status,
				first_responded_at: shouldSetFirstResponse ? new Date().toISOString() : existing.first_responded_at
			})
			.eq('id', params.id);
		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to update inquiry.' });
		}

		await logInquiryStatusChange(
			locals.supabase,
			params.id,
			(existing.status as any) ?? null,
			parsed.data.status,
			user.id
		);

		return { success: true };
	},
	addNote: async ({ request, locals, params }) => {
		const user = await locals.getUser();
		if (!user) {
			return fail(403, { serverError: 'Not authenticated' });
		}

		const form = await request.formData();
		const payload = {
			inquiryId: params.id,
			body: String(form.get('body') ?? '')
		};

		const parsed = inquiryNoteSchema.safeParse(payload);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
		}

		const { error: insertError } = await addInquiryNote(locals.supabase, params.id, user.id, parsed.data.body);
		if (insertError) {
			console.error(insertError);
			return fail(500, { serverError: 'Unable to add note.' });
		}

		return { success: true };
	}
};
