#!/usr/bin/env node

/**
 * Bulk PDF Database Update Script
 * 
 * This script connects to Supabase and updates the responses table
 * with PDF file information for all uploaded PDFs in the survey-pdfs bucket.
 * 
 * Prerequisites:
 * 1. All PDFs uploaded to Supabase Storage bucket: survey-pdfs
 * 2. PDF files named as: 001.pdf, 002.pdf, 050.pdf, etc.
 * 3. .env file with SUPABASE_URL and SUPABASE_SERVICE_KEY
 * 
 * Usage: node scripts/bulk-update-pdfs.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('   SUPABASE_SERVICE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

// Create Supabase client with service key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
  },
});

async function bulkUpdatePDFs() {
  console.log('🚀 Starting bulk PDF database update...');
  
  try {
    // 1. List all files in the survey-pdfs bucket
    console.log('📁 Fetching files from survey-pdfs bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from('survey-pdfs')
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`);
    }

    console.log(`📄 Found ${files.length} files in storage bucket`);

    // 2. Filter PDF files and extract response IDs
    const pdfFiles = files
      .filter(file => file.name.endsWith('.pdf'))
      .map(file => {
        // Extract response ID from filename (e.g., "050.pdf" -> "050")
        // Keep the leading zeros to match database format
        const match = file.name.match(/^(\d{3})\.pdf$/);
        if (match) {
          return {
            fileName: file.name,
            responseId: match[1], // Keep as "001", "050", etc.
            publicUrl: supabase.storage
              .from('survey-pdfs')
              .getPublicUrl(file.name).data.publicUrl
          };
        }
        return null;
      })
      .filter(Boolean);

    console.log(`📋 Processing ${pdfFiles.length} PDF files:`, 
      pdfFiles.map(f => `${f.fileName} → Response ${f.responseId}`).join(', '));

    // 3. Get existing responses to validate IDs
    console.log('🔍 Validating response IDs...');
    const { data: existingResponses, error: responseError } = await supabase
      .from('responses')
      .select('response_id')
      .in('response_id', pdfFiles.map(f => f.responseId));

    if (responseError) {
      throw new Error(`Failed to fetch responses: ${responseError.message}`);
    }

    const existingIds = new Set(existingResponses.map(r => r.response_id));
    const validPdfs = pdfFiles.filter(pdf => existingIds.has(pdf.responseId));
    const invalidPdfs = pdfFiles.filter(pdf => !existingIds.has(pdf.responseId));

    if (invalidPdfs.length > 0) {
      console.warn('⚠️  Warning: Found PDFs for non-existent response IDs:');
      invalidPdfs.forEach(pdf => console.warn(`   ${pdf.fileName} → Response ${pdf.responseId} (not found)`));
    }

    console.log(`✅ ${validPdfs.length} PDFs match existing responses`);

    // 4. Update database for each valid PDF
    let successCount = 0;
    let errorCount = 0;

    console.log('💾 Updating database records...');
    
    for (const pdf of validPdfs) {
      try {
        const { error: updateError } = await supabase
          .from('responses')
          .update({
            pdf_file_path: `survey-pdfs/${pdf.fileName}`,
            pdf_storage_url: pdf.publicUrl,
            pdf_uploaded_at: new Date().toISOString()
          })
          .eq('response_id', pdf.responseId);

        if (updateError) {
          console.error(`❌ Failed to update response ${pdf.responseId}: ${updateError.message}`);
          errorCount++;
        } else {
          console.log(`✅ Updated response ${pdf.responseId} with ${pdf.fileName}`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Error updating response ${pdf.responseId}:`, error);
        errorCount++;
      }
    }

    // 5. Summary
    console.log('\n📊 Bulk Update Summary:');
    console.log(`   Total PDFs found: ${pdfFiles.length}`);
    console.log(`   Valid response IDs: ${validPdfs.length}`);
    console.log(`   Successfully updated: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   Invalid response IDs: ${invalidPdfs.length}`);

    if (successCount > 0) {
      console.log('\n🎉 Bulk update completed successfully!');
      console.log('📝 You can now view PDFs in the survey response pages.');
    }

    if (errorCount > 0) {
      console.log('\n⚠️  Some updates failed. Check the error messages above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Fatal error during bulk update:', error);
    process.exit(1);
  }
}

// Run the script
bulkUpdatePDFs();