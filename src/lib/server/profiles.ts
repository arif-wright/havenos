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

	// Best-effort upsert of current user profile
	const { error } = await supabase.from('profiles').upsert(
		{
			id: user.id,
			display_name: displayFallback,
			email: user.email ?? null
		},
		{ onConflict: 'id' }
	);

	if (error) {
		console.error('profile upsert failed', error);
	}
};
