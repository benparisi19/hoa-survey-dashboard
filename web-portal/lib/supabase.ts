import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're not using auth for this dashboard
  },
});

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// Type-safe query helpers
export type Tables = Database['public']['Tables'];
export type Response = Tables['responses']['Row'];
export type Q1Q2Rating = Tables['q1_q2_preference_rating']['Row'];
export type Q3OptOut = Tables['q3_opt_out_reasons']['Row'];
export type Q4Issues = Tables['q4_landscaping_issues']['Row'];
export type Q5Q6Construction = Tables['q5_q6_construction_group']['Row'];
export type Q7Interests = Tables['q7_interest_areas']['Row'];
export type Q8Equipment = Tables['q8_equipment_ownership']['Row'];
export type Q9Dues = Tables['q9_dues_preference']['Row'];
export type Q10Concern = Tables['q10_biggest_concern']['Row'];
export type Q11CostReduction = Tables['q11_cost_reduction']['Row'];
export type Q12Involvement = Tables['q12_involvement']['Row'];

// Combined response type for joins
export interface CompleteResponse extends Response {
  q1_q2?: Q1Q2Rating;
  q3_opt_out?: Q3OptOut;
  q4_issues?: Q4Issues;
  q5_q6_construction?: Q5Q6Construction;
  q7_interests?: Q7Interests;
  q8_equipment?: Q8Equipment;
  q9_dues?: Q9Dues;
  q10_concern?: Q10Concern;
  q11_cost_reduction?: Q11CostReduction;
  q12_involvement?: Q12Involvement;
}