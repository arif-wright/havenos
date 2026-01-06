import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables } from '$lib/supabase/types';

type DbClient = SupabaseClient<Database>;

const animalQuery = `
	id,
	rescue_id,
	name,
	species,
	breed,
	age,
	sex,
	description,
	status,
	tags,
	is_active,
	created_at,
	updated_at,
	animal_photos(id, image_url, sort_order)
`;

export const listAnimalsForRescue = async (supabase: DbClient, rescueId: string) => {
	return supabase
		.from('animals')
		.select(animalQuery)
		.eq('rescue_id', rescueId)
		.order('created_at', { ascending: false })
		.order('sort_order', { referencedTable: 'animal_photos', ascending: true });
};

export const getAnimalForRescue = async (supabase: DbClient, animalId: string) => {
	return supabase
		.from('animals')
		.select(`${animalQuery}, inquiries(id, adopter_name, adopter_email, status, message, created_at)`)
		.eq('id', animalId)
		.order('sort_order', { referencedTable: 'animal_photos', ascending: true })
		.maybeSingle();
};

export const getPublicRescueBySlug = async (supabase: DbClient, slug: string) => {
	return supabase.from('public_rescues').select('*').eq('slug', slug).maybeSingle();
};

type PublicAnimalFilters = {
	species?: string;
	status?: Tables['animals']['Row']['status'];
};

export const listPublicAnimals = async (
	supabase: DbClient,
	rescueId: string,
	filters: PublicAnimalFilters,
	options?: { page?: number; pageSize?: number }
) => {
	const pageSize = options?.pageSize ?? 9;
	const page = Math.max(1, options?.page ?? 1);
	const offset = (page - 1) * pageSize;
	let query = supabase
		.from('animals')
		.select('*, animal_photos(*)', { count: 'exact' })
		.eq('rescue_id', rescueId)
		.eq('is_active', true)
		.order('status', { ascending: true })
		.order('created_at', { ascending: false })
		.order('sort_order', { referencedTable: 'animal_photos', ascending: true });

	if (filters.species) {
		query = query.ilike('species', filters.species);
	}
	if (filters.status) {
		query = query.eq('status', filters.status);
	}

	return query.range(offset, offset + pageSize - 1);
};

export const getPublicAnimalById = async (supabase: DbClient, animalId: string) => {
	return supabase
		.from('animals')
		.select('*, rescues(*), animal_photos(*)')
		.eq('id', animalId)
		.eq('is_active', true)
		.order('sort_order', { referencedTable: 'animal_photos', ascending: true })
		.maybeSingle();
};
