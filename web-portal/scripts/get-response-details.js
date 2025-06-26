#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function getResponseDetails() {
  console.log('🔍 Getting detailed response information for manual review...\n');
  
  // Get all responses with addresses
  const { data: responses, error } = await supabase
    .from('responses')
    .select('response_id, address, name, email_contact')
    .not('address', 'is', null)
    .neq('address', '')
    .neq('address', 'Not provided')
    .order('response_id');

  if (error) {
    console.error('Error:', error);
    return;
  }

  // Show specific conflicts mentioned by user
  console.log('🔍 CHECKING SPECIFIC ADDRESSES MENTIONED:\n');
  
  const faceto4421 = responses.filter(r => r.address.includes('4421') && r.address.toLowerCase().includes('faceto'));
  const faceto4426 = responses.filter(r => r.address.includes('4426') && r.address.toLowerCase().includes('faceto'));
  
  console.log('4421 E Faceto matches:');
  faceto4421.forEach(r => console.log(`  Response ${r.response_id}: "${r.address}" by ${r.name || 'Unknown'}`));
  
  console.log('\n4426 E Faceto matches:');
  faceto4426.forEach(r => console.log(`  Response ${r.response_id}: "${r.address}" by ${r.name || 'Unknown'}`));
  
  // Check response 002 as mentioned
  const response002 = responses.find(r => r.response_id === 2);
  console.log(`\nResponse 002: "${response002?.address}" by ${response002?.name || 'Unknown'}`);
  
  // Show all responses for context
  console.log('\n📋 ALL SURVEY RESPONSES WITH ADDRESSES:\n');
  responses.forEach(r => {
    console.log(`Response ${String(r.response_id).padStart(3, '0')}: "${r.address}" by ${r.name || 'Unknown'}`);
  });
}

getResponseDetails().catch(console.error);