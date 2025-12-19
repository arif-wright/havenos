import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';
import type { Database } from '$lib/supabase/types';

let serviceClient: SupabaseClient<Database> | null = null;

export const getServiceSupabase = (): SupabaseClient<Database> => {
	const supabaseUrl = env.PUBLIC_SUPABASE_URL;
	const serviceRole = env.SUPABASE_SERVICE_ROLE_KEY;

	if (!supabaseUrl || !serviceRole) {
		throw new Error('Missing Supabase service role configuration');
	}

	if (!serviceClient) {
		serviceClient = createClient<Database>(supabaseUrl, serviceRole, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});
	}

	return serviceClient;
};
