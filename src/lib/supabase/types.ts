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
					mission_statement: string | null;
					adoption_process: string | null;
					response_time_text: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					slug: string;
					contact_email: string;
					mission_statement?: string | null;
					adoption_process?: string | null;
					response_time_text?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					slug?: string;
					contact_email?: string;
					mission_statement?: string | null;
					adoption_process?: string | null;
					response_time_text?: string | null;
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
			rescue_members: {
				Row: {
					id: string;
					rescue_id: string;
					user_id: string;
					role: 'owner' | 'admin' | 'staff';
					created_at: string;
				};
				Insert: {
					id?: string;
					rescue_id: string;
					user_id: string;
					role?: 'owner' | 'admin' | 'staff';
					created_at?: string;
				};
				Update: {
					id?: string;
					rescue_id?: string;
					user_id?: string;
					role?: 'owner' | 'admin' | 'staff';
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'rescue_members_rescue_id_fkey';
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
					status: 'new' | 'contacted' | 'meet_greet' | 'application' | 'approved' | 'adopted' | 'closed';
					first_responded_at: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					animal_id: string;
					rescue_id?: string;
					adopter_name: string;
					adopter_email: string;
					message?: string | null;
					status?: 'new' | 'contacted' | 'meet_greet' | 'application' | 'approved' | 'adopted' | 'closed';
					first_responded_at?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					animal_id?: string;
					rescue_id?: string;
					adopter_name?: string;
					adopter_email?: string;
					message?: string | null;
					status?: 'new' | 'contacted' | 'meet_greet' | 'application' | 'approved' | 'adopted' | 'closed';
					first_responded_at?: string | null;
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
			inquiry_status_history: {
				Row: {
					id: string;
					inquiry_id: string;
					from_status: string | null;
					to_status: string;
					changed_by: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					inquiry_id: string;
					from_status?: string | null;
					to_status: string;
					changed_by: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					inquiry_id?: string;
					from_status?: string | null;
					to_status?: string;
					changed_by?: string;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'inquiry_status_history_inquiry_id_fkey';
						columns: ['inquiry_id'];
						referencedRelation: 'inquiries';
						referencedColumns: ['id'];
					}
				];
			};
			inquiry_notes: {
				Row: {
					id: string;
					inquiry_id: string;
					user_id: string;
					body: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					inquiry_id: string;
					user_id: string;
					body: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					inquiry_id?: string;
					user_id?: string;
					body?: string;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'inquiry_notes_inquiry_id_fkey';
						columns: ['inquiry_id'];
						referencedRelation: 'inquiries';
						referencedColumns: ['id'];
					}
				];
			};
			email_logs: {
				Row: {
					id: string;
					rescue_id: string;
					inquiry_id: string | null;
					to_email: string;
					subject: string;
					status: 'sent' | 'failed';
					error_message: string | null;
					send_type: 'system' | 'template' | 'follow_up' | 'invite' | 'other' | null;
					template_id: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					rescue_id: string;
					inquiry_id?: string | null;
					to_email: string;
					subject: string;
					status: 'sent' | 'failed';
					error_message?: string | null;
					send_type?: 'system' | 'template' | 'follow_up' | 'invite' | 'other' | null;
					template_id?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					rescue_id?: string;
					inquiry_id?: string | null;
					to_email?: string;
					subject?: string;
					status?: 'sent' | 'failed';
					error_message?: string | null;
					send_type?: 'system' | 'template' | 'follow_up' | 'invite' | 'other' | null;
					template_id?: string | null;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'email_logs_inquiry_id_fkey';
						columns: ['inquiry_id'];
						referencedRelation: 'inquiries';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'email_logs_rescue_id_fkey';
						columns: ['rescue_id'];
						referencedRelation: 'rescues';
						referencedColumns: ['id'];
					}
				];
			};
			rescue_invitations: {
				Row: {
					id: string;
					rescue_id: string;
					email: string;
					role: 'owner' | 'admin' | 'staff';
					token: string;
					created_by: string;
					created_at: string;
					expires_at: string;
					accepted_at: string | null;
				};
				Insert: {
					id?: string;
					rescue_id: string;
					email: string;
					role: 'owner' | 'admin' | 'staff';
					token: string;
					created_by: string;
					created_at?: string;
					expires_at?: string;
					accepted_at?: string | null;
				};
				Update: {
					id?: string;
					rescue_id?: string;
					email?: string;
					role?: 'owner' | 'admin' | 'staff';
					token?: string;
					created_by?: string;
					created_at?: string;
					expires_at?: string;
					accepted_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'rescue_invitations_rescue_id_fkey';
						columns: ['rescue_id'];
						referencedRelation: 'rescues';
						referencedColumns: ['id'];
					}
				];
			};
			saved_reply_templates: {
				Row: {
					id: string;
					rescue_id: string;
					name: string;
					subject: string;
					body: string;
					created_by: string;
					updated_at: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					rescue_id: string;
					name: string;
					subject: string;
					body: string;
					created_by: string;
					updated_at?: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					rescue_id?: string;
					name?: string;
					subject?: string;
					body?: string;
					created_by?: string;
					updated_at?: string;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'saved_reply_templates_rescue_id_fkey';
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
