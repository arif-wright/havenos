import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getServiceSupabase } from '$lib/server/supabaseService';

export const load: PageServerLoad = async ({ params, locals }) => {
	const service = getServiceSupabase();
	const { data: shortlist, error: shortlistError } = await service
		.from('shortlists')
		.select('animal_ids, rescue_ids, created_at')
		.eq('token', params.token)
		.maybeSingle();

	if (shortlistError) {
		console.error('shortlist fetch failed', shortlistError);
		throw error(500, 'Unable to load shortlist');
	}

	if (!shortlist) {
		throw error(404, 'Shortlist not found');
	}

	const animalIds = Array.isArray(shortlist.animal_ids) ? shortlist.animal_ids : [];
	const rescueIds = Array.isArray(shortlist.rescue_ids) ? shortlist.rescue_ids : [];

	const animalPromise =
		animalIds.length > 0
			? locals.supabase
					.from('animals')
					.select(
						'id,name,species,status,animal_photos(image_url, sort_order), rescue:rescue_id(name, slug, location_text, profile_image_url, logo_url)'
					)
					.in('id', animalIds)
					.eq('is_active', true)
					.in('status', ['available', 'hold'])
			: Promise.resolve({ data: [], error: null });

	const rescuePromise =
		rescueIds.length > 0
			? locals.supabase
					.from('public_rescues')
					.select('id, name, slug, location_text, tagline, profile_image_url, logo_url, verification_status')
					.in('id', rescueIds)
			: Promise.resolve({ data: [], error: null });

	const [animalResult, rescueResult] = await Promise.all([animalPromise, rescuePromise]);

	if (animalResult.error) {
		console.error('shortlist animal fetch failed', animalResult.error);
	}
	if (rescueResult.error) {
		console.error('shortlist rescue fetch failed', rescueResult.error);
	}

	return {
		token: params.token,
		created_at: shortlist.created_at,
		animals:
			animalResult.data?.map((row) => ({
				id: row.id,
				name: row.name,
				species: row.species,
				status: row.status,
				thumb:
					row.animal_photos?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.image_url ??
					'',
				rescue: row.rescue
			})) ?? [],
		rescues:
			rescueResult.data?.map((row) => ({
				id: row.id,
				name: row.name,
				slug: row.slug,
				tagline: row.tagline,
				location_text: row.location_text,
				avatar: row.profile_image_url ?? row.logo_url ?? null,
				verification_status: row.verification_status
			})) ?? [],
		counts: {
			requestedAnimals: animalIds.length,
			requestedRescues: rescueIds.length
		}
	};
};
