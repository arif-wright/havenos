import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { isAdminEmail } from '$lib/server/admin';
import { getServiceSupabase } from '$lib/server/supabaseService';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await locals.getUser();
	if (!user || !isAdminEmail(user.email)) {
		throw redirect(303, '/admin');
	}

	const service = getServiceSupabase();
	const { data: reports, error: reportError } = await service
		.from('abuse_reports')
		.select('*, rescues(id, name, slug, disabled), animals(name)')
		.order('created_at', { ascending: false })
		.limit(100);

	const { data: verifications, error: verificationError } = await service
		.from('verification_requests')
		.select('*, rescues(name, verification_status)')
		.order('created_at', { ascending: false })
		.limit(100);

	if (reportError) console.error('moderation reports load', reportError);
	if (verificationError) console.error('moderation verification load', verificationError);

	return {
		reports: reports ?? [],
		verifications: verifications ?? []
	};
};

export const actions: Actions = {
	updateReport: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user || !isAdminEmail(user.email)) return fail(403, { serverError: 'Not authorized' });
		const form = await request.formData();
		const reportId = String(form.get('reportId') ?? '');
		const status = String(form.get('status') ?? '');
		const outcome = String(form.get('outcome') ?? 'pending');
		const expiresDays = parseInt(String(form.get('expiresDays') ?? '0'), 10);
		const resolutionNotes = String(form.get('resolutionNotes') ?? '').trim();
		if (
			!reportId ||
			!['open', 'triaged', 'closed'].includes(status) ||
			!['pending', 'dismissed', 'warned', 'hidden', 'suspended'].includes(outcome)
		) {
			return fail(400, { serverError: 'Invalid report update' });
		}
		const service = getServiceSupabase();
		const { data: report, error: loadError } = await service
			.from('abuse_reports')
			.select('id,rescue_id,animal_id,inquiry_id,outcome')
			.eq('id', reportId)
			.maybeSingle();
		if (loadError || !report) {
			console.error('report fetch error', loadError);
			return fail(404, { serverError: 'Report not found' });
		}

		const now = new Date().toISOString();
		const updatePayload: Record<string, unknown> = {
			status,
			outcome: outcome === 'pending' ? null : outcome,
			resolution_notes: resolutionNotes || null,
			resolved_at: outcome === 'pending' ? null : now,
			resolved_by: outcome === 'pending' ? null : user.id
		};

		if (outcome !== 'pending' && status === 'open') {
			updatePayload.status = 'closed';
		}

		const { error } = await service.from('abuse_reports').update(updatePayload).eq('id', reportId);
		if (error) {
			console.error('report update error', error);
			return fail(500, { serverError: 'Unable to update report' });
		}

		const actionableOutcome = ['warned', 'hidden', 'suspended', 'dismissed'].includes(outcome);
		if (actionableOutcome) {
			const actionType =
				outcome === 'warned' ? 'warn' : outcome === 'hidden' ? 'hide' : outcome === 'suspended' ? 'suspend' : 'dismiss';
			const expires_at =
				outcome === 'hidden' || outcome === 'suspended'
					? new Date(Date.now() + Math.max(0, expiresDays || 0) * 24 * 60 * 60 * 1000).toISOString()
					: null;
			const { error: actionError } = await service.from('moderation_actions').insert({
				rescue_id: report.rescue_id,
				animal_id: report.animal_id,
				inquiry_id: report.inquiry_id,
				report_id: reportId,
				action_type: actionType,
				reason: resolutionNotes || outcome,
				details: resolutionNotes || null,
				expires_at,
				created_by: user.id,
				resolved: actionType === 'dismiss'
			});
			if (actionError) {
				console.error('moderation action error', actionError);
				return fail(500, { serverError: 'Unable to record moderation action' });
			}
		}

		return { success: true };
	},
	approveVerification: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user || !isAdminEmail(user.email)) return fail(403, { serverError: 'Not authorized' });
		const form = await request.formData();
		const id = String(form.get('requestId') ?? '');
		const rescueId = String(form.get('rescueId') ?? '');
		const hasEin = form.get('hasEin') === '1';
		if (!id || !rescueId) return fail(400, { serverError: 'Invalid request' });

		const service = getServiceSupabase();
		const status = hasEin ? 'verified_501c3' : 'verified';

		const { error: verError } = await service
			.from('verification_requests')
			.update({ status: 'approved', reviewer_user_id: user.id, reviewed_at: new Date().toISOString() })
			.eq('id', id);
		if (verError) {
			console.error('verification approve error', verError);
			return fail(500, { serverError: 'Unable to update request' });
		}

		const { error: rescueError } = await service
			.from('rescues')
			.update({ verification_status: status, verified_at: new Date().toISOString() })
			.eq('id', rescueId);
		if (rescueError) {
			console.error('verification rescue update error', rescueError);
			return fail(500, { serverError: 'Unable to update rescue status' });
		}
		return { success: true };
	},
	rejectVerification: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user || !isAdminEmail(user.email)) return fail(403, { serverError: 'Not authorized' });
		const form = await request.formData();
		const id = String(form.get('requestId') ?? '');
		if (!id) return fail(400, { serverError: 'Invalid request' });
		const service = getServiceSupabase();
		const { error } = await service
			.from('verification_requests')
			.update({ status: 'rejected', reviewer_user_id: user.id, reviewed_at: new Date().toISOString() })
			.eq('id', id);
		if (error) {
			console.error('verification reject error', error);
			return fail(500, { serverError: 'Unable to reject request' });
		}
		return { success: true };
	},
	disableRescue: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user || !isAdminEmail(user.email)) return fail(403, { serverError: 'Not authorized' });
		const form = await request.formData();
		const rescueId = String(form.get('rescueId') ?? '');
		const disabled = form.get('disabled') === '1';
		if (!rescueId) return fail(400, { serverError: 'Invalid request' });
		const service = getServiceSupabase();
		const { error } = await service
			.from('rescues')
			.update({ disabled, disabled_at: disabled ? new Date().toISOString() : null })
			.eq('id', rescueId);
		if (error) {
			console.error('disable rescue error', error);
			return fail(500, { serverError: 'Unable to update rescue' });
		}
		return { success: true };
	}
};
