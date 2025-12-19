import type { SupabaseClient, Session } from '@supabase/supabase-js';
import type { Database, Tables } from '$lib/supabase/types';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient<Database>;
			getSession: () => Promise<Session | null>;
			currentRescue?: Tables['rescues']['Row'] | null;
			currentMemberRole?: 'owner' | 'admin' | 'staff' | null;
		}
		interface PageData {
			session: Session | null;
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
