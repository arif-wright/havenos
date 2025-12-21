import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '$lib/supabase/types';

type DbClient = SupabaseClient<Database>;

export const listTemplates = async (supabase: DbClient, rescueId: string) => {
	return supabase.from('saved_reply_templates').select('*').eq('rescue_id', rescueId).order('updated_at', {
		ascending: false
	});
};

export const createTemplate = async (
	supabase: DbClient,
	rescueId: string,
	userId: string,
	payload: Pick<Tables['saved_reply_templates']['Insert'], 'name' | 'subject' | 'body'>
) => {
	return supabase
		.from('saved_reply_templates')
		.insert({
			rescue_id: rescueId,
			created_by: userId,
			name: payload.name,
			subject: payload.subject,
			body: payload.body
		})
		.select('*')
		.single();
};

export const updateTemplate = async (
	supabase: DbClient,
	templateId: string,
	rescueId: string,
	payload: Partial<Pick<Tables['saved_reply_templates']['Update'], 'name' | 'subject' | 'body'>>
) => {
	return supabase
		.from('saved_reply_templates')
		.update({ ...payload, updated_at: new Date().toISOString() })
		.eq('id', templateId)
		.eq('rescue_id', rescueId);
};

export const deleteTemplate = async (supabase: DbClient, templateId: string, rescueId: string) => {
	return supabase.from('saved_reply_templates').delete().eq('id', templateId).eq('rescue_id', rescueId);
};
