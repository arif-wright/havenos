import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const normalizeIds = (value: unknown) =>
	Array.isArray(value) ? value.map((v) => String(v)).filter(Boolean) : [];

const dedupeAndLimit = (ids: string[], limit = 50) => Array.from(new Set(ids)).slice(0, limit);

export const POST: RequestHandler = async ({ request, locals }) => {
	const payload = await request.json().catch(() => ({}));
	const animalIds = dedupeAndLimit(normalizeIds((payload as any).animals));
	const rescueIds = dedupeAndLimit(normalizeIds((payload as any).rescues));

	if (animalIds.length === 0 && rescueIds.length === 0) {
		return json({ animals: [], rescues: [] });
	}

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
		console.error('favorites preview animals', animalResult.error);
	}
	if (rescueResult.error) {
		console.error('favorites preview rescues', rescueResult.error);
	}

	const animals =
		(animalResult.data ?? []).map((row) => ({
			id: row.id,
			name: row.name,
			species: row.species,
			status: row.status,
			thumb:
				row.animal_photos?.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.image_url ??
				'',
			rescue: row.rescue
		})) ?? [];

	const rescues = (rescueResult.data ?? []).map((row) => ({
		id: row.id,
		name: row.name,
		slug: row.slug,
		tagline: row.tagline,
		location_text: row.location_text,
		avatar: row.profile_image_url ?? row.logo_url ?? null,
		verification_status: row.verification_status
	}));

	return json({ animals, rescues });
};
