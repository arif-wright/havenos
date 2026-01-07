import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';

type DbClient = SupabaseClient<Database>;

export const upsertProfileForUser = async (supabase: DbClient, user: User | null) => {
	if (!user) return;

	const displayFallback =
		(user.user_metadata as Record<string, unknown> | null)?.['full_name']?.toString() ??
		user.email?.split('@')[0] ??
		'Member';
	const fullName =
		(user.user_metadata as Record<string, unknown> | null)?.['full_name']?.toString() ?? null;
	const avatarUrl =
		(user.user_metadata as Record<string, unknown> | null)?.['avatar_url']?.toString() ?? null;

	// Insert only if missing to avoid overwriting user-chosen profile fields
	const { data: existing, error: fetchError } = await supabase
		.from('profiles')
		.select('id')
		.eq('id', user.id)
		.maybeSingle();

	if (fetchError) {
		console.error('profile fetch failed', fetchError);
		return;
	}

	if (existing) {
		return;
	}

	const { error: insertError } = await supabase.from('profiles').insert({
		id: user.id,
		display_name: displayFallback,
		full_name: fullName,
		avatar_url: avatarUrl,
		email: user.email ?? null
	});

	if (insertError) {
		console.error('profile insert failed', insertError);
	}
};
