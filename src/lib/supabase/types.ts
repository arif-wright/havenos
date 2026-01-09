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
					owner_user_id: string;
					name: string;
					slug: string;
					contact_email: string;
					mission_statement: string | null;
					adoption_process: string | null;
					response_time: string | null;
					response_time_text: string | null;
					tagline: string | null;
					location_text: string | null;
					location: string | null;
					website_url: string | null;
					facebook_url: string | null;
					instagram_url: string | null;
					donation_url: string | null;
					logo_url: string | null;
					cover_url: string | null;
					profile_image_url: string | null;
					header_image_url: string | null;
					response_time_enum: string | null;
					adoption_steps: Json | null;
					application_required: boolean;
					home_visit: boolean;
					fenced_yard_required: boolean;
					cats_ok: boolean;
					dogs_ok: boolean;
					kids_ok: boolean;
					adoption_fee_range: string | null;
					is_public: boolean;
					verification_status: 'unverified' | 'verified' | 'verified_501c3';
					verification_submitted_at: string | null;
					verified_at: string | null;
					stripe_customer_id: string | null;
					stripe_subscription_id: string | null;
					plan_tier: 'free' | 'supporter' | 'pro';
					subscription_status: string | null;
					current_period_end: string | null;
					disabled: boolean;
					disabled_at: string | null;
					updated_at: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					owner_user_id: string;
					name: string;
					slug: string;
					contact_email: string;
					mission_statement?: string | null;
					adoption_process?: string | null;
					response_time?: string | null;
					response_time_text?: string | null;
					tagline?: string | null;
					location_text?: string | null;
					location?: string | null;
					website_url?: string | null;
					facebook_url?: string | null;
					instagram_url?: string | null;
					donation_url?: string | null;
					logo_url?: string | null;
					cover_url?: string | null;
					profile_image_url?: string | null;
					header_image_url?: string | null;
					response_time_enum?: string | null;
					adoption_steps?: Json | null;
					application_required?: boolean;
					home_visit?: boolean;
					fenced_yard_required?: boolean;
					cats_ok?: boolean;
					dogs_ok?: boolean;
					kids_ok?: boolean;
					adoption_fee_range?: string | null;
					is_public?: boolean;
					verification_status?: 'unverified' | 'verified' | 'verified_501c3';
					verification_submitted_at?: string | null;
					verified_at?: string | null;
					stripe_customer_id?: string | null;
					stripe_subscription_id?: string | null;
					plan_tier?: 'free' | 'supporter' | 'pro';
					subscription_status?: string | null;
					current_period_end?: string | null;
					disabled?: boolean;
					disabled_at?: string | null;
					updated_at?: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					owner_user_id?: string;
					name?: string;
					slug?: string;
					contact_email?: string;
					mission_statement?: string | null;
					adoption_process?: string | null;
					response_time?: string | null;
					response_time_text?: string | null;
					tagline?: string | null;
					location_text?: string | null;
					location?: string | null;
					website_url?: string | null;
					facebook_url?: string | null;
					instagram_url?: string | null;
					donation_url?: string | null;
					logo_url?: string | null;
					cover_url?: string | null;
					profile_image_url?: string | null;
					header_image_url?: string | null;
					response_time_enum?: string | null;
					adoption_steps?: Json | null;
					application_required?: boolean;
					home_visit?: boolean;
					fenced_yard_required?: boolean;
					cats_ok?: boolean;
					dogs_ok?: boolean;
					kids_ok?: boolean;
					adoption_fee_range?: string | null;
					is_public?: boolean;
					verification_status?: 'unverified' | 'verified' | 'verified_501c3';
					verification_submitted_at?: string | null;
					verified_at?: string | null;
					stripe_customer_id?: string | null;
					stripe_subscription_id?: string | null;
					plan_tier?: 'free' | 'supporter' | 'pro';
					subscription_status?: string | null;
					current_period_end?: string | null;
					disabled?: boolean;
					disabled_at?: string | null;
					updated_at?: string;
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
                                        personality_traits: string[];
                                        energy_level: string | null;
                                        good_with: string[];
                                        training: string | null;
                                        medical_needs: string | null;
                                        ideal_home: string | null;
                                        status: 'available' | 'hold' | 'adopted';
                                        pipeline_stage: 'intake' | 'foster' | 'available' | 'hold' | 'adopted';
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
                                        personality_traits?: string[];
                                        energy_level?: string | null;
                                        good_with?: string[];
                                        training?: string | null;
                                        medical_needs?: string | null;
                                        ideal_home?: string | null;
                                        status?: 'available' | 'hold' | 'adopted';
                                        pipeline_stage?: 'intake' | 'foster' | 'available' | 'hold' | 'adopted';
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
                                        personality_traits?: string[];
                                        energy_level?: string | null;
                                        good_with?: string[];
                                        training?: string | null;
                                        medical_needs?: string | null;
                                        ideal_home?: string | null;
                                        status?: 'available' | 'hold' | 'adopted';
                                        pipeline_stage?: 'intake' | 'foster' | 'available' | 'hold' | 'adopted';
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
                        animal_stage_events: {
                                Row: {
                                        id: string;
                                        animal_id: string;
                                        from_stage: string | null;
                                        to_stage: string;
                                        changed_by: string | null;
                                        created_at: string;
                                };
                                Insert: {
                                        id?: string;
                                        animal_id: string;
                                        from_stage?: string | null;
                                        to_stage: string;
                                        changed_by?: string | null;
                                        created_at?: string;
                                };
                                Update: {
                                        id?: string;
                                        animal_id?: string;
                                        from_stage?: string | null;
                                        to_stage?: string;
                                        changed_by?: string | null;
                                        created_at?: string;
                                };
                                Relationships: [
                                        {
                                                foreignKeyName: 'animal_stage_events_animal_id_fkey';
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
					assigned_to: string | null;
					first_responded_at: string | null;
					archived: boolean;
					archived_at: string | null;
					archived_by: string | null;
					created_at: string;
					public_token: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					animal_id: string;
					rescue_id?: string;
					adopter_name: string;
					adopter_email: string;
					message?: string | null;
					status?: 'new' | 'contacted' | 'meet_greet' | 'application' | 'approved' | 'adopted' | 'closed';
					assigned_to?: string | null;
					first_responded_at?: string | null;
					archived?: boolean;
					archived_at?: string | null;
					archived_by?: string | null;
					created_at?: string;
					public_token?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					animal_id?: string;
					rescue_id?: string;
					adopter_name?: string;
					adopter_email?: string;
					message?: string | null;
					status?: 'new' | 'contacted' | 'meet_greet' | 'application' | 'approved' | 'adopted' | 'closed';
					assigned_to?: string | null;
					first_responded_at?: string | null;
					archived?: boolean;
					archived_at?: string | null;
					archived_by?: string | null;
					created_at?: string;
					public_token?: string;
					updated_at?: string;
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
					author_user_id: string;
					body: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					inquiry_id: string;
					user_id: string;
					author_user_id: string;
					body: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					inquiry_id?: string;
					user_id?: string;
					author_user_id?: string;
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
			verification_requests: {
				Row: {
					id: string;
					rescue_id: string | null;
					submitted_by: string | null;
					website_url: string | null;
					instagram_url: string | null;
					facebook_url: string | null;
					ein: string | null;
					legal_name: string | null;
					notes: string | null;
					status: 'pending' | 'approved' | 'rejected';
					reviewer_user_id: string | null;
					reviewed_at: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					rescue_id?: string | null;
					submitted_by?: string | null;
					website_url?: string | null;
					instagram_url?: string | null;
					facebook_url?: string | null;
					ein?: string | null;
					legal_name?: string | null;
					notes?: string | null;
					status?: 'pending' | 'approved' | 'rejected';
					reviewer_user_id?: string | null;
					reviewed_at?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					rescue_id?: string | null;
					submitted_by?: string | null;
					website_url?: string | null;
					instagram_url?: string | null;
					facebook_url?: string | null;
					ein?: string | null;
					legal_name?: string | null;
					notes?: string | null;
					status?: 'pending' | 'approved' | 'rejected';
					reviewer_user_id?: string | null;
					reviewed_at?: string | null;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'verification_requests_rescue_id_fkey';
						columns: ['rescue_id'];
						referencedRelation: 'rescues';
						referencedColumns: ['id'];
					}
				];
			};
			abuse_reports: {
				Row: {
					id: string;
					reporter_email: string | null;
					reporter_name: string | null;
					type: 'rescue' | 'animal' | 'inquiry';
					rescue_id: string | null;
					animal_id: string | null;
					inquiry_id: string | null;
					message: string;
					status: 'open' | 'triaged' | 'closed';
					created_at: string;
				};
				Insert: {
					id?: string;
					reporter_email?: string | null;
					reporter_name?: string | null;
					type: 'rescue' | 'animal' | 'inquiry';
					rescue_id?: string | null;
					animal_id?: string | null;
					inquiry_id?: string | null;
					message: string;
					status?: 'open' | 'triaged' | 'closed';
					created_at?: string;
				};
				Update: {
					id?: string;
					reporter_email?: string | null;
					reporter_name?: string | null;
					type?: 'rescue' | 'animal' | 'inquiry';
					rescue_id?: string | null;
					animal_id?: string | null;
					inquiry_id?: string | null;
					message?: string;
					status?: 'open' | 'triaged' | 'closed';
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'abuse_reports_rescue_id_fkey';
						columns: ['rescue_id'];
						referencedRelation: 'rescues';
						referencedColumns: ['id'];
					}
				];
			};
			partner_leads: {
				Row: {
					id: string;
					name: string;
					email: string;
					org: string | null;
					message: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					email: string;
					org?: string | null;
					message?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					email?: string;
					org?: string | null;
					message?: string | null;
					created_at?: string;
				};
				Relationships: [];
			};
			support_payments: {
				Row: {
					id: string;
					email: string | null;
					amount_cents: number | null;
					currency: string | null;
					stripe_payment_intent_id: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					email?: string | null;
					amount_cents?: number | null;
					currency?: string | null;
					stripe_payment_intent_id?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					email?: string | null;
					amount_cents?: number | null;
					currency?: string | null;
					stripe_payment_intent_id?: string | null;
					created_at?: string;
				};
				Relationships: [];
			};
			inquiry_events: {
				Row: {
					id: string;
					inquiry_id: string;
					event_type: 'status_change' | 'assignment_change' | 'note' | 'system';
					from_status: string | null;
					to_status: string | null;
					from_assigned_to: string | null;
					to_assigned_to: string | null;
					note_body: string | null;
					created_by: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					inquiry_id: string;
					event_type: 'status_change' | 'assignment_change' | 'note' | 'system';
					from_status?: string | null;
					to_status?: string | null;
					from_assigned_to?: string | null;
					to_assigned_to?: string | null;
					note_body?: string | null;
					created_by?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					inquiry_id?: string;
					event_type?: 'status_change' | 'assignment_change' | 'note' | 'system';
					from_status?: string | null;
					to_status?: string | null;
					from_assigned_to?: string | null;
					to_assigned_to?: string | null;
					note_body?: string | null;
					created_by?: string | null;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'inquiry_events_inquiry_id_fkey';
						columns: ['inquiry_id'];
						referencedRelation: 'inquiries';
						referencedColumns: ['id'];
					}
				];
			};
			shortlists: {
				Row: {
					id: string;
					token: string;
					animal_ids: string[];
					rescue_ids: string[];
					payload: Json | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					token: string;
					animal_ids?: string[];
					rescue_ids?: string[];
					payload?: Json | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					token?: string;
					animal_ids?: string[];
					rescue_ids?: string[];
					payload?: Json | null;
					created_at?: string;
				};
				Relationships: [];
			};
			saved_search_alerts: {
				Row: {
					id: string;
					kind: 'rescue_directory' | 'rescue_animals';
					rescue_id: string | null;
					email: string;
					frequency: 'daily' | 'weekly';
					query_params: Json;
					last_notified_at: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					kind: 'rescue_directory' | 'rescue_animals';
					rescue_id?: string | null;
					email: string;
					frequency: 'daily' | 'weekly';
					query_params: Json;
					last_notified_at?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					kind?: 'rescue_directory' | 'rescue_animals';
					rescue_id?: string | null;
					email?: string;
					frequency?: 'daily' | 'weekly';
					query_params?: Json;
					last_notified_at?: string | null;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'saved_search_alerts_rescue_id_fkey';
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
					canceled_at: string | null;
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
					canceled_at?: string | null;
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
					canceled_at?: string | null;
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
			profiles: {
				Row: {
					id: string;
					display_name: string;
					full_name: string | null;
					email: string | null;
					phone: string | null;
					title: string | null;
					avatar_url: string | null;
					role: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					display_name: string;
					full_name?: string | null;
					email?: string | null;
					phone?: string | null;
					title?: string | null;
					avatar_url?: string | null;
					role?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					display_name?: string;
					full_name?: string | null;
					email?: string | null;
					phone?: string | null;
					title?: string | null;
					avatar_url?: string | null;
					role?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			rescue_pending_invitations: {
				Row: {
					id: string | null;
					rescue_id: string | null;
					email: string | null;
					role: 'owner' | 'admin' | 'staff' | null;
					token: string | null;
					created_by: string | null;
					created_at: string | null;
					expires_at: string | null;
					accepted_at: string | null;
					canceled_at: string | null;
				};
				Relationships: [];
			};
			public_rescues: {
				Row: {
					id: string | null;
					name: string | null;
					slug: string | null;
					tagline: string | null;
					location_text: string | null;
					mission_statement: string | null;
					adoption_process: string | null;
					response_time: string | null;
					response_time_enum: string | null;
					response_time_text: string | null;
					adoption_steps: Json | null;
					website_url: string | null;
					facebook_url: string | null;
					instagram_url: string | null;
					donation_url: string | null;
					logo_url: string | null;
					cover_url: string | null;
					profile_image_url: string | null;
					header_image_url: string | null;
					verification_status: 'unverified' | 'verified' | 'verified_501c3' | null;
					disabled: boolean | null;
					is_public: boolean | null;
					created_at: string | null;
					updated_at: string | null;
					application_required: boolean | null;
					home_visit: boolean | null;
					fenced_yard_required: boolean | null;
					cats_ok: boolean | null;
					dogs_ok: boolean | null;
					kids_ok: boolean | null;
					adoption_fee_range: string | null;
				};
				Relationships: [];
			};
		};
		Functions: {
			get_rescue_members: {
				Args: {
					p_rescue_id: string;
				};
				Returns: {
					rescue_id: string;
					user_id: string;
					role: string;
					joined_at: string;
					display_name: string | null;
					email: string | null;
				}[];
			};
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
