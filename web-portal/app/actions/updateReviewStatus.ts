'use server';

import { createServiceClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function updateReviewStatus(responseId: string, newStatus: string) {
  try {
    const supabaseService = createServiceClient();

    const updateData = {
      review_status: newStatus,
      reviewed_by: 'Admin', // TODO: Replace with actual user when auth is implemented
      reviewed_at: new Date().toISOString(),
    };

    const { error } = await supabaseService
      .from('responses')
      .update(updateData)
      .eq('response_id', responseId);

    if (error) {
      console.error('Error updating review status:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    // Revalidate the response page and responses list to show updated status
    revalidatePath(`/responses/${responseId}`);
    revalidatePath('/responses');

    return { 
      success: true, 
      status: newStatus 
    };
  } catch (error) {
    console.error('Error updating review status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}