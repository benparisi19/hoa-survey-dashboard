export interface Database {
  public: {
    Tables: {
      responses: {
        Row: {
          response_id: string;
          address: string | null;
          name: string | null;
          email_contact: string | null;
          anonymous: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          response_id: string;
          address?: string | null;
          name?: string | null;
          email_contact?: string | null;
          anonymous?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          response_id?: string;
          address?: string | null;
          name?: string | null;
          email_contact?: string | null;
          anonymous?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      q1_q2_preference_rating: {
        Row: {
          response_id: string;
          q1_preference: string | null;
          q2_service_rating: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          q1_preference?: string | null;
          q2_service_rating?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          q1_preference?: string | null;
          q2_service_rating?: string | null;
          created_at?: string;
        };
      };
      q3_opt_out_reasons: {
        Row: {
          response_id: string;
          q3_na: string | null;
          maintain_self: string | null;
          quality: string | null;
          pet_safety: string | null;
          privacy: string | null;
          other_text: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          q3_na?: string | null;
          maintain_self?: string | null;
          quality?: string | null;
          pet_safety?: string | null;
          privacy?: string | null;
          other_text?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          q3_na?: string | null;
          maintain_self?: string | null;
          quality?: string | null;
          pet_safety?: string | null;
          privacy?: string | null;
          other_text?: string | null;
          created_at?: string;
        };
      };
      q4_landscaping_issues: {
        Row: {
          response_id: string;
          irrigation: string | null;
          poor_mowing: string | null;
          property_damage: string | null;
          missed_service: string | null;
          inadequate_weeds: string | null;
          irrigation_detail: string | null;
          other_issues: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          irrigation?: string | null;
          poor_mowing?: string | null;
          property_damage?: string | null;
          missed_service?: string | null;
          inadequate_weeds?: string | null;
          irrigation_detail?: string | null;
          other_issues?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          irrigation?: string | null;
          poor_mowing?: string | null;
          property_damage?: string | null;
          missed_service?: string | null;
          inadequate_weeds?: string | null;
          irrigation_detail?: string | null;
          other_issues?: string | null;
          created_at?: string;
        };
      };
      q5_q6_construction_group: {
        Row: {
          response_id: string;
          q5_construction_issues: string | null;
          q5_explanation: string | null;
          q6_group_action: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          q5_construction_issues?: string | null;
          q5_explanation?: string | null;
          q6_group_action?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          q5_construction_issues?: string | null;
          q5_explanation?: string | null;
          q6_group_action?: string | null;
          created_at?: string;
        };
      };
      q7_interest_areas: {
        Row: {
          response_id: string;
          q7_na: string | null;
          paid_work: string | null;
          volunteering: string | null;
          equipment_coop: string | null;
          mentorship: string | null;
          manage_area: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          q7_na?: string | null;
          paid_work?: string | null;
          volunteering?: string | null;
          equipment_coop?: string | null;
          mentorship?: string | null;
          manage_area?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          q7_na?: string | null;
          paid_work?: string | null;
          volunteering?: string | null;
          equipment_coop?: string | null;
          mentorship?: string | null;
          manage_area?: string | null;
          created_at?: string;
        };
      };
      q8_equipment_ownership: {
        Row: {
          response_id: string;
          q8_na: string | null;
          lawn_mower: string | null;
          trimmer: string | null;
          blower: string | null;
          basic_tools: string | null;
          truck_trailer: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          q8_na?: string | null;
          lawn_mower?: string | null;
          trimmer?: string | null;
          blower?: string | null;
          basic_tools?: string | null;
          truck_trailer?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          q8_na?: string | null;
          lawn_mower?: string | null;
          trimmer?: string | null;
          blower?: string | null;
          basic_tools?: string | null;
          truck_trailer?: string | null;
          created_at?: string;
        };
      };
      q9_dues_preference: {
        Row: {
          response_id: string;
          dues_preference: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          dues_preference?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          dues_preference?: string | null;
          created_at?: string;
        };
      };
      q10_biggest_concern: {
        Row: {
          response_id: string;
          biggest_concern: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          biggest_concern?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          biggest_concern?: string | null;
          created_at?: string;
        };
      };
      q11_cost_reduction: {
        Row: {
          response_id: string;
          cost_reduction_ideas: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          cost_reduction_ideas?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          cost_reduction_ideas?: string | null;
          created_at?: string;
        };
      };
      q12_involvement: {
        Row: {
          response_id: string;
          involvement_preference: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          involvement_preference?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          involvement_preference?: string | null;
          created_at?: string;
        };
      };
      user_filter_presets: {
        Row: {
          preset_id: string;
          user_id: string;
          preset_name: string;
          preset_description: string | null;
          filter_data: any; // JSONB storing AdvancedFilterSet
          is_shared: boolean;
          is_default: boolean;
          usage_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          preset_id?: string;
          user_id: string;
          preset_name: string;
          preset_description?: string | null;
          filter_data: any;
          is_shared?: boolean;
          is_default?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          preset_id?: string;
          user_id?: string;
          preset_name?: string;
          preset_description?: string | null;
          filter_data?: any;
          is_shared?: boolean;
          is_default?: boolean;
          usage_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          property_id: string;
          address: string;
          lot_number: string | null;
          hoa_zone: string;
          street_group: string | null;
          property_type: string | null;
          square_footage: number | null;
          lot_size_sqft: number | null;
          year_built: number | null;
          special_features: string | null;
          notes: string | null;
          latitude: number | null;
          longitude: number | null;
          geocoded_at: string | null;
          geocoding_accuracy: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          property_id?: string;
          address: string;
          lot_number?: string | null;
          hoa_zone: string;
          street_group?: string | null;
          property_type?: string | null;
          square_footage?: number | null;
          lot_size_sqft?: number | null;
          year_built?: number | null;
          special_features?: string | null;
          notes?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          geocoded_at?: string | null;
          geocoding_accuracy?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          property_id?: string;
          address?: string;
          lot_number?: string | null;
          hoa_zone?: string;
          street_group?: string | null;
          property_type?: string | null;
          square_footage?: number | null;
          lot_size_sqft?: number | null;
          year_built?: number | null;
          special_features?: string | null;
          notes?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          geocoded_at?: string | null;
          geocoding_accuracy?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      people: {
        Row: {
          person_id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          preferred_contact_method: string | null;
          is_official_owner: boolean;
          auth_user_id: string | null;
          account_status: string | null;
          account_type: string | null;
          verification_method: string | null;
          last_sign_in: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          person_id?: string;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          preferred_contact_method?: string | null;
          is_official_owner?: boolean;
          auth_user_id?: string | null;
          account_status?: string | null;
          account_type?: string | null;
          verification_method?: string | null;
          last_sign_in?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          person_id?: string;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          preferred_contact_method?: string | null;
          is_official_owner?: boolean;
          auth_user_id?: string | null;
          account_status?: string | null;
          account_type?: string | null;
          verification_method?: string | null;
          last_sign_in?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      property_residents: {
        Row: {
          resident_id: string;
          property_id: string;
          person_id: string;
          relationship_type: string;
          start_date: string;
          end_date: string | null;
          is_primary: boolean;
          notes: string | null;
          verification_status: string | null;
          permissions: string[] | null;
          access_level: string | null;
          can_invite_others: boolean | null;
          invited_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          resident_id?: string;
          property_id: string;
          person_id: string;
          relationship_type: string;
          start_date?: string;
          end_date?: string | null;
          is_primary?: boolean;
          notes?: string | null;
          verification_status?: string | null;
          permissions?: string[] | null;
          access_level?: string | null;
          can_invite_others?: boolean | null;
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          resident_id?: string;
          property_id?: string;
          person_id?: string;
          relationship_type?: string;
          start_date?: string;
          end_date?: string | null;
          is_primary?: boolean;
          notes?: string | null;
          verification_status?: string | null;
          permissions?: string[] | null;
          access_level?: string | null;
          can_invite_others?: boolean | null;
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      property_ownership: {
        Row: {
          ownership_id: string;
          property_id: string;
          owner_id: string;
          ownership_type: string;
          ownership_percentage: number | null;
          start_date: string;
          end_date: string | null;
          verified_by_hoa: boolean | null;
          verified_by: string | null;
          verified_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          ownership_id?: string;
          property_id: string;
          owner_id: string;
          ownership_type?: string;
          ownership_percentage?: number | null;
          start_date?: string;
          end_date?: string | null;
          verified_by_hoa?: boolean | null;
          verified_by?: string | null;
          verified_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          ownership_id?: string;
          property_id?: string;
          owner_id?: string;
          ownership_type?: string;
          ownership_percentage?: number | null;
          start_date?: string;
          end_date?: string | null;
          verified_by_hoa?: boolean | null;
          verified_by?: string | null;
          verified_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      property_access_requests: {
        Row: {
          request_id: string;
          property_id: string;
          requester_email: string;
          requester_name: string;
          claimed_relationship: string;
          request_message: string | null;
          status: string;
          reviewed_by: string | null;
          review_notes: string | null;
          reviewed_at: string | null;
          requested_at: string;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          request_id?: string;
          property_id: string;
          requester_email: string;
          requester_name: string;
          claimed_relationship: string;
          request_message?: string | null;
          status?: string;
          reviewed_by?: string | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          requested_at?: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          request_id?: string;
          property_id?: string;
          requester_email?: string;
          requester_name?: string;
          claimed_relationship?: string;
          request_message?: string | null;
          status?: string;
          reviewed_by?: string | null;
          review_notes?: string | null;
          reviewed_at?: string | null;
          requested_at?: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      property_invitations: {
        Row: {
          invitation_id: string;
          property_id: string;
          inviter_id: string;
          invitee_email: string;
          invitee_name: string | null;
          relationship_type: string;
          permissions: string[] | null;
          access_level: string | null;
          can_invite_others: boolean | null;
          invitation_token: string;
          status: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          invitation_id?: string;
          property_id: string;
          inviter_id: string;
          invitee_email: string;
          invitee_name?: string | null;
          relationship_type: string;
          permissions?: string[] | null;
          access_level?: string | null;
          can_invite_others?: boolean | null;
          invitation_token: string;
          status?: string;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          invitation_id?: string;
          property_id?: string;
          inviter_id?: string;
          invitee_email?: string;
          invitee_name?: string | null;
          relationship_type?: string;
          permissions?: string[] | null;
          access_level?: string | null;
          can_invite_others?: boolean | null;
          invitation_token?: string;
          status?: string;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
        };
      };
      property_management: {
        Row: {
          management_id: string;
          property_id: string;
          manager_id: string;
          management_type: string;
          start_date: string;
          end_date: string | null;
          authorized_by: string | null;
          permissions: string[] | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          management_id?: string;
          property_id: string;
          manager_id: string;
          management_type?: string;
          start_date?: string;
          end_date?: string | null;
          authorized_by?: string | null;
          permissions?: string[] | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          management_id?: string;
          property_id?: string;
          manager_id?: string;
          management_type?: string;
          start_date?: string;
          end_date?: string | null;
          authorized_by?: string | null;
          permissions?: string[] | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      property_access_audit: {
        Row: {
          audit_id: string;
          property_id: string;
          action_type: string;
          action_details: any;
          performed_by: string | null;
          performed_at: string;
          created_at: string;
        };
        Insert: {
          audit_id?: string;
          property_id: string;
          action_type: string;
          action_details: any;
          performed_by?: string | null;
          performed_at?: string;
          created_at?: string;
        };
        Update: {
          audit_id?: string;
          property_id?: string;
          action_type?: string;
          action_details?: any;
          performed_by?: string | null;
          performed_at?: string;
          created_at?: string;
        };
      };
      survey_notes: {
        Row: {
          note_id: number;
          response_id: string;
          section: string;
          question_context: string | null;
          note_text: string;
          note_type: string;
          requires_follow_up: boolean;
          priority: string;
          admin_notes: string | null;
          resolved: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          response_id: string;
          section: string;
          question_context?: string | null;
          note_text: string;
          note_type?: string;
          requires_follow_up?: boolean;
          priority?: string;
          admin_notes?: string | null;
          resolved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          response_id?: string;
          section?: string;
          question_context?: string | null;
          note_text?: string;
          note_type?: string;
          requires_follow_up?: boolean;
          priority?: string;
          admin_notes?: string | null;
          resolved?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      survey_definitions: {
        Row: {
          survey_definition_id: string;
          survey_name: string;
          survey_type: string;
          description: string | null;
          response_schema: any; // JSONB
          display_config: any | null; // JSONB
          targeting_config: any | null; // JSONB
          is_active: boolean | null;
          is_template: boolean | null;
          template_category: string | null;
          version: number | null;
          parent_survey_id: string | null;
          auto_recurring: boolean | null;
          recurrence_config: any | null; // JSONB
          active_period_start: string | null;
          active_period_end: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          survey_definition_id?: string;
          survey_name: string;
          survey_type: string;
          description?: string | null;
          response_schema: any;
          display_config?: any | null;
          targeting_config?: any | null;
          is_active?: boolean | null;
          is_template?: boolean | null;
          template_category?: string | null;
          version?: number | null;
          parent_survey_id?: string | null;
          auto_recurring?: boolean | null;
          recurrence_config?: any | null;
          active_period_start?: string | null;
          active_period_end?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          survey_definition_id?: string;
          survey_name?: string;
          survey_type?: string;
          description?: string | null;
          response_schema?: any;
          display_config?: any | null;
          targeting_config?: any | null;
          is_active?: boolean | null;
          is_template?: boolean | null;
          template_category?: string | null;
          version?: number | null;
          parent_survey_id?: string | null;
          auto_recurring?: boolean | null;
          recurrence_config?: any | null;
          active_period_start?: string | null;
          active_period_end?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      property_surveys: {
        Row: {
          survey_id: string;
          survey_definition_id: string;
          property_id: string;
          resident_id: string | null;
          responses: any; // JSONB
          response_status: string | null;
          completion_percentage: number | null;
          last_section_completed: string | null;
          time_spent_minutes: number | null;
          review_status: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          submitted_date: string | null;
          is_anonymous: boolean | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          survey_id?: string;
          survey_definition_id: string;
          property_id: string;
          resident_id?: string | null;
          responses: any;
          response_status?: string | null;
          completion_percentage?: number | null;
          last_section_completed?: string | null;
          time_spent_minutes?: number | null;
          review_status?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          submitted_date?: string | null;
          is_anonymous?: boolean | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          survey_id?: string;
          survey_definition_id?: string;
          property_id?: string;
          resident_id?: string | null;
          responses?: any;
          response_status?: string | null;
          completion_percentage?: number | null;
          last_section_completed?: string | null;
          time_spent_minutes?: number | null;
          review_status?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          submitted_date?: string | null;
          is_anonymous?: boolean | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      survey_file_uploads: {
        Row: {
          upload_id: string;
          survey_id: string;
          question_id: string;
          file_name: string;
          file_path: string;
          file_size: number | null;
          content_type: string | null;
          uploaded_at: string | null;
          created_at: string | null;
        };
        Insert: {
          upload_id?: string;
          survey_id: string;
          question_id: string;
          file_name: string;
          file_path: string;
          file_size?: number | null;
          content_type?: string | null;
          uploaded_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          upload_id?: string;
          survey_id?: string;
          question_id?: string;
          file_name?: string;
          file_path?: string;
          file_size?: number | null;
          content_type?: string | null;
          uploaded_at?: string | null;
          created_at?: string | null;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string;
          is_active: boolean | null;
          last_sign_in: string | null;
          promoted_at: string | null;
          promoted_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: string;
          is_active?: boolean | null;
          last_sign_in?: string | null;
          promoted_at?: string | null;
          promoted_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: string;
          is_active?: boolean | null;
          last_sign_in?: string | null;
          promoted_at?: string | null;
          promoted_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      complete_responses: {
        Row: {
          response_id: string;
          address: string | null;
          name: string | null;
          email_contact: string | null;
          anonymous: string | null;
          q1_preference: string | null;
          q2_service_rating: string | null;
          q3_maintain_self: string | null;
          q3_quality: string | null;
          q3_pet_safety: string | null;
          q3_privacy: string | null;
          q3_other_text: string | null;
          irrigation: string | null;
          poor_mowing: string | null;
          property_damage: string | null;
          missed_service: string | null;
          inadequate_weeds: string | null;
          irrigation_detail: string | null;
          other_issues: string | null;
          q5_construction_issues: string | null;
          q5_explanation: string | null;
          q6_group_action: string | null;
          paid_work: string | null;
          volunteering: string | null;
          equipment_coop: string | null;
          mentorship: string | null;
          manage_area: string | null;
          lawn_mower: string | null;
          trimmer: string | null;
          blower: string | null;
          basic_tools: string | null;
          truck_trailer: string | null;
          dues_preference: string | null;
          biggest_concern: string | null;
          cost_reduction_ideas: string | null;
          involvement_preference: string | null;
          total_notes: number;
          follow_up_notes: number;
          critical_notes: number;
        };
      };
      survey_summary: {
        Row: {
          metric: string;
          count: number;
          percentage: number;
        };
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}