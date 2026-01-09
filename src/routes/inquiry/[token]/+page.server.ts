import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getServiceSupabase } from '$lib/server/supabaseService';

export const load: PageServerLoad = async ({ params }) => {
	const service = getServiceSupabase();
	const { data, error: inquiryError } = await service
		.from('inquiries')
		.select(
			`id, status, created_at, updated_at, animal_id, rescue_id,
             public_token_expires_at, public_token_revoked_at,
             animals(name, animal_photos(image_url, sort_order)),
             rescues(name, slug, location_text, website_url, instagram_url, facebook_url, contact_email, response_time_text, response_time_enum)`
		)
		.eq('public_token', params.token)
		.maybeSingle();

	if (inquiryError) {
		console.error('public inquiry fetch failed', inquiryError);
		throw error(500, 'Unable to load inquiry status');
	}

	const expired =
		data?.public_token_expires_at && new Date(data.public_token_expires_at).getTime() <= Date.now();
	const revoked = Boolean(data?.public_token_revoked_at);

	if (!data || expired || revoked) {
		throw error(404, 'This link has expired or was revoked.');
	}

	const { data: history } = await service
		.from('inquiry_status_history')
		.select('to_status, created_at')
		.eq('inquiry_id', data.id)
		.order('created_at', { ascending: false })
		.limit(1);

	const lastStatusChange = history?.[0]?.created_at ?? null;

	return {
		token: params.token,
		status: data.status,
		created_at: data.created_at,
		updated_at: lastStatusChange ?? data.updated_at ?? data.created_at,
		expires_at: data.public_token_expires_at,
		animal: {
			id: data.animal_id,
			name: data.animals?.name ?? 'Pet',
			photo:
				data.animals?.animal_photos?.sort(
					(a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
				)[0]?.image_url ?? null
		},
		rescue: {
			id: data.rescue_id,
			name: data.rescues?.name ?? 'Rescue team',
			slug: data.rescues?.slug ?? null,
			location_text: data.rescues?.location_text ?? null,
			website_url: data.rescues?.website_url ?? null,
			instagram_url: data.rescues?.instagram_url ?? null,
			facebook_url: data.rescues?.facebook_url ?? null,
			contact_email: data.rescues?.contact_email ?? null,
			response_time_text: data.rescues?.response_time_text ?? null,
			response_time_enum: data.rescues?.response_time_enum ?? null
		}
	};
};
