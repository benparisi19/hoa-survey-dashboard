export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      people: {
        Row: {
          account_status: string | null
          account_type: string | null
          auth_user_id: string | null
          created_at: string | null
          email: string | null
          email_verified_at: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          is_official_owner: boolean | null
          last_login_at: string | null
          last_name: string
          mailing_address: string | null
          mailing_city: string | null
          mailing_state: string | null
          mailing_zip: string | null
          person_id: string
          phone: string | null
          preferred_contact_method: string | null
          updated_at: string | null
          verification_method: string | null
        }
        Insert: {
          account_status?: string | null
          account_type?: string | null
          auth_user_id?: string | null
          created_at?: string | null
          email?: string | null
          email_verified_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          is_official_owner?: boolean | null
          last_login_at?: string | null
          last_name: string
          mailing_address?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          person_id?: string
          phone?: string | null
          preferred_contact_method?: string | null
          updated_at?: string | null
          verification_method?: string | null
        }
        Update: {
          account_status?: string | null
          account_type?: string | null
          auth_user_id?: string | null
          created_at?: string | null
          email?: string | null
          email_verified_at?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          is_official_owner?: boolean | null
          last_login_at?: string | null
          last_name?: string
          mailing_address?: string | null
          mailing_city?: string | null
          mailing_state?: string | null
          mailing_zip?: string | null
          person_id?: string
          phone?: string | null
          preferred_contact_method?: string | null
          updated_at?: string | null
          verification_method?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string
          architectural_style: string | null
          created_at: string | null
          external_property_id: string | null
          geocoded_at: string | null
          geocoding_accuracy: string | null
          hoa_zone: string
          latitude: number | null
          longitude: number | null
          lot_number: string | null
          lot_size_sqft: number | null
          notes: string | null
          property_id: string
          property_type: string | null
          source: string | null
          special_features: Json | null
          square_footage: number | null
          street_group: string | null
          updated_at: string | null
          year_built: number | null
        }
        Insert: {
          address: string
          architectural_style?: string | null
          created_at?: string | null
          external_property_id?: string | null
          geocoded_at?: string | null
          geocoding_accuracy?: string | null
          hoa_zone: string
          latitude?: number | null
          longitude?: number | null
          lot_number?: string | null
          lot_size_sqft?: number | null
          notes?: string | null
          property_id?: string
          property_type?: string | null
          source?: string | null
          special_features?: Json | null
          square_footage?: number | null
          street_group?: string | null
          updated_at?: string | null
          year_built?: number | null
        }
        Update: {
          address?: string
          architectural_style?: string | null
          created_at?: string | null
          external_property_id?: string | null
          geocoded_at?: string | null
          geocoding_accuracy?: string | null
          hoa_zone?: string
          latitude?: number | null
          longitude?: number | null
          lot_number?: string | null
          lot_size_sqft?: number | null
          notes?: string | null
          property_id?: string
          property_type?: string | null
          source?: string | null
          special_features?: Json | null
          square_footage?: number | null
          street_group?: string | null
          updated_at?: string | null
          year_built?: number | null
        }
        Relationships: []
      }
      property_access_audit: {
        Row: {
          action_details: Json | null
          action_type: string
          audit_id: string
          ip_address: unknown | null
          performed_at: string | null
          performed_by: string | null
          person_id: string | null
          property_id: string
          user_agent: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          audit_id?: string
          ip_address?: unknown | null
          performed_at?: string | null
          performed_by?: string | null
          person_id?: string | null
          property_id: string
          user_agent?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          audit_id?: string
          ip_address?: unknown | null
          performed_at?: string | null
          performed_by?: string | null
          person_id?: string | null
          property_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_access_audit_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_access_audit_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["owner_person_id"]
          },
          {
            foreignKeyName: "property_access_audit_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_access_audit_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["owner_person_id"]
          },
          {
            foreignKeyName: "property_access_audit_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_access_audit_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_access_audit_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_ownership_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
      property_access_requests: {
        Row: {
          claimed_relationship: string
          expires_at: string | null
          ip_address: unknown | null
          property_id: string
          request_id: string
          request_message: string | null
          requested_at: string | null
          requester_email: string
          requester_name: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          supporting_documents: Json | null
          user_agent: string | null
        }
        Insert: {
          claimed_relationship: string
          expires_at?: string | null
          ip_address?: unknown | null
          property_id: string
          request_id?: string
          request_message?: string | null
          requested_at?: string | null
          requester_email: string
          requester_name?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          supporting_documents?: Json | null
          user_agent?: string | null
        }
        Update: {
          claimed_relationship?: string
          expires_at?: string | null
          ip_address?: unknown | null
          property_id?: string
          request_id?: string
          request_message?: string | null
          requested_at?: string | null
          requester_email?: string
          requester_name?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          supporting_documents?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_access_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_access_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_access_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_ownership_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_access_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_access_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["owner_person_id"]
          },
        ]
      }
      property_invitations: {
        Row: {
          accepted_at: string | null
          access_level: string | null
          can_invite_others: boolean | null
          expires_at: string | null
          invitation_id: string
          invitation_token: string | null
          invited_by: string
          invited_email: string
          invited_name: string | null
          message: string | null
          permissions: Json | null
          property_id: string
          rejected_at: string | null
          relationship_type: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          accepted_at?: string | null
          access_level?: string | null
          can_invite_others?: boolean | null
          expires_at?: string | null
          invitation_id?: string
          invitation_token?: string | null
          invited_by: string
          invited_email: string
          invited_name?: string | null
          message?: string | null
          permissions?: Json | null
          property_id: string
          rejected_at?: string | null
          relationship_type: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          accepted_at?: string | null
          access_level?: string | null
          can_invite_others?: boolean | null
          expires_at?: string | null
          invitation_id?: string
          invitation_token?: string | null
          invited_by?: string
          invited_email?: string
          invited_name?: string | null
          message?: string | null
          permissions?: Json | null
          property_id?: string
          rejected_at?: string | null
          relationship_type?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["owner_person_id"]
          },
          {
            foreignKeyName: "property_invitations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_invitations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_invitations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_ownership_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
      property_management: {
        Row: {
          authorized_by: string | null
          created_at: string | null
          end_date: string | null
          management_id: string
          management_type: string
          manager_id: string
          permissions: Json | null
          property_id: string
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          authorized_by?: string | null
          created_at?: string | null
          end_date?: string | null
          management_id?: string
          management_type?: string
          manager_id: string
          permissions?: Json | null
          property_id: string
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          authorized_by?: string | null
          created_at?: string | null
          end_date?: string | null
          management_id?: string
          management_type?: string
          manager_id?: string
          permissions?: Json | null
          property_id?: string
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_management_authorized_by_fkey"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_management_authorized_by_fkey"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["owner_person_id"]
          },
          {
            foreignKeyName: "property_management_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_management_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["owner_person_id"]
          },
          {
            foreignKeyName: "property_management_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_management_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_management_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_ownership_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
      property_ownership: {
        Row: {
          created_at: string | null
          owner_id: string
          ownership_end_date: string | null
          ownership_id: string
          ownership_percentage: number | null
          ownership_start_date: string | null
          ownership_type: string
          property_id: string
          updated_at: string | null
          verification_documents: Json | null
          verified_at: string | null
          verified_by: string | null
          verified_by_hoa: boolean | null
        }
        Insert: {
          created_at?: string | null
          owner_id: string
          ownership_end_date?: string | null
          ownership_id?: string
          ownership_percentage?: number | null
          ownership_start_date?: string | null
          ownership_type?: string
          property_id: string
          updated_at?: string | null
          verification_documents?: Json | null
          verified_at?: string | null
          verified_by?: string | null
          verified_by_hoa?: boolean | null
        }
        Update: {
          created_at?: string | null
          owner_id?: string
          ownership_end_date?: string | null
          ownership_id?: string
          ownership_percentage?: number | null
          ownership_start_date?: string | null
          ownership_type?: string
          property_id?: string
          updated_at?: string | null
          verification_documents?: Json | null
          verified_at?: string | null
          verified_by?: string | null
          verified_by_hoa?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "property_ownership_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_ownership_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["owner_person_id"]
          },
          {
            foreignKeyName: "property_ownership_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_ownership_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_ownership_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_ownership_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_ownership_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_ownership_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["owner_person_id"]
          },
        ]
      }
      property_residents: {
        Row: {
          access_level: string | null
          can_invite_others: boolean | null
          created_at: string | null
          end_date: string | null
          invited_by: string | null
          is_hoa_responsible: boolean | null
          is_primary_contact: boolean | null
          move_in_reason: string | null
          move_out_reason: string | null
          notes: string | null
          permissions: Json | null
          person_id: string
          property_id: string
          relationship_type: string
          resident_id: string
          start_date: string
          verification_status: string | null
        }
        Insert: {
          access_level?: string | null
          can_invite_others?: boolean | null
          created_at?: string | null
          end_date?: string | null
          invited_by?: string | null
          is_hoa_responsible?: boolean | null
          is_primary_contact?: boolean | null
          move_in_reason?: string | null
          move_out_reason?: string | null
          notes?: string | null
          permissions?: Json | null
          person_id: string
          property_id: string
          relationship_type: string
          resident_id?: string
          start_date: string
          verification_status?: string | null
        }
        Update: {
          access_level?: string | null
          can_invite_others?: boolean | null
          created_at?: string | null
          end_date?: string | null
          invited_by?: string | null
          is_hoa_responsible?: boolean | null
          is_primary_contact?: boolean | null
          move_in_reason?: string | null
          move_out_reason?: string | null
          notes?: string | null
          permissions?: Json | null
          person_id?: string
          property_id?: string
          relationship_type?: string
          resident_id?: string
          start_date?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_residents_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_residents_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["owner_person_id"]
          },
          {
            foreignKeyName: "property_residents_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_residents_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["owner_person_id"]
          },
          {
            foreignKeyName: "property_residents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_residents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_residents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_ownership_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
      property_surveys: {
        Row: {
          completion_percentage: number | null
          created_at: string | null
          is_anonymous: boolean | null
          last_section_completed: string | null
          notes: string | null
          property_id: string
          resident_id: string | null
          response_status: string | null
          responses: Json
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_date: string | null
          survey_definition_id: string
          survey_id: string
          time_spent_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          completion_percentage?: number | null
          created_at?: string | null
          is_anonymous?: boolean | null
          last_section_completed?: string | null
          notes?: string | null
          property_id: string
          resident_id?: string | null
          response_status?: string | null
          responses: Json
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_date?: string | null
          survey_definition_id: string
          survey_id?: string
          time_spent_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          completion_percentage?: number | null
          created_at?: string | null
          is_anonymous?: boolean | null
          last_section_completed?: string | null
          notes?: string | null
          property_id?: string
          resident_id?: string | null
          response_status?: string | null
          responses?: Json
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_date?: string | null
          survey_definition_id?: string
          survey_id?: string
          time_spent_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_surveys_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_surveys_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_surveys_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_ownership_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_surveys_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "property_residents"
            referencedColumns: ["resident_id"]
          },
          {
            foreignKeyName: "property_surveys_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "verified_property_residents"
            referencedColumns: ["resident_id"]
          },
          {
            foreignKeyName: "property_surveys_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_surveys_survey_definition_id_fkey"
            columns: ["survey_definition_id"]
            isOneToOne: false
            referencedRelation: "survey_definitions"
            referencedColumns: ["survey_definition_id"]
          },
          {
            foreignKeyName: "property_surveys_survey_definition_id_fkey"
            columns: ["survey_definition_id"]
            isOneToOne: false
            referencedRelation: "survey_participation_summary"
            referencedColumns: ["survey_definition_id"]
          },
        ]
      }
      q1_q2_preference_rating: {
        Row: {
          created_at: string | null
          q1_preference: string | null
          q2_service_rating: string | null
          response_id: string
        }
        Insert: {
          created_at?: string | null
          q1_preference?: string | null
          q2_service_rating?: string | null
          response_id: string
        }
        Update: {
          created_at?: string | null
          q1_preference?: string | null
          q2_service_rating?: string | null
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "q1_q2_preference_rating_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "complete_responses"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "q1_q2_preference_rating_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "responses"
            referencedColumns: ["response_id"]
          },
        ]
      }
      q10_biggest_concern: {
        Row: {
          biggest_concern: string | null
          created_at: string | null
          response_id: string
        }
        Insert: {
          biggest_concern?: string | null
          created_at?: string | null
          response_id: string
        }
        Update: {
          biggest_concern?: string | null
          created_at?: string | null
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "q10_biggest_concern_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "complete_responses"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "q10_biggest_concern_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "responses"
            referencedColumns: ["response_id"]
          },
        ]
      }
      q11_cost_reduction: {
        Row: {
          cost_reduction_ideas: string | null
          created_at: string | null
          response_id: string
        }
        Insert: {
          cost_reduction_ideas?: string | null
          created_at?: string | null
          response_id: string
        }
        Update: {
          cost_reduction_ideas?: string | null
          created_at?: string | null
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "q11_cost_reduction_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "complete_responses"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "q11_cost_reduction_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "responses"
            referencedColumns: ["response_id"]
          },
        ]
      }
      q12_involvement: {
        Row: {
          created_at: string | null
          involvement_preference: string | null
          response_id: string
        }
        Insert: {
          created_at?: string | null
          involvement_preference?: string | null
          response_id: string
        }
        Update: {
          created_at?: string | null
          involvement_preference?: string | null
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "q12_involvement_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "complete_responses"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "q12_involvement_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "responses"
            referencedColumns: ["response_id"]
          },
        ]
      }
      q3_opt_out_reasons: {
        Row: {
          created_at: string | null
          maintain_self: string | null
          other_text: string | null
          pet_safety: string | null
          privacy: string | null
          quality: string | null
          response_id: string
        }
        Insert: {
          created_at?: string | null
          maintain_self?: string | null
          other_text?: string | null
          pet_safety?: string | null
          privacy?: string | null
          quality?: string | null
          response_id: string
        }
        Update: {
          created_at?: string | null
          maintain_self?: string | null
          other_text?: string | null
          pet_safety?: string | null
          privacy?: string | null
          quality?: string | null
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "q3_opt_out_reasons_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "complete_responses"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "q3_opt_out_reasons_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "responses"
            referencedColumns: ["response_id"]
          },
        ]
      }
      q4_landscaping_issues: {
        Row: {
          created_at: string | null
          inadequate_weeds: string | null
          irrigation: string | null
          irrigation_detail: string | null
          missed_service: string | null
          other_issues: string | null
          poor_mowing: string | null
          property_damage: string | null
          response_id: string
        }
        Insert: {
          created_at?: string | null
          inadequate_weeds?: string | null
          irrigation?: string | null
          irrigation_detail?: string | null
          missed_service?: string | null
          other_issues?: string | null
          poor_mowing?: string | null
          property_damage?: string | null
          response_id: string
        }
        Update: {
          created_at?: string | null
          inadequate_weeds?: string | null
          irrigation?: string | null
          irrigation_detail?: string | null
          missed_service?: string | null
          other_issues?: string | null
          poor_mowing?: string | null
          property_damage?: string | null
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "q4_landscaping_issues_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "complete_responses"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "q4_landscaping_issues_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "responses"
            referencedColumns: ["response_id"]
          },
        ]
      }
      q5_q6_construction_group: {
        Row: {
          created_at: string | null
          q5_construction_issues: string | null
          q5_explanation: string | null
          q6_group_action: string | null
          response_id: string
        }
        Insert: {
          created_at?: string | null
          q5_construction_issues?: string | null
          q5_explanation?: string | null
          q6_group_action?: string | null
          response_id: string
        }
        Update: {
          created_at?: string | null
          q5_construction_issues?: string | null
          q5_explanation?: string | null
          q6_group_action?: string | null
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "q5_q6_construction_group_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "complete_responses"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "q5_q6_construction_group_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "responses"
            referencedColumns: ["response_id"]
          },
        ]
      }
      q7_interest_areas: {
        Row: {
          created_at: string | null
          equipment_coop: string | null
          manage_area: string | null
          mentorship: string | null
          paid_work: string | null
          response_id: string
          volunteering: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_coop?: string | null
          manage_area?: string | null
          mentorship?: string | null
          paid_work?: string | null
          response_id: string
          volunteering?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_coop?: string | null
          manage_area?: string | null
          mentorship?: string | null
          paid_work?: string | null
          response_id?: string
          volunteering?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "q7_interest_areas_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "complete_responses"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "q7_interest_areas_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "responses"
            referencedColumns: ["response_id"]
          },
        ]
      }
      q8_equipment_ownership: {
        Row: {
          basic_tools: string | null
          blower: string | null
          created_at: string | null
          lawn_mower: string | null
          response_id: string
          trimmer: string | null
          truck_trailer: string | null
        }
        Insert: {
          basic_tools?: string | null
          blower?: string | null
          created_at?: string | null
          lawn_mower?: string | null
          response_id: string
          trimmer?: string | null
          truck_trailer?: string | null
        }
        Update: {
          basic_tools?: string | null
          blower?: string | null
          created_at?: string | null
          lawn_mower?: string | null
          response_id?: string
          trimmer?: string | null
          truck_trailer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "q8_equipment_ownership_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "complete_responses"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "q8_equipment_ownership_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "responses"
            referencedColumns: ["response_id"]
          },
        ]
      }
      q9_dues_preference: {
        Row: {
          created_at: string | null
          dues_preference: string | null
          response_id: string
        }
        Insert: {
          created_at?: string | null
          dues_preference?: string | null
          response_id: string
        }
        Update: {
          created_at?: string | null
          dues_preference?: string | null
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "q9_dues_preference_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "complete_responses"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "q9_dues_preference_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: true
            referencedRelation: "responses"
            referencedColumns: ["response_id"]
          },
        ]
      }
      responses: {
        Row: {
          address: string | null
          anonymous: string | null
          created_at: string | null
          email_contact: string | null
          name: string | null
          pdf_file_path: string | null
          pdf_storage_url: string | null
          pdf_uploaded_at: string | null
          property_id: string | null
          response_id: string
          review_notes: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          anonymous?: string | null
          created_at?: string | null
          email_contact?: string | null
          name?: string | null
          pdf_file_path?: string | null
          pdf_storage_url?: string | null
          pdf_uploaded_at?: string | null
          property_id?: string | null
          response_id: string
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          anonymous?: string | null
          created_at?: string | null
          email_contact?: string | null
          name?: string | null
          pdf_file_path?: string | null
          pdf_storage_url?: string | null
          pdf_uploaded_at?: string | null
          property_id?: string | null
          response_id?: string
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      survey_definitions: {
        Row: {
          active_period_end: string | null
          active_period_start: string | null
          auto_recurring: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          display_config: Json | null
          is_active: boolean | null
          is_template: boolean | null
          parent_survey_id: string | null
          recurrence_config: Json | null
          response_schema: Json
          survey_definition_id: string
          survey_name: string
          survey_type: string
          target_audience: string | null
          targeting_config: Json | null
          template_category: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          active_period_end?: string | null
          active_period_start?: string | null
          auto_recurring?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_config?: Json | null
          is_active?: boolean | null
          is_template?: boolean | null
          parent_survey_id?: string | null
          recurrence_config?: Json | null
          response_schema: Json
          survey_definition_id?: string
          survey_name: string
          survey_type: string
          target_audience?: string | null
          targeting_config?: Json | null
          template_category?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          active_period_end?: string | null
          active_period_start?: string | null
          auto_recurring?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          display_config?: Json | null
          is_active?: boolean | null
          is_template?: boolean | null
          parent_survey_id?: string | null
          recurrence_config?: Json | null
          response_schema?: Json
          survey_definition_id?: string
          survey_name?: string
          survey_type?: string
          target_audience?: string | null
          targeting_config?: Json | null
          template_category?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_definitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_definitions_parent_survey_id_fkey"
            columns: ["parent_survey_id"]
            isOneToOne: false
            referencedRelation: "survey_definitions"
            referencedColumns: ["survey_definition_id"]
          },
          {
            foreignKeyName: "survey_definitions_parent_survey_id_fkey"
            columns: ["parent_survey_id"]
            isOneToOne: false
            referencedRelation: "survey_participation_summary"
            referencedColumns: ["survey_definition_id"]
          },
        ]
      }
      survey_file_uploads: {
        Row: {
          content_type: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          question_id: string
          survey_id: string
          upload_id: string
          uploaded_at: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          question_id: string
          survey_id: string
          upload_id?: string
          uploaded_at?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          question_id?: string
          survey_id?: string
          upload_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_file_uploads_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "property_surveys"
            referencedColumns: ["survey_id"]
          },
        ]
      }
      survey_notes: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          note_id: number
          note_text: string
          note_type: string | null
          priority: string | null
          question_context: string | null
          requires_follow_up: boolean | null
          resolved: boolean | null
          response_id: string
          section: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          note_id?: number
          note_text: string
          note_type?: string | null
          priority?: string | null
          question_context?: string | null
          requires_follow_up?: boolean | null
          resolved?: boolean | null
          response_id: string
          section: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          note_id?: number
          note_text?: string
          note_type?: string | null
          priority?: string | null
          question_context?: string | null
          requires_follow_up?: boolean | null
          resolved?: boolean | null
          response_id?: string
          section?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_notes_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "complete_responses"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "survey_notes_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "responses"
            referencedColumns: ["response_id"]
          },
        ]
      }
      user_filter_presets: {
        Row: {
          created_at: string | null
          filter_data: Json
          is_default: boolean | null
          is_shared: boolean | null
          preset_description: string | null
          preset_id: string
          preset_name: string
          updated_at: string | null
          usage_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filter_data: Json
          is_default?: boolean | null
          is_shared?: boolean | null
          preset_description?: string | null
          preset_id?: string
          preset_name: string
          updated_at?: string | null
          usage_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filter_data?: Json
          is_default?: boolean | null
          is_shared?: boolean | null
          preset_description?: string | null
          preset_id?: string
          preset_name?: string
          updated_at?: string | null
          usage_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_filter_presets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          last_sign_in: string | null
          promoted_at: string | null
          promoted_by: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_sign_in?: string | null
          promoted_at?: string | null
          promoted_by?: string | null
          role?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_sign_in?: string | null
          promoted_at?: string | null
          promoted_by?: string | null
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      complete_responses: {
        Row: {
          address: string | null
          anonymous: string | null
          basic_tools: string | null
          biggest_concern: string | null
          blower: string | null
          cost_reduction_ideas: string | null
          critical_notes: number | null
          dues_preference: string | null
          email_contact: string | null
          equipment_coop: string | null
          follow_up_notes: number | null
          inadequate_weeds: string | null
          involvement_preference: string | null
          irrigation: string | null
          irrigation_detail: string | null
          lawn_mower: string | null
          manage_area: string | null
          mentorship: string | null
          missed_service: string | null
          name: string | null
          other_issues: string | null
          paid_work: string | null
          pdf_file_path: string | null
          pdf_storage_url: string | null
          pdf_uploaded_at: string | null
          poor_mowing: string | null
          property_damage: string | null
          q1_preference: string | null
          q2_service_rating: string | null
          q3_maintain_self: string | null
          q3_other_text: string | null
          q3_pet_safety: string | null
          q3_privacy: string | null
          q3_quality: string | null
          q5_construction_issues: string | null
          q5_explanation: string | null
          q6_group_action: string | null
          response_id: string | null
          review_notes: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          total_notes: number | null
          trimmer: string | null
          truck_trailer: string | null
          volunteering: string | null
        }
        Relationships: []
      }
      critical_issues: {
        Row: {
          address: string | null
          anonymous: string | null
          name: string | null
          note_text: string | null
          priority: string | null
          requires_follow_up: boolean | null
          resolved: boolean | null
          response_id: string | null
          section: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_notes_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "complete_responses"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "survey_notes_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "responses"
            referencedColumns: ["response_id"]
          },
        ]
      }
      pending_property_requests: {
        Row: {
          address: string | null
          claimed_relationship: string | null
          expires_at: string | null
          hoa_zone: string | null
          ip_address: unknown | null
          is_expired: boolean | null
          property_id: string | null
          request_id: string | null
          request_message: string | null
          requested_at: string | null
          requester_email: string | null
          requester_name: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          supporting_documents: Json | null
          user_agent: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_access_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_access_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_access_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_ownership_summary"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_access_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_access_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["owner_person_id"]
          },
        ]
      }
      property_directory: {
        Row: {
          address: string | null
          created_at: string | null
          current_resident_count: number | null
          hoa_zone: string | null
          lot_number: string | null
          notes: string | null
          owner_email: string | null
          owner_mailing_address: string | null
          owner_name: string | null
          owner_person_id: string | null
          owner_phone: string | null
          property_id: string | null
          property_type: string | null
          special_features: Json | null
          square_footage: number | null
          street_group: string | null
          total_surveys: number | null
          updated_at: string | null
          year_built: number | null
        }
        Relationships: []
      }
      property_ownership_summary: {
        Row: {
          address: string | null
          hoa_zone: string | null
          owner_count: number | null
          owners: Json[] | null
          property_id: string | null
        }
        Relationships: []
      }
      survey_notes_with_response_info: {
        Row: {
          address: string | null
          admin_notes: string | null
          anonymous: string | null
          created_at: string | null
          name: string | null
          note_id: number | null
          note_text: string | null
          note_type: string | null
          priority: string | null
          question_context: string | null
          requires_follow_up: boolean | null
          resolved: boolean | null
          response_id: string | null
          review_status: string | null
          section: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_notes_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "complete_responses"
            referencedColumns: ["response_id"]
          },
          {
            foreignKeyName: "survey_notes_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "responses"
            referencedColumns: ["response_id"]
          },
        ]
      }
      survey_participation_summary: {
        Row: {
          active_period_end: string | null
          active_period_start: string | null
          completed_responses: number | null
          is_template: boolean | null
          participation_rate_percent: number | null
          properties_participated: number | null
          survey_definition_id: string | null
          survey_name: string | null
          survey_type: string | null
          template_category: string | null
          total_properties: number | null
          total_responses: number | null
        }
        Relationships: []
      }
      survey_summary: {
        Row: {
          count: number | null
          metric: string | null
          percentage: number | null
        }
        Relationships: []
      }
      verified_property_residents: {
        Row: {
          access_level: string | null
          account_status: string | null
          account_type: string | null
          address: string | null
          can_invite_others: boolean | null
          created_at: string | null
          email: string | null
          end_date: string | null
          first_name: string | null
          hoa_zone: string | null
          invited_by: string | null
          is_hoa_responsible: boolean | null
          is_primary_contact: boolean | null
          last_name: string | null
          move_in_reason: string | null
          move_out_reason: string | null
          notes: string | null
          permissions: Json | null
          person_id: string | null
          phone: string | null
          property_id: string | null
          relationship_type: string | null
          resident_id: string | null
          start_date: string | null
          verification_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_residents_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_residents_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["owner_person_id"]
          },
          {
            foreignKeyName: "property_residents_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "people"
            referencedColumns: ["person_id"]
          },
          {
            foreignKeyName: "property_residents_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["owner_person_id"]
          },
          {
            foreignKeyName: "property_residents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_residents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_directory"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_residents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "property_ownership_summary"
            referencedColumns: ["property_id"]
          },
        ]
      }
    }
    Functions: {
      demote_user_from_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      duplicate_survey_definition: {
        Args: {
          source_survey_id: string
          new_name: string
          new_description?: string
        }
        Returns: string
      }
      get_active_surveys_for_property: {
        Args: { input_property_id: string }
        Returns: {
          survey_definition_id: string
          survey_name: string
          survey_type: string
          active_period_end: string
          has_response: boolean
        }[]
      }
      get_current_residents: {
        Args: { property_id: string }
        Returns: {
          resident_id: string
          person_id: string
          full_name: string
          relationship_type: string
          is_primary_contact: boolean
          email: string
          phone: string
        }[]
      }
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          email: string
          full_name: string
          role: string
          is_active: boolean
          created_at: string
          last_sign_in: string
        }[]
      }
      get_non_participating_properties: {
        Args: { survey_def_id: string }
        Returns: {
          property_id: string
          address: string
          lot_number: string
          hoa_zone: string
        }[]
      }
      get_survey_participation_stats: {
        Args: { input_survey_definition_id: string }
        Returns: {
          total_properties: number
          properties_with_responses: number
          total_responses: number
          completed_responses: number
          participation_rate: number
          completion_rate: number
        }[]
      }
      get_user_accessible_properties: {
        Args: { user_auth_id: string }
        Returns: {
          property_id: string
          address: string
          hoa_zone: string
          access_type: string
          permissions: Json
        }[]
      }
      increment_filter_preset_usage: {
        Args: { preset_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      promote_user_to_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      set_default_filter_preset: {
        Args: { preset_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
