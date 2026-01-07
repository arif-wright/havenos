import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { z } from 'zod';
import { buildSlug } from '$lib/utils/slug';
import { getServiceSupabase } from '$lib/server/supabaseService';

const signupSchema = z
	.object({
		name: z.string().min(3, 'Rescue name is required'),
		email: z.string().email('Valid email required'),
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirm_password: z.string().min(8, 'Confirm your password'),
		location: z.string().optional(),
		website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
		instagram_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
		facebook_url: z.string().url('Must be a valid URL').optional().or(z.literal(''))
	})
	.refine((data) => data.password === data.confirm_password, {
		message: 'Passwords must match',
		path: ['confirm_password']
	});

export const load: PageServerLoad = async ({ locals }) => {
	const user = await locals.getUser();
	if (user) {
		throw redirect(303, '/admin');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const raw = {
			name: String(formData.get('name') ?? '').trim(),
			email: String(formData.get('email') ?? '').trim(),
			password: String(formData.get('password') ?? ''),
			confirm_password: String(formData.get('confirm_password') ?? ''),
			location: String(formData.get('location') ?? '').trim(),
			website_url: String(formData.get('website_url') ?? '').trim(),
			instagram_url: String(formData.get('instagram_url') ?? '').trim(),
			facebook_url: String(formData.get('facebook_url') ?? '').trim()
		};

		const parsed = signupSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors, values: raw });
		}

		const { data, error } = await locals.supabase.auth.signUp({
			email: parsed.data.email,
			password: parsed.data.password
		});

		if (error) {
			const message =
				error.code === 'user_already_exists'
					? 'An account already exists with that email.'
					: 'Unable to create your account right now.';
			return fail(400, { serverError: message, values: raw });
		}

		const user = data.user;
		if (!user) {
			return fail(400, { serverError: 'Signup incomplete. Please try again.', values: raw });
		}

		const service = getServiceSupabase();
		const fallbackDisplay = parsed.data.email.split('@')[0] || 'Member';
		await service
			.from('profiles')
			.upsert({
				id: user.id,
				display_name: fallbackDisplay,
				full_name: null,
				email: parsed.data.email
			})
			.select('id')
			.single();

		const slugBase = buildSlug(parsed.data.name);
		let slug = slugBase || 'rescue';
		let rescueRecord: { id: string } | null = null;

		for (let attempt = 0; attempt < 5; attempt++) {
			const { data: rescue, error: rescueError } = await service
				.from('rescues')
				.insert({
					name: parsed.data.name,
					owner_user_id: user.id,
					slug,
					contact_email: parsed.data.email,
					location_text: parsed.data.location || null,
					location: parsed.data.location || null,
					website_url: parsed.data.website_url || null,
					instagram_url: parsed.data.instagram_url || null,
					facebook_url: parsed.data.facebook_url || null,
					plan_tier: 'free',
					is_public: true
				})
				.select('id')
				.single();

			if (rescueError) {
				if (rescueError.code === '23505') {
					slug = `${slugBase}-${crypto.randomUUID().slice(0, 4)}`;
					continue;
				}
				console.error('Signup rescue create failed', rescueError);
				return fail(500, { serverError: 'Unable to create rescue profile.', values: raw });
			}

			rescueRecord = rescue ?? null;
			break;
		}

		if (!rescueRecord) {
			return fail(500, { serverError: 'Unable to create rescue profile.', values: raw });
		}

		const { error: memberError } = await service.from('rescue_members').insert({
			rescue_id: rescueRecord.id,
			user_id: user.id,
			role: 'owner'
		});

		if (memberError) {
			console.error('Signup membership failed', memberError);
			return fail(500, { serverError: 'Account created, but linking failed. Contact support.' });
		}

		locals.currentRescue = { id: rescueRecord.id } as any;
		locals.currentMemberRole = 'owner';

		throw redirect(303, '/admin');
	}
};
