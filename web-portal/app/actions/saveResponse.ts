'use server';

import { createServiceClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

interface SaveResponseData {
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
}

export async function saveResponse(data: SaveResponseData) {
  try {
    const supabaseService = createServiceClient();

    // Update main response table
    const { error: responseError } = await supabaseService
      .from('responses')
      .update({
        address: data.address,
        name: data.name,
        email_contact: data.email_contact,
        anonymous: data.anonymous
      })
      .eq('response_id', data.response_id);

    if (responseError) throw responseError;

    // Update Q1/Q2 table
    const { error: q1q2Error } = await supabaseService
      .from('q1_q2_preference_rating')
      .update({
        q1_preference: data.q1_preference,
        q2_service_rating: data.q2_service_rating
      })
      .eq('response_id', data.response_id);

    if (q1q2Error) throw q1q2Error;

    // Update Q3 table
    const { error: q3Error } = await supabaseService
      .from('q3_opt_out_reasons')
      .update({
        maintain_self: data.q3_maintain_self,
        quality: data.q3_quality,
        pet_safety: data.q3_pet_safety,
        privacy: data.q3_privacy,
        other_text: data.q3_other_text
      })
      .eq('response_id', data.response_id);

    if (q3Error) throw q3Error;

    // Update Q4 table
    const { error: q4Error } = await supabaseService
      .from('q4_landscaping_issues')
      .update({
        irrigation: data.irrigation,
        poor_mowing: data.poor_mowing,
        property_damage: data.property_damage,
        missed_service: data.missed_service,
        inadequate_weeds: data.inadequate_weeds,
        irrigation_detail: data.irrigation_detail,
        other_issues: data.other_issues
      })
      .eq('response_id', data.response_id);

    if (q4Error) throw q4Error;

    // Update Q5/Q6 table
    const { error: q5q6Error } = await supabaseService
      .from('q5_q6_construction_group')
      .update({
        q5_construction_issues: data.q5_construction_issues,
        q5_explanation: data.q5_explanation,
        q6_group_action: data.q6_group_action
      })
      .eq('response_id', data.response_id);

    if (q5q6Error) throw q5q6Error;

    // Update Q7 table
    const { error: q7Error } = await supabaseService
      .from('q7_interest_areas')
      .update({
        paid_work: data.paid_work,
        volunteering: data.volunteering,
        equipment_coop: data.equipment_coop,
        mentorship: data.mentorship,
        manage_area: data.manage_area
      })
      .eq('response_id', data.response_id);

    if (q7Error) throw q7Error;

    // Update Q8 table
    const { error: q8Error } = await supabaseService
      .from('q8_equipment_ownership')
      .update({
        lawn_mower: data.lawn_mower,
        trimmer: data.trimmer,
        blower: data.blower,
        basic_tools: data.basic_tools,
        truck_trailer: data.truck_trailer
      })
      .eq('response_id', data.response_id);

    if (q8Error) throw q8Error;

    // Update Q9 table
    const { error: q9Error } = await supabaseService
      .from('q9_dues_preference')
      .update({
        dues_preference: data.dues_preference
      })
      .eq('response_id', data.response_id);

    if (q9Error) throw q9Error;

    // Update Q10 table
    const { error: q10Error } = await supabaseService
      .from('q10_biggest_concern')
      .update({
        biggest_concern: data.biggest_concern
      })
      .eq('response_id', data.response_id);

    if (q10Error) throw q10Error;

    // Update Q11 table
    const { error: q11Error } = await supabaseService
      .from('q11_cost_reduction')
      .update({
        cost_reduction_ideas: data.cost_reduction_ideas
      })
      .eq('response_id', data.response_id);

    if (q11Error) throw q11Error;

    // Update Q12 table
    const { error: q12Error } = await supabaseService
      .from('q12_involvement')
      .update({
        involvement_preference: data.involvement_preference
      })
      .eq('response_id', data.response_id);

    if (q12Error) throw q12Error;

    // Revalidate the response page to show updated data
    revalidatePath(`/responses/${data.response_id}`);
    revalidatePath('/responses');

    return { success: true };
  } catch (error) {
    console.error('Error saving response:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}