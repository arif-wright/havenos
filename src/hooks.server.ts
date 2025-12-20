import { createServerClient } from '@supabase/auth-helpers-sveltekit';
import type { Handle } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { getServiceSupabase } from '$lib/server/supabaseService';
import type { Database } from '$lib/supabase/types';
import type { User } from '@supabase/supabase-js';

export const handle: Handle = async ({ event, resolve }) => {
	if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
		throw new Error('Supabase environment variables are not configured');
	}

	event.locals.supabase = createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			get: (key) => event.cookies.get(key),
			set: (key, value, options) => {
				event.cookies.set(key, value, { ...options, path: '/' });
			},
			remove: (key, options) => {
				event.cookies.delete(key, { ...options, path: '/' });
			}
		}
	});

	let cachedUser: User | null | undefined = undefined;

	event.locals.getUser = async () => {
		if (cachedUser !== undefined) {
			return cachedUser;
		}

		const {
			data: { session },
			error: sessionError
		} = await event.locals.supabase.auth.getSession();

		if (sessionError) {
			console.error('Failed to retrieve auth session', sessionError);
			return null;
		}

		if (!session) {
			return null;
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error) {
			console.error('Failed to verify auth user', error);
			return null;
		}

		cachedUser = user ?? null;
		return user;
	};

	// Preload current rescue context for all requests so downstream loads can rely on locals.
	const user = await event.locals.getUser();

	if (!user) {
		event.locals.currentRescue = null;
		event.locals.currentMemberRole = null;
	} else {
		const {
			data: membership,
			error: membershipError
		} = await event.locals.supabase
			.from('rescue_members')
			.select('role, rescue_id')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle();

		let resolvedMembership = membership ?? null;

		if (membershipError) {
			console.error('Handle: membership fetch (user client) failed', {
				userId: user.id,
				error: membershipError
			});
		}

		if (!resolvedMembership) {
			// Service fallback to avoid RLS gaps
			const service = getServiceSupabase();
			const { data: serviceMembership, error: serviceMembershipError } = await service
				.from('rescue_members')
				.select('role, rescue_id')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false })
				.limit(1)
				.maybeSingle();

			if (serviceMembershipError) {
				console.error('Handle: membership fetch (service) failed', {
					userId: user.id,
					error: serviceMembershipError
				});
			} else {
				resolvedMembership = serviceMembership ?? null;
			}
		}

		if (!resolvedMembership) {
			event.locals.currentRescue = null;
			event.locals.currentMemberRole = null;
		} else {
			let resolvedRescue = null;
			const {
				data: rescueData,
				error: rescueError
			} = await event.locals.supabase
				.from('rescues')
				.select('*')
				.eq('id', resolvedMembership.rescue_id)
				.maybeSingle();

			if (rescueError) {
				console.error('Handle: rescue fetch (user client) failed', {
					userId: user.id,
					rescueId: resolvedMembership.rescue_id,
					error: rescueError
				});
			} else {
				resolvedRescue = rescueData ?? null;
			}

			if (!resolvedRescue) {
				const service = getServiceSupabase();
				const { data: serviceRescue, error: serviceRescueError } = await service
					.from('rescues')
					.select('*')
					.eq('id', resolvedMembership.rescue_id)
					.maybeSingle();

				if (serviceRescueError) {
					console.error('Handle: rescue fetch (service) failed', {
						userId: user.id,
						rescueId: resolvedMembership.rescue_id,
						error: serviceRescueError
					});
				} else {
					resolvedRescue = serviceRescue ?? null;
				}
			}

			event.locals.currentRescue = resolvedRescue;
			event.locals.currentMemberRole = resolvedMembership.role ?? null;
		}
	}

	return resolve(event, {
		filterSerializedResponseHeaders: (name) => name === 'content-range'
	});
};
