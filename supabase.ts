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
          response_id?: string
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          fertilizing_pest: string | null
          follow_up_notes: number | null
          inadequate_weeds: string | null
          involvement_preference: string | null
          irrigation: string | null
          irrigation_detail: string | null
          lawn_maintenance: string | null
          lawn_mower: string | null
          missed_service: string | null
          name: string | null
          other_issues: string | null
          plant_selection: string | null
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
          seasonal_planning: string | null
          total_notes: number | null
          trimmer: string | null
          truck_trailer: string | null
          watering_irrigation: string | null
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
      survey_summary: {
        Row: {
          count: number | null
          metric: string | null
          percentage: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
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
