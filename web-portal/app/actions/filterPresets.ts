'use server';

import { createClient } from '@/lib/supabase-server';
import { AdvancedFilterSet } from '@/lib/advanced-filters';
import { Database } from '@/types/database';

type FilterPreset = Database['public']['Tables']['user_filter_presets']['Row'];
type FilterPresetInsert = Database['public']['Tables']['user_filter_presets']['Insert'];
type FilterPresetUpdate = Database['public']['Tables']['user_filter_presets']['Update'];

export interface FilterPresetWithUser extends FilterPreset {
  user_profile?: {
    full_name: string | null;
    email: string;
  };
}

/**
 * Fetch all filter presets available to the current user
 * (their own presets + shared presets from other admins)
 */
export async function getFilterPresets(): Promise<{ 
  data: FilterPresetWithUser[] | null; 
  error: string | null;
}> {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { data: null, error: 'Not authenticated' };
    }

    // Fetch user's own presets and shared presets from others
    const { data: presets, error } = await supabase
      .from('user_filter_presets')
      .select(`
        *,
        user_profile:user_profiles!user_id(full_name, email)
      `)
      .or(`user_id.eq.${user.id},is_shared.eq.true`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching filter presets:', error);
      return { data: null, error: error.message };
    }

    return { data: presets as FilterPresetWithUser[], error: null };
  } catch (error) {
    console.error('Unexpected error in getFilterPresets:', error);
    return { data: null, error: 'Failed to fetch filter presets' };
  }
}

/**
 * Get the user's default filter preset if one exists
 */
export async function getDefaultFilterPreset(): Promise<{
  data: FilterPreset | null;
  error: string | null;
}> {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { data: null, error: 'Not authenticated' };
    }

    const { data: preset, error } = await supabase
      .from('user_filter_presets')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching default preset:', error);
      return { data: null, error: error.message };
    }

    return { data: preset, error: null };
  } catch (error) {
    console.error('Unexpected error in getDefaultFilterPreset:', error);
    return { data: null, error: 'Failed to fetch default preset' };
  }
}

/**
 * Save a new filter preset
 */
export async function saveFilterPreset(
  name: string,
  description: string | null,
  filterData: AdvancedFilterSet,
  isShared: boolean = false,
  isDefault: boolean = false
): Promise<{
  data: FilterPreset | null;
  error: string | null;
}> {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { data: null, error: 'Not authenticated' };
    }

    // If setting as default, unset any existing default first
    if (isDefault) {
      await supabase
        .from('user_filter_presets')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true);
    }

    const preset: FilterPresetInsert = {
      user_id: user.id,
      preset_name: name,
      preset_description: description,
      filter_data: filterData,
      is_shared: isShared,
      is_default: isDefault
    };

    const { data, error } = await supabase
      .from('user_filter_presets')
      .insert(preset)
      .select()
      .single();

    if (error) {
      console.error('Error saving filter preset:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in saveFilterPreset:', error);
    return { data: null, error: 'Failed to save filter preset' };
  }
}

/**
 * Update an existing filter preset
 */
export async function updateFilterPreset(
  presetId: string,
  updates: Partial<{
    preset_name: string;
    preset_description: string | null;
    filter_data: AdvancedFilterSet;
    is_shared: boolean;
    is_default: boolean;
  }>
): Promise<{
  data: FilterPreset | null;
  error: string | null;
}> {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { data: null, error: 'Not authenticated' };
    }

    // If setting as default, unset any existing default first
    if (updates.is_default) {
      await supabase
        .from('user_filter_presets')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('is_default', true)
        .neq('preset_id', presetId);
    }

    const updateData: FilterPresetUpdate = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_filter_presets')
      .update(updateData)
      .eq('preset_id', presetId)
      .eq('user_id', user.id) // Ensure user owns the preset
      .select()
      .single();

    if (error) {
      console.error('Error updating filter preset:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in updateFilterPreset:', error);
    return { data: null, error: 'Failed to update filter preset' };
  }
}

/**
 * Delete a filter preset
 */
export async function deleteFilterPreset(presetId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('user_filter_presets')
      .delete()
      .eq('preset_id', presetId)
      .eq('user_id', user.id); // Ensure user owns the preset

    if (error) {
      console.error('Error deleting filter preset:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error in deleteFilterPreset:', error);
    return { success: false, error: 'Failed to delete filter preset' };
  }
}

/**
 * Increment usage count for a preset
 */
export async function incrementPresetUsage(presetId: string): Promise<void> {
  try {
    const supabase = createClient();
    
    await supabase.rpc('increment_filter_preset_usage', { preset_id: presetId });
  } catch (error) {
    console.error('Error incrementing preset usage:', error);
    // Non-critical error, don't throw
  }
}