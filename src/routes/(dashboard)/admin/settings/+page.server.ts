import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const responseTimeLabels: Record<string, string> = {
	same_day: 'Same day',
	'24_48': '24–48 hours',
	'3_5': '3–5 days',
	'1w_plus': '1+ week'
};

const BUCKET = 'rescue-media';

const extractStoragePath = (url: string | null | undefined) => {
	if (!url) return null;
	const marker = `/object/public/${BUCKET}/`;
	const idx = url.indexOf(marker);
	if (idx === -1) return null;
	return url.slice(idx + marker.length);
};

export const load: PageServerLoad = async ({ locals }) => {
	const rescue = locals.currentRescue;
	if (!rescue) {
		throw redirect(303, '/onboarding');
	}

	// Always fetch fresh copy to avoid stale locals and show latest saved values
	const { data: freshRescue, error } = await locals.supabase.from('rescues').select('*').eq('id', rescue.id).maybeSingle();
	if (error) {
		console.error('settings load rescue refresh error', error);
	}

	return {
		currentRescue: freshRescue ?? rescue
	};
};

export const actions: Actions = {
	updateRescue: async ({ request, locals }) => {
		const rescue = locals.currentRescue;
		if (!rescue) {
			return fail(403, { serverError: 'Missing rescue' });
		}
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const contact_email = String(form.get('contact_email') ?? '').trim();
		const mission_statement = String(form.get('mission_statement') ?? '').trim() || null;
		const adoption_process = String(form.get('adoption_process') ?? '').trim() || null;
		const tagline = String(form.get('tagline') ?? '').trim() || null;
		const location_text = String(form.get('location_text') ?? '').trim() || null;
		const website_url = String(form.get('website_url') ?? '').trim() || null;
		const facebook_url = String(form.get('facebook_url') ?? '').trim() || null;
		const instagram_url = String(form.get('instagram_url') ?? '').trim() || null;
		const donation_url = String(form.get('donation_url') ?? '').trim() || null;
		const slugInput = String(form.get('slug') ?? '').trim().toLowerCase();
		const response_time_enum = String(form.get('response_time_enum') ?? '').trim() || null;
		const is_public = form.get('is_public') === 'on';

		if (!name || !contact_email) {
			return fail(400, { serverError: 'Name and contact email are required.' });
		}

		const slug = slugInput || rescue.slug || '';

		if (slug && !/^[a-z0-9-]{3,50}$/.test(slug)) {
			return fail(400, { serverError: 'Slug must be 3-50 chars, lowercase letters, numbers, and hyphens only.' });
		}

		if (response_time_enum && !Object.keys(responseTimeLabels).includes(response_time_enum)) {
			return fail(400, { serverError: 'Invalid response time.' });
		}

		const adoptionSteps = (form.getAll('adoption_steps[]') as string[])
			.map((s) => s.trim())
			.filter(Boolean);

		// Ensure slug uniqueness if provided
		if (slug) {
			const { data: existing, error: slugError } = await locals.supabase
				.from('rescues')
				.select('id')
				.eq('slug', slug)
				.neq('id', rescue.id)
				.limit(1)
				.maybeSingle();
			if (slugError) {
				console.error(slugError);
				return fail(500, { serverError: 'Slug check failed.' });
			}
			if (existing) {
				return fail(400, { serverError: 'Slug is already taken.' });
			}
		}

		const { error: updateError } = await locals.supabase
			.from('rescues')
			.update({
				name,
				contact_email,
				mission_statement,
				adoption_process,
				tagline,
				location_text,
				website_url,
				facebook_url,
				instagram_url,
				donation_url,
				slug,
				response_time_enum,
				response_time_text: response_time_enum ? responseTimeLabels[response_time_enum] : null,
				adoption_steps: adoptionSteps.length ? adoptionSteps : null,
				is_public
			})
			.eq('id', rescue.id);

		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to update rescue profile.' });
		}

		return { success: true };
	},
	uploadLogo: async ({ request, locals }) => {
		const rescue = locals.currentRescue;
		if (!rescue) return fail(403, { serverError: 'Missing rescue' });
		const form = await request.formData();
		const file = form.get('logo') as File;
		if (!file || file.size === 0) return fail(400, { serverError: 'No file provided' });
		const path = `${rescue.id}/logo-${Date.now()}`;
		const { error: uploadError, data } = await locals.supabase.storage
			.from(BUCKET)
			.upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type || 'image/*' });
		if (uploadError) {
			console.error(uploadError);
			return fail(500, { serverError: 'Upload failed' });
		}
		const { data: urlData } = locals.supabase.storage.from(BUCKET).getPublicUrl(data.path);
		await locals.supabase.from('rescues').update({ logo_url: urlData.publicUrl }).eq('id', rescue.id);
		return { success: true };
	},
	removeLogo: async ({ locals }) => {
		const rescue = locals.currentRescue;
		if (!rescue) return fail(403, { serverError: 'Missing rescue' });
		const path = extractStoragePath(rescue.logo_url);
		if (path) {
			await locals.supabase.storage.from(BUCKET).remove([path]);
		}
		await locals.supabase.from('rescues').update({ logo_url: null }).eq('id', rescue.id);
		return { success: true };
	},
	uploadCover: async ({ request, locals }) => {
		const rescue = locals.currentRescue;
		if (!rescue) return fail(403, { serverError: 'Missing rescue' });
		const form = await request.formData();
		const file = form.get('cover') as File;
		if (!file || file.size === 0) return fail(400, { serverError: 'No file provided' });
		const path = `${rescue.id}/cover-${Date.now()}`;
		const { error: uploadError, data } = await locals.supabase.storage
			.from(BUCKET)
			.upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type || 'image/*' });
		if (uploadError) {
			console.error(uploadError);
			return fail(500, { serverError: 'Upload failed' });
		}
		const { data: urlData } = locals.supabase.storage.from(BUCKET).getPublicUrl(data.path);
		await locals.supabase.from('rescues').update({ cover_url: urlData.publicUrl }).eq('id', rescue.id);
		return { success: true };
	},
	removeCover: async ({ locals }) => {
		const rescue = locals.currentRescue;
		if (!rescue) return fail(403, { serverError: 'Missing rescue' });
		const path = extractStoragePath(rescue.cover_url);
		if (path) {
			await locals.supabase.storage.from(BUCKET).remove([path]);
		}
		await locals.supabase.from('rescues').update({ cover_url: null }).eq('id', rescue.id);
		return { success: true };
	}
};
