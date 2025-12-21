import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '$lib/supabase/types';

type DbClient = SupabaseClient<Database>;
type InquiryStatus = Tables['inquiries']['Row']['status'];

export const listInquiriesForRescue = async (supabase: DbClient, rescueId: string) => {
	return supabase
		.from('inquiries')
		.select('*, animals(name)')
		.eq('rescue_id', rescueId)
		.order('created_at', { ascending: false });
};

export const getInquiryDetail = async (supabase: DbClient, inquiryId: string) => {
	return supabase
		.from('inquiries')
		.select(
			`id, adopter_name, adopter_email, message, status, created_at, first_responded_at, animal_id, rescue_id, animals(name),
             inquiry_status_history(id, from_status, to_status, created_at, changed_by),
             inquiry_notes(id, body, created_at, user_id),
             email_logs(id, to_email, subject, status, error_message, created_at)`
		)
		.eq('id', inquiryId)
		.maybeSingle();
};

export const logInquiryStatusChange = async (
	supabase: DbClient,
	inquiryId: string,
	fromStatus: InquiryStatus | null,
	toStatus: InquiryStatus,
	userId: string
) => {
	return supabase.from('inquiry_status_history').insert({
		inquiry_id: inquiryId,
		from_status: fromStatus,
		to_status: toStatus,
		changed_by: userId
	});
};

export const updateInquiryStatus = async (
	supabase: DbClient,
	inquiryId: string,
	status: InquiryStatus
) => {
	return supabase.from('inquiries').update({ status }).eq('id', inquiryId);
};

export const addInquiryNote = async (supabase: DbClient, inquiryId: string, userId: string, body: string) => {
	return supabase.from('inquiry_notes').insert({
		inquiry_id: inquiryId,
		user_id: userId,
		body
	});
};
