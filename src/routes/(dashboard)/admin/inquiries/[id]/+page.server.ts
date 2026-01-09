import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { inquiryNoteSchema, inquiryStatusSchema } from '$lib/validation';
import { addInquiryNote, getInquiryDetail, logInquiryStatusChange } from '$lib/server/inquiries';
import { listTemplates } from '$lib/server/templates';
import { sendTemplateEmail } from '$lib/email/resend';

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

	const { data: templates } = await listTemplates(locals.supabase, rescue.id);

	const duplicateCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
	const { data: dupes } = await locals.supabase
		.from('inquiries')
		.select('id, created_at')
		.eq('animal_id', data.animal_id)
		.eq('adopter_email', data.adopter_email)
		.neq('id', data.id)
		.gte('created_at', duplicateCutoff)
		.order('created_at', { ascending: false });

	return {
		inquiry: {
			...data,
			isStale:
				['new', 'pending'].includes(data.status) &&
				new Date(data.created_at).getTime() <= Date.now() - 48 * 60 * 60 * 1000
		},
		hasDuplicate: (dupes?.length ?? 0) > 0,
		templates: templates ?? [],
		rescue: {
			name: rescue.name,
			response_time_text: rescue.response_time_text
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
	archive: async ({ locals, params }) => {
		const user = await locals.getUser();
		if (!user) return fail(403, { serverError: 'Not authenticated' });

		const { error: updateError } = await locals.supabase
			.from('inquiries')
			.update({ archived_at: new Date().toISOString(), archived_by: user.id })
			.eq('id', params.id);

		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to archive inquiry.' });
		}

		throw redirect(303, '/admin/inquiries');
	},
	restore: async ({ locals, params }) => {
		const user = await locals.getUser();
		if (!user) return fail(403, { serverError: 'Not authenticated' });

		const { error: updateError } = await locals.supabase
			.from('inquiries')
			.update({ archived_at: null, archived_by: null })
			.eq('id', params.id);

		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to restore inquiry.' });
		}

		throw redirect(303, '/admin/inquiries?view=archived');
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
	},
	sendQuickReply: async ({ request, locals, params }) => {
		const user = await locals.getUser();
		const rescue = locals.currentRescue;
		if (!user || !rescue) {
			return fail(403, { serverError: 'Not authorized' });
		}

		const form = await request.formData();
		const to = String(form.get('to') ?? '');
		const subject = String(form.get('subject') ?? '');
		const body = String(form.get('body') ?? '');

		if (!to || !subject || !body) {
			return fail(400, { serverError: 'Missing quick reply fields.' });
		}

		const result = await sendTemplateEmail({
			rescueId: rescue.id,
			inquiryId: params.id,
			to,
			subject,
			body,
			sendType: 'other'
		});

		if (result.errors.length) {
			return fail(500, { serverError: 'Unable to send email.', emailErrors: result.errors });
		}

		return { success: true };
	},
	sendTemplate: async ({ request, locals, params }) => {
		const user = await locals.getUser();
		const rescue = locals.currentRescue;
		if (!user || !rescue) {
			return fail(403, { serverError: 'Not authorized' });
		}

		const form = await request.formData();
		const templateId = String(form.get('templateId') ?? '');
		const to = String(form.get('to') ?? '');
		const sendType = (String(form.get('sendType') ?? 'template') as
			| 'template'
			| 'follow_up'
			| 'other') || 'template';

		if (!templateId || !to) {
			return fail(400, { serverError: 'Template and recipient required.' });
		}

		const { data: template, error: tmplError } = await locals.supabase
			.from('saved_reply_templates')
			.select('*')
			.eq('id', templateId)
			.eq('rescue_id', rescue.id)
			.maybeSingle();

		if (tmplError || !template) {
			console.error(tmplError);
			return fail(404, { serverError: 'Template not found.' });
		}

		const result = await sendTemplateEmail({
			rescueId: rescue.id,
			inquiryId: params.id,
			to,
			subject: template.subject,
			body: template.body,
			templateId: template.id,
			sendType
		});

		if (result.errors.length) {
			return fail(500, { serverError: 'Unable to send email.', emailErrors: result.errors });
		}

		return { success: true };
	}
};
