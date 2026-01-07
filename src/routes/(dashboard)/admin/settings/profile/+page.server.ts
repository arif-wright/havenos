import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const BUCKET = 'public-assets';

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

	const { data: profile, error } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.maybeSingle();

	if (error) {
		console.error('profile load error', error);
	}

	return {
		profile: profile ?? null,
		userEmail: user.email
	};
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user) {
			return fail(403, { serverError: 'Not authorized' });
		}

		const form = await request.formData();
		const display_name = String(form.get('display_name') ?? '').trim();
		const title = String(form.get('title') ?? '').trim() || null;
		const phone = String(form.get('phone') ?? '').trim() || null;

		if (!display_name) {
			return fail(400, { errors: { display_name: ['Display name is required'] } });
		}

		const { error } = await locals.supabase
			.from('profiles')
			.upsert({ id: user.id, display_name, title, phone, email: user.email ?? null });

		if (error) {
			console.error('profile save error', error);
			return fail(500, { serverError: 'Unable to save profile' });
		}

		return { success: true };
	},
	uploadAvatar: async ({ request, locals }) => {
		const user = await locals.getUser();
		if (!user) return fail(403, { serverError: 'Not authorized' });
		const form = await request.formData();
		const file = form.get('avatar') as File;
		if (!file || file.size === 0) return fail(400, { serverError: 'No file provided' });
		const path = `${user.id}/avatar-${Date.now()}`;
		const { error: uploadError, data } = await locals.supabase.storage
			.from(BUCKET)
			.upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type || 'image/*' });
		if (uploadError) {
			console.error(uploadError);
			return fail(500, { serverError: 'Upload failed' });
		}
		const { data: urlData } = locals.supabase.storage.from(BUCKET).getPublicUrl(data.path);
		const { error: updateError } = await locals.supabase
			.from('profiles')
			.upsert({ id: user.id, display_name: user.email?.split('@')[0] ?? 'Member', avatar_url: urlData.publicUrl });
		if (updateError) {
			console.error(updateError);
			return fail(500, { serverError: 'Unable to update avatar' });
		}
		return { success: true };
	},
	removeAvatar: async ({ locals }) => {
		const user = await locals.getUser();
		if (!user) return fail(403, { serverError: 'Not authorized' });
		const { data: profile } = await locals.supabase.from('profiles').select('avatar_url').eq('id', user.id).maybeSingle();
		const path = extractStoragePath(profile?.avatar_url ?? null);
		if (path) {
			await locals.supabase.storage.from(BUCKET).remove([path]);
		}
		await locals.supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
		return { success: true };
	}
};
