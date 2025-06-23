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
          notes: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          q1_preference?: string | null;
          q2_service_rating?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          q1_preference?: string | null;
          q2_service_rating?: string | null;
          notes?: string | null;
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
          plant_selection: string | null;
          watering_irrigation: string | null;
          fertilizing_pest: string | null;
          lawn_maintenance: string | null;
          seasonal_planning: string | null;
          other_interests: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          q7_na?: string | null;
          plant_selection?: string | null;
          watering_irrigation?: string | null;
          fertilizing_pest?: string | null;
          lawn_maintenance?: string | null;
          seasonal_planning?: string | null;
          other_interests?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          q7_na?: string | null;
          plant_selection?: string | null;
          watering_irrigation?: string | null;
          fertilizing_pest?: string | null;
          lawn_maintenance?: string | null;
          seasonal_planning?: string | null;
          other_interests?: string | null;
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
          notes: string | null;
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
          notes?: string | null;
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
          notes?: string | null;
          created_at?: string;
        };
      };
      q9_dues_preference: {
        Row: {
          response_id: string;
          q9_response: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          q9_response?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          q9_response?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      q10_biggest_concern: {
        Row: {
          response_id: string;
          q10_text: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          q10_text?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          q10_text?: string | null;
          created_at?: string;
        };
      };
      q11_cost_reduction: {
        Row: {
          response_id: string;
          q11_text: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          q11_text?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          q11_text?: string | null;
          created_at?: string;
        };
      };
      q12_involvement: {
        Row: {
          response_id: string;
          q12_response: string | null;
          q12_notes: string | null;
          created_at: string;
        };
        Insert: {
          response_id: string;
          q12_response?: string | null;
          q12_notes?: string | null;
          created_at?: string;
        };
        Update: {
          response_id?: string;
          q12_response?: string | null;
          q12_notes?: string | null;
          created_at?: string;
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
          q1_q2_notes: string | null;
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
          plant_selection: string | null;
          watering_irrigation: string | null;
          fertilizing_pest: string | null;
          lawn_maintenance: string | null;
          seasonal_planning: string | null;
          other_interests: string | null;
          lawn_mower: string | null;
          trimmer: string | null;
          blower: string | null;
          basic_tools: string | null;
          truck_trailer: string | null;
          equipment_notes: string | null;
          dues_preference: string | null;
          dues_notes: string | null;
          biggest_concern: string | null;
          cost_reduction_ideas: string | null;
          involvement_preference: string | null;
          involvement_notes: string | null;
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