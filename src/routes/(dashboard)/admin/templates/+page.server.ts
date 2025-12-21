import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { templateSchema } from '$lib/validation';
import { createTemplate, deleteTemplate, listTemplates, updateTemplate } from '$lib/server/templates';

export const load: PageServerLoad = async ({ locals }) => {
	const rescue = locals.currentRescue;
	if (!rescue) {
		throw redirect(303, '/onboarding');
	}

	const { data: templates, error } = await listTemplates(locals.supabase, rescue.id);
	if (error) {
		console.error(error);
		return { templates: [], error: 'Unable to load templates' };
	}

	return {
		templates: templates ?? [],
		currentMemberRole: locals.currentMemberRole ?? 'staff',
		canManage: ['owner', 'admin'].includes(locals.currentMemberRole ?? 'staff')
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const rescue = locals.currentRescue;
		const user = await locals.getUser();
		if (!rescue || !user) {
			return fail(403, { serverError: 'Not authorized' });
		}

		const form = await request.formData();
		const payload = {
			name: String(form.get('name') ?? ''),
			subject: String(form.get('subject') ?? ''),
			body: String(form.get('body') ?? '')
		};

		const parsed = templateSchema.safeParse(payload);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors, values: payload });
		}

		const { error } = await createTemplate(locals.supabase, rescue.id, user.id, parsed.data);
		if (error) {
			console.error(error);
			return fail(500, { serverError: 'Unable to create template' });
		}
		return { success: true };
	},
	update: async ({ request, locals }) => {
		const rescue = locals.currentRescue;
		if (!rescue) {
			return fail(403, { serverError: 'Not authorized' });
		}

		const form = await request.formData();
		const templateId = String(form.get('templateId') ?? '');
		const payload = {
			name: String(form.get('name') ?? ''),
			subject: String(form.get('subject') ?? ''),
			body: String(form.get('body') ?? '')
		};

		const parsed = templateSchema.safeParse(payload);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors, values: payload, templateId });
		}

		const { error } = await updateTemplate(locals.supabase, templateId, rescue.id, parsed.data);
		if (error) {
			console.error(error);
			return fail(500, { serverError: 'Unable to update template' });
		}
		return { success: true };
	},
	delete: async ({ request, locals }) => {
		const rescue = locals.currentRescue;
		if (!rescue) {
			return fail(403, { serverError: 'Not authorized' });
		}

		const form = await request.formData();
		const templateId = String(form.get('templateId') ?? '');
		const { error } = await deleteTemplate(locals.supabase, templateId, rescue.id);
		if (error) {
			console.error(error);
			return fail(500, { serverError: 'Unable to delete template' });
		}
		return { success: true };
	}
};
