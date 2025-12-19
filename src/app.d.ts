import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { Database, Tables } from '$lib/supabase/types';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			getUser: () => Promise<User | null>;
			currentRescue?: Tables['rescues']['Row'] | null;
			currentMemberRole?: 'owner' | 'admin' | 'staff' | null;
		}
		interface PageData {
			user: User | null;
			currentRescue?: Tables['rescues']['Row'] | null;
			currentMemberRole?: 'owner' | 'admin' | 'staff' | null;
			flash?: {
				type: 'success' | 'error';
				message: string;
			} | null;
		}
	}
}

export {};
