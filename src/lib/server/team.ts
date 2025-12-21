import { getServiceSupabase } from '$lib/server/supabaseService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '$lib/supabase/types';
import crypto from 'crypto';

type DbClient = SupabaseClient<Database>;

export const listMembers = async (supabase: DbClient, rescueId: string) => {
	return supabase.from('rescue_members').select('id, user_id, role, created_at').eq('rescue_id', rescueId);
};

export const listInvitations = async (supabase: DbClient, rescueId: string) => {
	return supabase
		.from('rescue_invitations')
		.select('*')
		.eq('rescue_id', rescueId)
		.order('created_at', { ascending: false });
};

export const createInvitation = async (
	supabase: DbClient,
	rescueId: string,
	createdBy: string,
	email: string,
	role: Tables['rescue_members']['Row']['role']
) => {
	const token = crypto.randomUUID();
	return supabase
		.from('rescue_invitations')
		.insert({
			rescue_id: rescueId,
			created_by: createdBy,
			email,
			role,
			token
		})
		.select('*')
		.single();
};

export const acceptInvitation = async (token: string, userId: string) => {
	const service = getServiceSupabase();
	const { data: invite, error } = await service
		.from('rescue_invitations')
		.select('*')
		.eq('token', token)
		.eq('accepted_at', null)
		.gte('expires_at', new Date().toISOString())
		.maybeSingle();

	if (error || !invite) {
		return { error: error ?? new Error('Invite not found or expired') };
	}

	// Upsert membership
	const { error: memberError } = await service
		.from('rescue_members')
		.upsert({
			rescue_id: invite.rescue_id,
			user_id: userId,
			role: invite.role
		});

	if (memberError) {
		return { error: memberError };
	}

	const { error: updateError } = await service
		.from('rescue_invitations')
		.update({ accepted_at: new Date().toISOString() })
		.eq('id', invite.id);

	return { error: updateError, invite };
};
