import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { buildSlug } from '$lib/utils/slug';
import { getServiceSupabase } from '$lib/server/supabaseService';

const onboardingSchema = z.object({
	name: z.string().min(3, 'Rescue name is required'),
	slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and dashes'),
	contact_email: z.string().email('Valid contact email required')
});

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = await locals.getUser();

	if (!user) {
		const redirectTo = encodeURIComponent(url.pathname + url.search);
		throw redirect(303, `/admin/login?redirectTo=${redirectTo}`);
	}

	if (locals.currentRescue) {
		throw redirect(303, '/admin');
	}

	return {
		defaults: {
			contact_email: user.email ?? '',
			slug: buildSlug('rescue')
		}
	};
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const user = await locals.getUser();

		if (!user) {
			const redirectTo = encodeURIComponent(url.pathname + url.search);
			throw redirect(303, `/admin/login?redirectTo=${redirectTo}`);
		}

		if (locals.currentRescue) {
			throw redirect(303, '/admin');
		}

		const formData = await request.formData();
		const raw = {
			name: String(formData.get('name') ?? '').trim(),
			slug: String(formData.get('slug') ?? '').trim() || buildSlug(String(formData.get('name') ?? '')),
			contact_email: String(formData.get('contact_email') ?? '').trim()
		};

		const parsed = onboardingSchema.safeParse({
			...raw,
			slug: buildSlug(raw.slug || raw.name)
		});

		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors, values: raw });
		}

		const payload = parsed.data;

		const serviceClient = getServiceSupabase();
		let slugToUse = payload.slug;
		let rescueRecord = null;
		for (let attempt = 0; attempt < 5; attempt++) {
			const { data, error } = await serviceClient
				.from('rescues')
				.insert({
					name: payload.name,
					owner_user_id: user.id,
					slug: slugToUse,
					contact_email: payload.contact_email
				})
				.select('*')
				.single();

			if (error) {
				if (error.code === '23505') {
					slugToUse = `${payload.slug}-${crypto.randomUUID().slice(0, 4)}`;
					continue;
				}
				console.error('Failed to create rescue', error);
				return fail(500, { serverError: 'Unable to create rescue. Please try again.' });
			}

			rescueRecord = data;
			break;
		}

		if (!rescueRecord) {
			return fail(500, { serverError: 'Unable to create rescue due to slug conflicts.' });
		}

		const { error: memberError } = await serviceClient
			.from('rescue_members')
			.insert({
				rescue_id: rescueRecord.id,
				user_id: user.id,
				role: 'owner'
			});

		if (memberError) {
			console.error('Failed to create membership', memberError);
			return fail(500, { serverError: 'Rescue created, but we could not link your account. Contact support.' });
		}

		locals.currentRescue = rescueRecord;
		locals.currentMemberRole = 'owner';

		throw redirect(303, '/admin');
	}
};
