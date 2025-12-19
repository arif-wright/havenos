import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/supabase/types';

type DbClient = SupabaseClient<Database>;

export const listInquiriesForRescue = async (supabase: DbClient, rescueId: string) => {
	return supabase
		.from('inquiries')
		.select('*, animals(name)')
		.eq('rescue_id', rescueId)
		.order('created_at', { ascending: false });
};

export const updateInquiryStatus = async (
	supabase: DbClient,
	inquiryId: string,
	status: 'new' | 'responded' | 'closed'
) => {
	return supabase.from('inquiries').update({ status }).eq('id', inquiryId);
};
