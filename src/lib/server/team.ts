import { getServiceSupabase } from '$lib/server/supabaseService';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '$lib/supabase/types';
import crypto from 'crypto';

type DbClient = SupabaseClient<Database>;

export const listMembers = async (supabase: DbClient, rescueId: string) => {
	const rpc = await supabase.rpc('get_rescue_members', { p_rescue_id: rescueId });
	if (rpc.error) {
		console.error('listMembers rpc failed, falling back to service query', rpc.error);
		const service = getServiceSupabase();
		return service
			.from('rescue_members')
			.select(
				`
        rescue_id,
        user_id,
        role,
        created_at,
        profiles:profiles(display_name),
        auth_users:auth.users(email)
      `
			)
			.eq('rescue_id', rescueId);
	}
	return rpc;
};

export const listInvitations = async (supabase: DbClient, rescueId: string) => {
	const { data, error } = await supabase
		.from('rescue_pending_invitations')
		.select('*')
		.eq('rescue_id', rescueId)
		.order('created_at', { ascending: false });
	if (error) {
		console.error('listInvitations view failed, falling back to base table', error);
		const service = getServiceSupabase();
		return service
			.from('rescue_invitations')
			.select('*')
			.eq('rescue_id', rescueId)
			.is('accepted_at', null)
			.is('canceled_at', null)
			.order('created_at', { ascending: false });
	}
	return { data, error };
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

export const updateMemberRole = async (supabase: DbClient, rescueId: string, userId: string, role: Tables['rescue_members']['Row']['role']) => {
	return supabase.from('rescue_members').update({ role }).eq('rescue_id', rescueId).eq('user_id', userId);
};

export const removeMember = async (supabase: DbClient, rescueId: string, userId: string) => {
	return supabase.from('rescue_members').delete().eq('rescue_id', rescueId).eq('user_id', userId);
};

export const resendInvitation = async (supabase: DbClient, inviteId: string) => {
	return supabase.from('rescue_invitations').select('*').eq('id', inviteId).maybeSingle();
};

export const cancelInvitation = async (supabase: DbClient, inviteId: string) => {
	return supabase.from('rescue_invitations').update({ canceled_at: new Date().toISOString() }).eq('id', inviteId);
};
