#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Simulate the address corrections from our migration script
function applyCorrectedAddresses(responses) {
  const corrections = new Map([
    [2, null], // Remove address
    [69, '4055 E Goldstone Dr'],
    [88, '4336 E Vacheron St'], 
    [10, '2054 S Defio Way'],
    [80, '4168 E Esperanto St'],
    [83, '4252 E Vacheron St'],
    [100, '4031 E Blueberry St'],
    [111, '4136 E Blueberry St'],
    [77, '4040 E Esperanto St'],
    [97, '4183 E Esperanto St'],
    [110, '4148 E Blueberry St'],
    [90, '4357 E Vacheron St']
  ]);
  
  return responses.map(r => {
    if (corrections.has(r.response_id)) {
      return { ...r, address: corrections.get(r.response_id) };
    }
    return r;
  });
}

function normalizeAddress(address) {
  if (!address) return '';
  return address
    .trim()
    .toUpperCase()
    .replace(/\bE\./g, 'E')
    .replace(/\bS\./g, 'S')
    .replace(/\bDRIVE\b/g, 'DR')
    .replace(/\bSTREET\b/g, 'ST')
    .replace(/\bAVENUE\b/g, 'AVE')
    .replace(/\bPLACE\b/g, 'PL')
    .replace(/\bWAY\b/g, 'WY')
    .replace(/\s+/g, ' ')
    .trim();
}

async function checkFinalUnmatched() {
  console.log('🔍 Checking final unmatched addresses after corrections...\n');
  
  // Get all responses and properties
  const { data: responses } = await supabase
    .from('responses')
    .select('response_id, address, name')
    .not('address', 'is', null)
    .neq('address', '')
    .neq('address', 'Not provided');
    
  const { data: properties } = await supabase
    .from('properties')
    .select('address');
  
  // Apply our corrections
  const correctedResponses = applyCorrectedAddresses(responses);
  
  // Filter out the ones we're removing/ignoring
  const validResponses = correctedResponses.filter(r => 
    r.address && 
    r.address !== 'Keep current HOA landscaping'
  );
  
  console.log(`📊 After corrections: ${validResponses.length} responses with addresses\n`);
  
  // Check which ones will still be unmatched
  const unmatched = [];
  
  for (const response of validResponses) {
    const found = properties.find(p => 
      normalizeAddress(p.address) === normalizeAddress(response.address)
    );
    
    if (!found) {
      unmatched.push(response);
    }
  }
  
  console.log('❌ FINAL UNMATCHED ADDRESSES:');
  console.log('=' .repeat(50));
  
  if (unmatched.length === 0) {
    console.log('🎉 ALL ADDRESSES SUCCESSFULLY MATCHED!');
  } else {
    unmatched.forEach(r => {
      console.log(`Response ${String(r.response_id).padStart(3, '0')}: "${r.address}" by ${r.name || 'Unknown'}`);
    });
    
    console.log(`\nTotal unmatched: ${unmatched.length}`);
    console.log(`Success rate: ${Math.round((validResponses.length - unmatched.length) / validResponses.length * 100)}%`);
  }
}

checkFinalUnmatched().catch(console.error);