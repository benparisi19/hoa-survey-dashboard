'use server';

import { createServiceClient } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function updateReviewStatus(responseId: string, newStatus: string) {
  try {
    const supabaseService = createServiceClient();
    const supabase = createClient();
    
    // Get current user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { 
        success: false, 
        error: 'Authentication required' 
      };
    }
    
    // Get user profile for display name
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();
    
    const reviewedBy = profile?.full_name || profile?.email || user.email || 'Admin';

    const updateData = {
      review_status: newStatus,
      reviewed_by: reviewedBy,
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