#!/usr/bin/env node

/**
 * Check Response IDs Script
 * 
 * This script shows what response IDs actually exist in the database
 * to help debug the PDF matching issue.
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

async function checkResponseIds() {
  try {
    const { data: responses, error } = await supabase
      .from('responses')
      .select('response_id')
      .order('response_id');

    if (error) {
      throw new Error(`Failed to fetch responses: ${error.message}`);
    }

    console.log('📋 Found response IDs in database:');
    console.log('First 10:', responses.slice(0, 10).map(r => r.response_id));
    console.log('Last 10:', responses.slice(-10).map(r => r.response_id));
    console.log(`Total responses: ${responses.length}`);
    
    // Check if they're 3-digit format
    const hasThreeDigit = responses.some(r => r.response_id.match(/^\d{3}$/));
    console.log(`Three-digit format (001, 002, etc.): ${hasThreeDigit}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkResponseIds();