/**
 * Response Creation System - Core Utilities
 * 
 * Handles creation of new survey responses including:
 * - Response ID generation
 * - Database insertion
 * - PDF linking
 * - Validation
 */

import { supabase } from './supabase';
import { ResponseData } from '@/app/responses/page';

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface CreateResponseOptions {
  address?: string;
  name?: string;
  anonymous?: boolean;
  pdfFile?: File;
  pdfUrl?: string;
  notes?: string;
}

export interface CreateResponseResult {
  success: boolean;
  responseId?: string;
  error?: string;
  data?: ResponseData;
}

export interface BulkCreateResult {
  success: boolean;
  totalProcessed: number;
  successful: string[];
  failed: { filename: string; error: string }[];
}

// ============================================================================
// Response ID Generation
// ============================================================================

/**
 * Gets the next available response ID by checking the database
 */
export async function getNextResponseId(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('responses')
      .select('response_id')
      .order('response_id', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching latest response ID:', error);
      throw error;
    }

    // Default to "000" if no responses exist yet
    const maxId = data && data.length > 0 ? data[0].response_id : "000";
    
    // Parse the numeric part and increment
    const numericId = parseInt(maxId, 10);
    const nextId = numericId + 1;
    
    // Format with leading zeros (3 digits)
    return String(nextId).padStart(3, '0');
  } catch (error) {
    console.error('Failed to generate next response ID:', error);
    throw new Error('Could not generate new response ID');
  }
}

/**
 * Validates that a response ID is available
 */
export async function validateResponseId(responseId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('responses')
      .select('response_id')
      .eq('response_id', responseId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No row found - ID is available
      return true;
    } else if (error) {
      console.error('Error validating response ID:', error);
      return false;
    } else {
      // Row found - ID is taken
      return false;
    }
  } catch (error) {
    console.error('Failed to validate response ID:', error);
    return false;
  }
}

// ============================================================================
// PDF Handling
// ============================================================================

/**
 * Uploads a PDF file to Supabase storage
 */
