import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/supabase/types';

let serviceClient: SupabaseClient<Database> | null = null;

export const getServiceSupabase = (): SupabaseClient<Database> => {
	if (!PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
		throw new Error('Missing Supabase service role configuration');
	}

	if (!serviceClient) {
		serviceClient = createClient<Database>(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});
	}

	return serviceClient;
};
