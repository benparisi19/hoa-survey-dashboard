// Admin helper functions for using service client when user is admin
// This bypasses RLS policies for admin users

import { createServiceClient } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';

/**
 * Get the appropriate Supabase client based on user's admin status
 * - For admin users: returns service client (bypasses RLS)
 * - For regular users: returns regular client (respects RLS)
 */
export async function getClientForUser() {
  const supabase = createClient();
  
  // Get the authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { client: supabase, isAdmin: false };
  }

  // Get user's profile to check if they're admin
  const { data: profile, error: profileError } = await supabase
    .from('people')
    .select('account_type')
    .eq('auth_user_id', user.id)
    .single();

  // If can't get profile or not admin, use regular client
  if (profileError || !profile || profile.account_type !== 'hoa_admin') {
    return { client: supabase, isAdmin: false };
  }

  // User is admin, return service client
  try {
    const serviceClient = createServiceClient();
    return { client: serviceClient, isAdmin: true };
  } catch (error) {
    console.error('Failed to create service client for admin:', error);
    // Fallback to regular client
    return { client: supabase, isAdmin: false };
  }
}

/**
 * Check if current user is admin (for client-side use)
 */
export function isAdminUser(userProfile: any): boolean {
  return userProfile?.account_type === 'hoa_admin';
}

/**
 * Get service client directly (for server-side admin operations)
 * Only use this after confirming user is admin
 */
export function getServiceClient() {
  return createServiceClient();
}