import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { inquiryStatusSchema, inquiryNoteSchema } from '$lib/validation';
import { logInquiryStatusChange, addInquiryNote, logInquiryEvent } from '$lib/server/inquiries';

export const load: PageServerLoad = async ({ locals, url }) => {
	const rescue = locals.currentRescue;
	if (!rescue) {
		throw error(403, 'Missing rescue');
	}

	const view = url.searchParams.get('view') === 'archived' ? 'archived' : 'active';
	const statusFilter = url.searchParams.get('status') || '';
	const daysFilter = Number(url.searchParams.get('days') || '');
	const staleFilter = url.searchParams.get('stale') === '1';
	const animalFilter = url.searchParams.get('animal') || '';
	const assignedFilter = url.searchParams.get('assigned') || '';
	const speciesFilter = url.searchParams.get('species') || '';
	const isArchived = view === 'archived';

	let query = locals.supabase
		.from('inquiries')
		.select(
			'id, adopter_name, adopter_email, message, status, assigned_to, created_at, first_responded_at, archived, archived_at, archived_by, animals(id, name, species)'
		)
		.eq('rescue_id', rescue.id)
		.order(isArchived ? 'archived_at' : 'created_at', { ascending: false });

	if (statusFilter) {
		query = query.eq('status', statusFilter);
	}
	if (assignedFilter === 'me') {
		const user = await locals.getUser();
		if (user) query = query.eq('assigned_to', user.id);
	} else if (assignedFilter === 'unassigned') {
		query = query.is('assigned_to', null);
	} else if (assignedFilter) {
		query = query.eq('assigned_to', assignedFilter);
	}
	if (speciesFilter) {
		query = query.eq('animals.species', speciesFilter);
	}

	const { data, error: inquiryError } = await query;

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
			isStale:
				['new', 'pending'].includes(inq.status) && new Date(inq.created_at).getTime() <= staleCutoff,
			isArchived: !!inq.archived || !!inq.archived_at
		})) ?? [];

	let filtered = decorated;
	filtered = filtered.filter((inq) => inq.isArchived === isArchived);
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
	if (animalFilter) {
		filtered = filtered.filter((inq) => inq.animals?.id === animalFilter);
	}
	if (assignedFilter === 'unassigned') {
		filtered = filtered.filter((inq) => !inq.assigned_to);
	} else if (assignedFilter === 'me') {
		const user = await locals.getUser();
		if (user) filtered = filtered.filter((inq) => inq.assigned_to === user.id);
	} else if (assignedFilter) {
		filtered = filtered.filter((inq) => inq.assigned_to === assignedFilter);
	}
	if (speciesFilter) {
		filtered = filtered.filter((inq) => (inq.animals as any)?.species === speciesFilter);
	}

	const newInquiries = decorated.filter((inq) => new Date(inq.created_at).getTime() >= recentCutoff && !inq.isArchived);
	const noResponse = data?.filter(
		(inq) => ['new', 'pending'].includes(inq.status) && new Date(inq.created_at).getTime() <= staleCutoff
	) ?? [];

        const { data: animals } = await locals.supabase
                .from('animals')
                .select('id, name, status, species, inquiries(count)')
                .eq('rescue_id', rescue.id)
                .eq('is_active', true);

        const { data: members } = await locals.supabase
                .from('rescue_members')
                .select('user_id, role, profiles(display_name, email)')
                .eq('rescue_id', rescue.id);

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
                        stale: staleFilter,
                        animal: animalFilter,
                        assigned: assignedFilter,
                        species: speciesFilter
                },
                view,
                animals: animals ?? [],
                members: members ?? []
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

        await logInquiryEvent(locals.supabase, {
                inquiry_id: parsed.data.inquiryId,
                event_type: 'status_change',
                from_status: (existing.status as any) ?? null,
                to_status: parsed.data.status,
                created_by: user.id
        });

        return { success: true };
},

        updateAssignment: async ({ request, locals }) => {
                const form = await request.formData();
                const inquiryId = String(form.get('inquiryId') ?? '');
                const assignee = String(form.get('assignee') ?? '') || null;

                const user = await locals.getUser();
                if (!user) return fail(403, { serverError: 'Not authenticated' });

                const { data: existing, error: fetchError } = await locals.supabase
                        .from('inquiries')
                        .select('assigned_to')
                        .eq('id', inquiryId)
                        .maybeSingle();

                if (fetchError || !existing) {
                        console.error(fetchError);
                        return fail(404, { serverError: 'Inquiry not found.' });
                }

                const { error: updateError } = await locals.supabase
                        .from('inquiries')
                        .update({ assigned_to: assignee })
                        .eq('id', inquiryId);

                if (updateError) {
                        console.error(updateError);
                        return fail(500, { serverError: 'Unable to assign inquiry.' });
                }

                await logInquiryEvent(locals.supabase, {
                        inquiry_id: inquiryId,
                        event_type: 'assignment_change',
                        from_assigned_to: existing.assigned_to ?? null,
                        to_assigned_to: assignee,
                        created_by: user.id
                });

                return { success: true };
        },

	archive: async ({ request, locals }) => {
		const form = await request.formData();
		const inquiryId = String(form.get('inquiryId') ?? '');
		if (!inquiryId) return fail(400, { serverError: 'Invalid request' });

		const user = await locals.getUser();
		if (!user) {
			return fail(403, { serverError: 'Not authenticated' });
		}

		const { error: updateError } = await locals.supabase
			.from('inquiries')
			.update({ archived: true, archived_at: new Date().toISOString(), archived_by: user.id })
			.eq('id', inquiryId);

		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to archive inquiry.' });
		}

		throw redirect(303, '/admin/inquiries');
	},

	restore: async ({ request, locals }) => {
		const form = await request.formData();
		const inquiryId = String(form.get('inquiryId') ?? '');
		if (!inquiryId) return fail(400, { serverError: 'Invalid request' });

		const user = await locals.getUser();
		if (!user) {
			return fail(403, { serverError: 'Not authenticated' });
		}

		const { error: updateError } = await locals.supabase
			.from('inquiries')
			.update({ archived: false, archived_at: null, archived_by: null })
			.eq('id', inquiryId);

		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to restore inquiry.' });
		}

		throw redirect(303, '/admin/inquiries?view=archived');
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

                await logInquiryEvent(locals.supabase, {
                        inquiry_id: parsed.data.inquiryId,
                        event_type: 'note',
                        note_body: parsed.data.body,
                        created_by: user.id
                });

                return { success: true };
        },

        bulk: async ({ request, locals }) => {
                const user = await locals.getUser();
                if (!user) return fail(403, { serverError: 'Not authenticated' });

                const form = await request.formData();
                const action = String(form.get('bulkAction') ?? '');
                const ids = (form.getAll('ids') as string[]).filter(Boolean);
                const status = String(form.get('status') ?? '');
                const assignee = String(form.get('assignee') ?? '') || null;

                if (!ids.length) return fail(400, { serverError: 'Select at least one inquiry.' });

                if (action === 'archive') {
                        const { error } = await locals.supabase
                                .from('inquiries')
                                .update({ archived: true, archived_at: new Date().toISOString(), archived_by: user.id })
                                .in('id', ids);
                        if (error) return fail(500, { serverError: 'Unable to archive selected.' });
                        throw redirect(303, '/admin/inquiries');
                }

                if (action === 'status' && status) {
                        const { error } = await locals.supabase.from('inquiries').update({ status }).in('id', ids);
                        if (error) return fail(500, { serverError: 'Unable to update status.' });
                        for (const id of ids) {
                                await logInquiryEvent(locals.supabase, {
                                        inquiry_id: id,
                                        event_type: 'status_change',
                                        to_status: status,
                                        created_by: user.id
                                });
                        }
                        return { success: true };
                }

                if (action === 'assign') {
                        const { error } = await locals.supabase.from('inquiries').update({ assigned_to: assignee }).in('id', ids);
                        if (error) return fail(500, { serverError: 'Unable to assign.' });
                        for (const id of ids) {
                                await logInquiryEvent(locals.supabase, {
                                        inquiry_id: id,
                                        event_type: 'assignment_change',
                                        to_assigned_to: assignee,
                                        created_by: user.id
                                });
                        }
                        return { success: true };
                }

                return fail(400, { serverError: 'Unsupported bulk action' });
        }
};
