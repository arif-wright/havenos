import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { inquiryStatusSchema, inquiryNoteSchema } from '$lib/validation';
import { logInquiryStatusChange, addInquiryNote } from '$lib/server/inquiries';

export const load: PageServerLoad = async ({ locals, url }) => {
	const rescue = locals.currentRescue;
	if (!rescue) {
		throw error(403, 'Missing rescue');
	}

	const statusFilter = url.searchParams.get('status') || '';
	const daysFilter = Number(url.searchParams.get('days') || '');
	const staleFilter = url.searchParams.get('stale') === '1';

	const { data, error: inquiryError } = await locals.supabase
		.from('inquiries')
		.select('id, adopter_name, adopter_email, message, status, created_at, first_responded_at, animals(id, name)')
		.eq('rescue_id', rescue.id)
		.order('created_at', { ascending: false });

	if (inquiryError) {
		console.error(inquiryError);
		throw error(500, 'Unable to load inquiries');
	}

	const now = Date.now();
	const recentCutoff = now - 7 * 24 * 60 * 60 * 1000;
	const staleCutoff = now - 48 * 60 * 60 * 1000;

	const decorated =
		data?.map((inq) => ({
			...inq,
			isStale: inq.status === 'new' && new Date(inq.created_at).getTime() <= staleCutoff
		})) ?? [];

	let filtered = decorated;
	if (statusFilter) {
		filtered = filtered.filter((inq) => inq.status === statusFilter);
	}
	if (!Number.isNaN(daysFilter) && daysFilter > 0) {
		const cutoff = now - daysFilter * 24 * 60 * 60 * 1000;
		filtered = filtered.filter((inq) => new Date(inq.created_at).getTime() >= cutoff);
	}
	if (staleFilter) {
		filtered = filtered.filter((inq) => inq.isStale);
	}

	const newInquiries = decorated.filter((inq) => new Date(inq.created_at).getTime() >= recentCutoff);
	const noResponse = data?.filter(
		(inq) => inq.status === 'new' && new Date(inq.created_at).getTime() <= staleCutoff
	) ?? [];

	const { data: animals } = await locals.supabase
		.from('animals')
		.select('id, name, status, inquiries(count)')
		.eq('rescue_id', rescue.id)
		.eq('is_active', true);

	const animalsNoInquiries =
		animals?.filter((animal) => Array.isArray(animal.inquiries) && animal.inquiries[0]?.count === 0) ?? [];

	return {
		inquiries: decorated,
		filteredInquiries: filtered,
		focus: url.searchParams.get('focus'),
		slices: {
			newInquiries,
			noResponse,
			animalsNoInquiries
		},
		staleCount: decorated.filter((inq) => inq.isStale).length,
		appliedFilters: {
			status: statusFilter,
			days: !Number.isNaN(daysFilter) && daysFilter > 0 ? daysFilter : null,
			stale: staleFilter
		}
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

		const user = await locals.getUser();
		if (!user) {
			return fail(403, { serverError: 'Not authenticated' });
		}

		const { data: existing, error: fetchError } = await locals.supabase
			.from('inquiries')
			.select('status, first_responded_at')
			.eq('id', parsed.data.inquiryId)
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
			.eq('id', parsed.data.inquiryId);

		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to update inquiry.' });
		}

		await logInquiryStatusChange(
			locals.supabase,
			parsed.data.inquiryId,
			(existing.status as any) ?? null,
			parsed.data.status,
			user.id
		);

		return { success: true };
	},

	addNote: async ({ request, locals }) => {
		const form = await request.formData();
		const payload = {
			inquiryId: String(form.get('inquiryId') ?? ''),
			body: String(form.get('body') ?? '')
		};

		const parsed = inquiryNoteSchema.safeParse(payload);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors });
		}

		const user = await locals.getUser();
		if (!user) {
			return fail(403, { serverError: 'Not authenticated' });
		}

		const { error: insertError } = await addInquiryNote(
			locals.supabase,
			parsed.data.inquiryId,
			user.id,
			parsed.data.body
		);

		if (insertError) {
			console.error(insertError);
			return fail(500, { serverError: 'Unable to add note.' });
		}

		return { success: true };
	}
};