export async function uploadPDFFile(file: File, responseId: string): Promise<{ url: string; path: string }> {
  try {
    const fileName = `${responseId}.pdf`;
    const filePath = fileName;

    const { data, error } = await supabase.storage
      .from('survey-pdfs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('survey-pdfs')
      .getPublicUrl(filePath);

    return {
      url: urlData.publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Failed to upload PDF file:', error);
    throw new Error('Could not upload PDF file');
  }
}

// ============================================================================
// Database Operations
// ============================================================================

/**
 * Creates a new response record in the database
 */
export async function createResponseRecord(
  responseId: string,
  options: CreateResponseOptions = {}
): Promise<ResponseData> {
  try {
    const responseData = {
      response_id: responseId,
      address: options.address || null,
      name: options.name || null,
      anonymous: options.anonymous ? 'Yes' : 'No',
      review_status: 'unreviewed',
      email_contact: null,
      reviewed_by: null,
      reviewed_at: null,
      pdf_file_path: null,
      pdf_storage_url: null,
      pdf_uploaded_at: null,
      // All survey fields start as null - will be filled during editing
      q1_preference: null,
      q2_service_rating: null,
      q3_maintain_self: null,
      q3_quality: null,
      q3_pet_safety: null,
      q3_privacy: null,
      q3_other_text: null,
      irrigation: null,
      poor_mowing: null,
      property_damage: null,
      missed_service: null,
      inadequate_weeds: null,
      irrigation_detail: null,
      other_issues: null,
      q5_construction_issues: null,
      q5_explanation: null,
      q6_group_action: null,
      plant_selection: null,
      watering_irrigation: null,
      fertilizing_pest: null,
      lawn_maintenance: null,
      seasonal_planning: null,
      other_interests: null,
      lawn_mower: null,
      trimmer: null,
      blower: null,
      basic_tools: null,
      truck_trailer: null,
      dues_preference: null,
      biggest_concern: null,
      cost_reduction_ideas: null,
      involvement_preference: null,
      total_notes: 0,
      follow_up_notes: 0,
      critical_notes: 0
    };

    const { data, error } = await supabase
      .from('responses')
      .insert(responseData)
      .select()
      .single();

    if (error) {
      console.error('Error creating response record:', error);
      throw error;
    }

    return data as ResponseData;
  } catch (error) {
    console.error('Failed to create response record:', error);
    throw new Error('Could not create response record');
  }
}

/**
 * Updates a response record with PDF information
 */
export async function updateResponseWithPDF(
  responseId: string,
  pdfPath: string,
  pdfUrl: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('responses')
      .update({
        pdf_file_path: pdfPath,
        pdf_storage_url: pdfUrl,
        pdf_uploaded_at: new Date().toISOString()
      })
      .eq('response_id', responseId);

    if (error) {
      console.error('Error updating response with PDF info:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update response with PDF info:', error);
    throw new Error('Could not update response with PDF information');
  }
}

// ============================================================================
// Main Creation Functions
// ============================================================================

/**
 * Creates a single new response (with optional PDF)
 */
export async function createSingleResponse(options: CreateResponseOptions = {}): Promise<CreateResponseResult> {
  try {
    // Generate new response ID
    const responseId = await getNextResponseId();
    
    // Validate the ID is available
    const isAvailable = await validateResponseId(responseId);
    if (!isAvailable) {
      throw new Error(`Response ID ${responseId} is already taken`);
    }

    // Create the response record
    const responseData = await createResponseRecord(responseId, options);

    // Handle PDF upload if provided
    if (options.pdfFile) {
      try {
        const { url, path } = await uploadPDFFile(options.pdfFile, responseId);
        await updateResponseWithPDF(responseId, path, url);
        // Update the response data with PDF info
        responseData.pdf_file_path = path;
        responseData.pdf_storage_url = url;
        responseData.pdf_uploaded_at = new Date().toISOString();
      } catch (pdfError) {
        console.error('PDF upload failed, but response was created:', pdfError);
        // Don't fail the entire operation if PDF upload fails
      }
    }

    return {
      success: true,
      responseId,
      data: responseData
    };
  } catch (error) {
    console.error('Failed to create response:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Creates multiple responses from PDF files
 */
export async function createBulkResponsesFromPDFs(files: File[]): Promise<BulkCreateResult> {
  const successful: string[] = [];
  const failed: { filename: string; error: string }[] = [];
  
  for (const file of files) {
    try {
      // Validate file type
      if (file.type !== 'application/pdf') {
        failed.push({
          filename: file.name,
          error: 'File is not a PDF'
        });
        continue;
      }

      // Create response with PDF
      const result = await createSingleResponse({
        pdfFile: file,
        name: file.name.replace('.pdf', ''), // Use filename as default name
        anonymous: false
      });

      if (result.success && result.responseId) {
        successful.push(result.responseId);
      } else {
        failed.push({
          filename: file.name,
          error: result.error || 'Unknown error'
        });
      }
    } catch (error) {
      failed.push({
        filename: file.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return {
    success: failed.length === 0,
    totalProcessed: files.length,
    successful,
    failed
  };
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates create response options
 */
export function validateCreateOptions(options: CreateResponseOptions): string[] {
  const errors: string[] = [];

  if (options.name && options.name.length > 255) {
    errors.push('Name must be less than 255 characters');
  }

  if (options.address && options.address.length > 255) {
    errors.push('Address must be less than 255 characters');
  }

  if (options.pdfFile) {
    if (options.pdfFile.type !== 'application/pdf') {
      errors.push('File must be a PDF');
    }
    
    if (options.pdfFile.size > 50 * 1024 * 1024) { // 50MB limit
      errors.push('PDF file must be less than 50MB');
    }
  }

  return errors;
}

/**
 * Validates bulk PDF files
 */
export function validateBulkPDFs(files: File[]): { valid: File[]; invalid: { file: File; error: string }[] } {
  const valid: File[] = [];
  const invalid: { file: File; error: string }[] = [];

  for (const file of files) {
    const errors = validateCreateOptions({ pdfFile: file });
    
    if (errors.length === 0) {
      valid.push(file);
    } else {
      invalid.push({
        file,
        error: errors.join(', ')
      });
    }
  }

  return { valid, invalid };
}