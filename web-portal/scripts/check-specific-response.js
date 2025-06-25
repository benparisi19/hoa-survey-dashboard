#!/usr/bin/env node

/**
 * Check specific response PDF info
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
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

async function checkResponse001() {
  try {
    // Check database record
    const { data: response, error } = await supabase
      .from('responses')
      .select('response_id, pdf_file_path, pdf_storage_url, pdf_uploaded_at, review_status')
      .eq('response_id', '001')
      .single();

    if (error) {
      throw new Error(`Failed to fetch response 001: ${error.message}`);
    }

    console.log('📋 Response 001 database record:');
    console.log('PDF file path:', response.pdf_file_path);
    console.log('PDF storage URL:', response.pdf_storage_url);
    console.log('PDF uploaded at:', response.pdf_uploaded_at);
    console.log('Review status:', response.review_status);

    // Check if file exists in storage
    const { data: file, error: storageError } = await supabase.storage
      .from('survey-pdfs')
      .list('', { search: '001.pdf' });

    if (storageError) {
      throw new Error(`Storage error: ${storageError.message}`);
    }

    console.log('\n📁 Storage check:');
    console.log('001.pdf exists in storage:', file.length > 0);
    if (file.length > 0) {
      console.log('File details:', file[0]);
    }

    // Test public URL
    const { data: { publicUrl } } = supabase.storage
      .from('survey-pdfs')
      .getPublicUrl('001.pdf');

    console.log('\n🌐 Public URL:', publicUrl);

  } catch (error) {
    console.error('Error:', error);
  }
}

checkResponse001();