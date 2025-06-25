'use server';

import { createServiceClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function updateResponsePDF(responseId: string, pdfUrl: string | null) {
  try {
    const supabaseService = createServiceClient();

    const updateData: any = {
      pdf_storage_url: pdfUrl
    };

    if (pdfUrl) {
      // Extract file path from URL
      const urlParts = pdfUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      updateData.pdf_file_path = `survey-pdfs/${fileName}`;
      updateData.pdf_uploaded_at = new Date().toISOString();
    } else {
      // Clear PDF data if null
      updateData.pdf_file_path = null;
      updateData.pdf_uploaded_at = null;
    }

    const { error } = await supabaseService
      .from('responses')
      .update(updateData)
      .eq('response_id', responseId);

    if (error) {
      console.error('Error updating PDF info:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    // Revalidate the response page
    revalidatePath(`/responses/${responseId}`);
    revalidatePath('/responses');

    return { 
      success: true 
    };
  } catch (error) {
    console.error('Error updating PDF info:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function createResponseWithPDF(pdfUrl: string) {
  try {
    const supabaseService = createServiceClient();

    // Generate a new response ID (you might want to customize this format)
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newResponseId = `R${timestamp}-${randomSuffix}`;

    // Extract file path from URL
    const urlParts = pdfUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];

    // Create new response with PDF info
    const { data, error } = await supabaseService
      .from('responses')
      .insert({
        response_id: newResponseId,
        anonymous: 'No', // Default values
        review_status: 'unreviewed',
        pdf_file_path: `survey-pdfs/${fileName}`,
        pdf_storage_url: pdfUrl,
        pdf_uploaded_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating response:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }

    // Revalidate pages
    revalidatePath('/responses');

    return { 
      success: true,
      responseId: newResponseId
    };
  } catch (error) {
    console.error('Error creating response:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}