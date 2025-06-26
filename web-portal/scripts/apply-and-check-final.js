#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function applyCorrectionsAndCheck() {
  console.log('🔄 Applying address corrections...\n');
  
  try {
    // Apply all the address corrections first
    const corrections = [
      { id: 2, address: null }, // Remove address
      { id: 69, address: '4055 E Goldstone Dr' },
      { id: 88, address: '4336 E Vacheron St' }, 
      { id: 10, address: '2054 S Defio Way' },
      { id: 80, address: '4168 E Esperanto St' },
      { id: 83, address: '4252 E Vacheron St' },
      { id: 100, address: '4031 E Blueberry St' },
      { id: 111, address: '4136 E Blueberry St' },
      { id: 77, address: '4040 E Esperanto St' },
      { id: 97, address: '4183 E Esperanto St' },
      { id: 110, address: '4148 E Blueberry St' },
      { id: 90, address: '4357 E Vacheron St' }
    ];
    
    for (const correction of corrections) {
      const { error } = await supabase
        .from('responses')
        .update({ address: correction.address })
        .eq('response_id', correction.id);
        
      if (error) {
        console.error(`Error updating response ${correction.id}:`, error);
      } else {
        console.log(`✅ Updated response ${correction.id}: ${correction.address || 'NULL'}`);
      }
    }
    
    console.log('\n🔍 Checking remaining unmatched addresses...\n');
    
    // Get all responses with addresses after corrections
    const { data: responses } = await supabase
      .from('responses')
      .select('response_id, address, name')
      .not('address', 'is', null)
      .neq('address', '')
      .neq('address', 'Not provided')
      .neq('address', 'Keep current HOA landscaping');
      
    const { data: properties } = await supabase
      .from('properties')
      .select('address');
    
    console.log(`📊 Total responses with valid addresses: ${responses.length}`);
    
    // Check which addresses don't match any property
    const unmatched = [];
    
    for (const response of responses) {
      const normalizedResponseAddr = response.address
        .trim()
        .toUpperCase()
        .replace(/\bE\./g, 'E')
        .replace(/\bS\./g, 'S')
        .replace(/\bDRIVE\b/g, 'DR')
        .replace(/\bSTREET\b/g, 'ST')
        .replace(/\bPLACE\b/g, 'PL')
        .replace(/\s+/g, ' ')
        .trim();
        
      const found = properties.find(p => {
        const normalizedPropAddr = p.address
          .trim()
          .toUpperCase()
          .replace(/\s+/g, ' ')
          .trim();
        return normalizedPropAddr === normalizedResponseAddr;
      });
      
      if (!found) {
        unmatched.push(response);
      }
    }
    
    console.log('\n❌ REMAINING UNMATCHED ADDRESSES:');
    console.log('=' .repeat(60));
    
    if (unmatched.length === 0) {
      console.log('🎉 ALL ADDRESSES SUCCESSFULLY MATCHED!');
    } else {
      unmatched.forEach(r => {
        console.log(`Response ${String(r.response_id).padStart(3, '0')}: "${r.address}" by ${r.name || 'Unknown'}`);
      });
      
      console.log(`\n📈 FINAL STATISTICS:`);
      console.log(`Total valid addresses: ${responses.length}`);
      console.log(`Successfully matchable: ${responses.length - unmatched.length}`);
      console.log(`Still unmatched: ${unmatched.length}`);
      console.log(`Success rate: ${Math.round((responses.length - unmatched.length) / responses.length * 100)}%`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

applyCorrectionsAndCheck().catch(console.error);