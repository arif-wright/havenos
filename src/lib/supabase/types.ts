export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			rescues: {
				Row: {
					id: string;
					name: string;
					slug: string;
					contact_email: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					slug: string;
					contact_email: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					slug?: string;
					contact_email?: string;
					created_at?: string;
				};
				Relationships: [];
			};
			rescue_admins: {
				Row: {
					id: string;
					rescue_id: string;
					user_id: string;
					role: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					rescue_id: string;
					user_id: string;
					role?: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					rescue_id?: string;
					user_id?: string;
					role?: string;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'rescue_admins_rescue_id_fkey';
						columns: ['rescue_id'];
						referencedRelation: 'rescues';
						referencedColumns: ['id'];
					}
				];
			};
			animals: {
				Row: {
					id: string;
					rescue_id: string;
					name: string;
					species: string;
					breed: string | null;
					age: string | null;
					sex: string | null;
					description: string | null;
					status: 'available' | 'hold' | 'adopted';
					tags: string[];
					is_active: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					rescue_id: string;
					name: string;
					species: string;
					breed?: string | null;
					age?: string | null;
					sex?: string | null;
					description?: string | null;
					status?: 'available' | 'hold' | 'adopted';
					tags?: string[];
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					rescue_id?: string;
					name?: string;
					species?: string;
					breed?: string | null;
					age?: string | null;
					sex?: string | null;
					description?: string | null;
					status?: 'available' | 'hold' | 'adopted';
					tags?: string[];
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'animals_rescue_id_fkey';
						columns: ['rescue_id'];
						referencedRelation: 'rescues';
						referencedColumns: ['id'];
					}
				];
			};
			animal_photos: {
				Row: {
					id: string;
					animal_id: string;
					image_url: string;
					sort_order: number;
				};
				Insert: {
					id?: string;
					animal_id: string;
					image_url: string;
					sort_order?: number;
				};
				Update: {
					id?: string;
					animal_id?: string;
					image_url?: string;
					sort_order?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'animal_photos_animal_id_fkey';
						columns: ['animal_id'];
						referencedRelation: 'animals';
						referencedColumns: ['id'];
					}
				];
			};
			inquiries: {
				Row: {
					id: string;
					animal_id: string;
					rescue_id: string;
					adopter_name: string;
					adopter_email: string;
					message: string | null;
					status: 'new' | 'responded' | 'closed';
					created_at: string;
				};
				Insert: {
					id?: string;
					animal_id: string;
					rescue_id?: string;
					adopter_name: string;
					adopter_email: string;
					message?: string | null;
					status?: 'new' | 'responded' | 'closed';
					created_at?: string;
				};
				Update: {
					id?: string;
					animal_id?: string;
					rescue_id?: string;
					adopter_name?: string;
					adopter_email?: string;
					message?: string | null;
					status?: 'new' | 'responded' | 'closed';
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'inquiries_animal_id_fkey';
						columns: ['animal_id'];
						referencedRelation: 'animals';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'inquiries_rescue_id_fkey';
						columns: ['rescue_id'];
						referencedRelation: 'rescues';
						referencedColumns: ['id'];
					}
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

export type Tables = Database['public']['Tables'];
