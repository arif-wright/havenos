import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const responseTimeLabels: Record<string, string> = {
	same_day: 'Same day',
	'24_48': '24–48 hours',
	'3_5': '3–5 days',
	'1w_plus': '1+ week'
};

const BUCKET = 'rescue-media';
const PROFILE_BUCKET = 'public-assets';

const extractStoragePath = (url: string | null | undefined) => {
	if (!url) return null;
	const marker = `/object/public/${BUCKET}/`;
	const idx = url.indexOf(marker);
	if (idx === -1) return null;
	return url.slice(idx + marker.length);
};

export const load: PageServerLoad = async ({ locals }) => {
	const rescue = locals.currentRescue;
	const user = await locals.getUser();
	if (!rescue || !user) {
		throw redirect(303, '/onboarding');
	}

	// Always fetch fresh copy to avoid stale locals and show latest saved values
	const { data: freshRescue, error } = await locals.supabase
		.from('rescues')
		.select('*')
		.eq('id', rescue.id)
		.maybeSingle();
	if (error) {
		console.error('settings load rescue refresh error', error);
	}

	const { data: verification, error: verificationError } = await locals.supabase
		.from('verification_requests')
		.select('*')
		.eq('rescue_id', rescue.id)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (verificationError) {
		console.error('settings load verification error', verificationError);
	}

	const { data: profile } = await locals.supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

	return {
		currentRescue: freshRescue ?? rescue,
		verification: verification ?? null,
		profile: profile ?? null,
		userEmail: user.email ?? ''
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
		const location = location_text || null;
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
				location,
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

		return { success: true, action: 'updateRescue' };
	},
	uploadProfile: async ({ request, locals }) => {
		const rescue = locals.currentRescue;
		if (!rescue) return fail(403, { serverError: 'Missing rescue' });
		const form = await request.formData();
		const file = form.get('profile') as File;
		if (!file || file.size === 0) return fail(400, { serverError: 'No file provided' });
		const path = `${rescue.id}/profile-${Date.now()}`;
		const { error: uploadError, data } = await locals.supabase.storage
			.from(BUCKET)
			.upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type || 'image/*' });
		if (uploadError) {
			console.error(uploadError);
			return fail(500, { serverError: 'Upload failed' });
		}
		const { data: urlData } = locals.supabase.storage.from(BUCKET).getPublicUrl(data.path);
		await locals.supabase
			.from('rescues')
			.update({ profile_image_url: urlData.publicUrl, logo_url: urlData.publicUrl })
			.eq('id', rescue.id);
		return { success: true, action: 'uploadProfile' };
	},
	removeProfile: async ({ locals }) => {
		const rescue = locals.currentRescue;
		if (!rescue) return fail(403, { serverError: 'Missing rescue' });
		const path = extractStoragePath(rescue.profile_image_url);
		if (path) {
			await locals.supabase.storage.from(BUCKET).remove([path]);
		}
		await locals.supabase.from('rescues').update({ profile_image_url: null, logo_url: null }).eq('id', rescue.id);
		return { success: true, action: 'removeProfile' };
	},
	uploadHeader: async ({ request, locals }) => {
		const rescue = locals.currentRescue;
		if (!rescue) return fail(403, { serverError: 'Missing rescue' });
		const form = await request.formData();
		const file = form.get('header') as File;
		if (!file || file.size === 0) return fail(400, { serverError: 'No file provided' });
		const path = `${rescue.id}/header-${Date.now()}`;
		const { error: uploadError, data } = await locals.supabase.storage
			.from(BUCKET)
			.upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type || 'image/*' });
		if (uploadError) {
			console.error(uploadError);
			return fail(500, { serverError: 'Upload failed' });
		}
		const { data: urlData } = locals.supabase.storage.from(BUCKET).getPublicUrl(data.path);
		await locals.supabase
			.from('rescues')
			.update({ header_image_url: urlData.publicUrl, cover_url: urlData.publicUrl })
			.eq('id', rescue.id);
		return { success: true, action: 'uploadHeader' };
	},
	removeHeader: async ({ locals }) => {
		const rescue = locals.currentRescue;
		if (!rescue) return fail(403, { serverError: 'Missing rescue' });
		const path = extractStoragePath(rescue.header_image_url);
		if (path) {
			await locals.supabase.storage.from(BUCKET).remove([path]);
		}
		await locals.supabase.from('rescues').update({ header_image_url: null, cover_url: null }).eq('id', rescue.id);
		return { success: true, action: 'removeHeader' };
	},
	submitVerification: async ({ request, locals }) => {
		const rescue = locals.currentRescue;
		const user = await locals.getUser();
		if (!rescue || !user) return fail(403, { serverError: 'Not authorized' });

		const form = await request.formData();
		const website_url = String(form.get('website_url') ?? '').trim() || null;
		const instagram_url = String(form.get('instagram_url') ?? '').trim() || null;
		const facebook_url = String(form.get('facebook_url') ?? '').trim() || null;
		const ein = String(form.get('ein') ?? '').trim() || null;
		const legal_name = String(form.get('legal_name') ?? '').trim() || null;
		const notes = String(form.get('notes') ?? '').trim() || null;

		if (!website_url && !instagram_url && !facebook_url) {
			return fail(400, { serverError: 'Provide at least one website or social link.' });
		}

		const { error } = await locals.supabase.from('verification_requests').insert({
			rescue_id: rescue.id,
			submitted_by: user.id,
			website_url,
			instagram_url,
			facebook_url,
			ein,
			legal_name,
			notes
		});

		if (error) {
			console.error('verification submit error', error);
			return fail(500, { serverError: 'Unable to submit verification request.' });
		}

		await locals.supabase
			.from('rescues')
			.update({ verification_submitted_at: new Date().toISOString() })
			.eq('id', rescue.id);

		return { success: true, verificationSubmitted: true, action: 'submitVerification' };
	},
	saveProfile: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user) return fail(403, { serverError: 'Not authorized' });
		const form = await request.formData();
		const display_name = String(form.get('display_name') ?? '').trim();
		const title = String(form.get('title') ?? '').trim() || null;
		const phone = String(form.get('phone') ?? '').trim() || null;

		if (!display_name) {
			return fail(400, { action: 'saveProfile', errors: { display_name: ['Display name is required'] } });
		}

		const { error } = await locals.supabase
			.from('profiles')
			.upsert({ id: user.id, display_name, title, phone, email: user.email ?? null });

		if (error) {
			console.error('profile save error', error);
			return fail(500, { serverError: 'Unable to save profile', action: 'saveProfile' });
		}

		return { success: true, action: 'saveProfile' };
	},
	uploadAvatar: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user) return fail(403, { serverError: 'Not authorized' });
		const form = await request.formData();
		const file = form.get('avatar') as File;
		if (!file || file.size === 0) return fail(400, { serverError: 'No file provided', action: 'uploadAvatar' });
		const path = `${user.id}/avatar-${Date.now()}`;
		const { error: uploadError, data } = await locals.supabase.storage
			.from(PROFILE_BUCKET)
			.upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type || 'image/*' });
		if (uploadError) {
			console.error(uploadError);
			return fail(500, { serverError: 'Upload failed', action: 'uploadAvatar' });
		}
		const { data: urlData } = locals.supabase.storage.from(PROFILE_BUCKET).getPublicUrl(data.path);
		const { error: updateError } = await locals.supabase
			.from('profiles')
			.upsert({
				id: user.id,
				display_name: user.email?.split('@')[0] ?? 'Member',
				avatar_url: urlData.publicUrl,
				email: user.email ?? null
			});
		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to update avatar', action: 'uploadAvatar' });
		}
		return { success: true, action: 'uploadAvatar' };
	},
	removeAvatar: async ({ locals }) => {
		const user = await locals.getUser();
		if (!user) return fail(403, { serverError: 'Not authorized' });
		const { data: profile } = await locals.supabase.from('profiles').select('avatar_url').eq('id', user.id).maybeSingle();
		const path = (() => {
			if (!profile?.avatar_url) return null;
			const marker = `/object/public/${PROFILE_BUCKET}/`;
			const idx = profile.avatar_url.indexOf(marker);
			if (idx === -1) return null;
			return profile.avatar_url.slice(idx + marker.length);
		})();
		if (path) {
			await locals.supabase.storage.from(PROFILE_BUCKET).remove([path]);
		}
		await locals.supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
		return { success: true, action: 'removeAvatar' };
	},
	changePassword: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user || !user.email) return fail(403, { serverError: 'Not authorized', action: 'changePassword' });
		const form = await request.formData();
		const current_password = String(form.get('current_password') ?? '');
		const new_password = String(form.get('new_password') ?? '');
		const confirm_password = String(form.get('confirm_password') ?? '');

		if (!current_password || !new_password || !confirm_password) {
			return fail(400, { serverError: 'All password fields are required.', action: 'changePassword' });
		}
		if (new_password !== confirm_password) {
			return fail(400, { serverError: 'Passwords do not match.', action: 'changePassword' });
		}
		if (new_password.length < 8) {
			return fail(400, { serverError: 'Password must be at least 8 characters.', action: 'changePassword' });
		}

		const { error: authError } = await locals.supabase.auth.signInWithPassword({
			email: user.email,
			password: current_password
		});
		if (authError) {
			return fail(400, { serverError: 'Current password is incorrect.', action: 'changePassword' });
		}

		const { error: updateError } = await locals.supabase.auth.updateUser({ password: new_password });
		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to update password.', action: 'changePassword' });
		}

		return { success: true, action: 'changePassword' };
	}
};
