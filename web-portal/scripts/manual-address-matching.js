#!/usr/bin/env node

/**
 * Manual Address Matching Script
 * Connects directly to Supabase to perform intelligent fuzzy matching
 * between survey responses and the newly imported property directory
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role for write access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Normalize address for comparison
 * Handles common variations and typos
 */
function normalizeAddress(address) {
  if (!address) return '';
  
  return address
    .trim()
    .toUpperCase()
    // Remove periods from abbreviations
    .replace(/\bE\./g, 'E')
    .replace(/\bS\./g, 'S')
    .replace(/\bN\./g, 'N')
    .replace(/\bW\./g, 'W')
    // Standardize street types
    .replace(/\bDRIVE\b/g, 'DR')
    .replace(/\bSTREET\b/g, 'ST')
    .replace(/\bAVENUE\b/g, 'AVE')
    .replace(/\bPLACE\b/g, 'PL')
    .replace(/\bWAY\b/g, 'WY')
    .replace(/\bCOURT\b/g, 'CT')
    .replace(/\bLANE\b/g, 'LN')
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate similarity score between two addresses
 * Returns 0-1 where 1 is exact match
 */
function calculateSimilarity(addr1, addr2) {
  const norm1 = normalizeAddress(addr1);
  const norm2 = normalizeAddress(addr2);
  
  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;
  
  // Check if one contains the other (for partial matches)
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return 0.8;
  }
  
  // Simple character-based similarity
  const maxLen = Math.max(norm1.length, norm2.length);
  const minLen = Math.min(norm1.length, norm2.length);
  
  // If lengths are very different, probably not a match
  if (maxLen / minLen > 2) return 0.0;
  
  // Count matching characters in similar positions
  let matches = 0;
  for (let i = 0; i < minLen; i++) {
    if (norm1[i] === norm2[i]) matches++;
  }
  
  return matches / maxLen;
}

/**
 * Find best property match for a survey address
 */
function findBestMatch(surveyAddress, properties) {
  let bestMatch = null;
  let bestScore = 0;
  
  for (const property of properties) {
    const score = calculateSimilarity(surveyAddress, property.address);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = { ...property, score };
    }
  }
  
  return bestMatch;
}

/**
 * Main analysis function
 */
async function analyzeAddressMatching() {
  console.log('🔍 Starting address matching analysis...\n');
  
  try {
    // Fetch all survey responses with addresses
    console.log('📊 Fetching survey responses...');
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('response_id, address, name, email_contact')
      .not('address', 'is', null)
      .neq('address', '')
      .neq('address', 'Not provided');
      
    if (responsesError) {
      throw new Error(`Error fetching responses: ${responsesError.message}`);
    }
    
    console.log(`✅ Found ${responses.length} survey responses with addresses\n`);
    
    // Fetch all properties
    console.log('🏘️  Fetching property directory...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('property_id, address, lot_number, hoa_zone, street_group');
      
    if (propertiesError) {
      throw new Error(`Error fetching properties: ${propertiesError.message}`);
    }
    
    console.log(`✅ Found ${properties.length} properties in directory\n`);
    
    // Analyze matches
    console.log('🔄 Performing fuzzy address matching...\n');
    
    const results = {
      exactMatches: [],
      fuzzyMatches: [],
      noMatches: [],
      duplicateProperties: new Map()
    };
    
    for (const response of responses) {
      const match = findBestMatch(response.address, properties);
      
      if (match) {
        if (match.score === 1.0) {
          results.exactMatches.push({
            response,
            property: match,
            matchType: 'EXACT'
          });
        } else if (match.score >= 0.7) {
          results.fuzzyMatches.push({
            response,
            property: match,
            matchType: 'FUZZY',
            confidence: Math.round(match.score * 100)
          });
        } else {
          results.noMatches.push({
            response,
            bestGuess: match.score > 0.3 ? match : null
          });
        }
        
        // Track duplicate property assignments
        if (match.score >= 0.7) {
          const propKey = match.property_id;
          if (!results.duplicateProperties.has(propKey)) {
            results.duplicateProperties.set(propKey, []);
          }
          results.duplicateProperties.get(propKey).push(response);
        }
      } else {
        results.noMatches.push({ response, bestGuess: null });
      }
    }
    
    // Display results
    console.log('📈 MATCHING RESULTS SUMMARY');
    console.log('=' .repeat(50));
    console.log(`📍 Exact Matches: ${results.exactMatches.length}`);
    console.log(`🎯 Fuzzy Matches: ${results.fuzzyMatches.length}`);
    console.log(`❌ No Matches: ${results.noMatches.length}`);
    console.log(`🔄 Total Responses: ${responses.length}\n`);
    
    // Show exact matches
    if (results.exactMatches.length > 0) {
      console.log('✅ EXACT MATCHES');
      console.log('-'.repeat(50));
      for (const match of results.exactMatches) {
        console.log(`${match.response.address} → ${match.property.address} (Lot ${match.property.lot_number}, Zone ${match.property.hoa_zone})`);
      }
      console.log('');
    }
    
    // Show fuzzy matches for review
    if (results.fuzzyMatches.length > 0) {
      console.log('🎯 FUZZY MATCHES (NEED REVIEW)');
      console.log('-'.repeat(50));
      for (const match of results.fuzzyMatches) {
        console.log(`${match.confidence}% - "${match.response.address}" → "${match.property.address}"`);
        console.log(`     Survey by: ${match.response.name || 'Unknown'}`);
        console.log(`     Property: Lot ${match.property.lot_number}, Zone ${match.property.hoa_zone}, ${match.property.street_group}`);
        console.log('');
      }
    }
    
    // Show unmatched addresses
    if (results.noMatches.length > 0) {
      console.log('❌ UNMATCHED SURVEY ADDRESSES');
      console.log('-'.repeat(50));
      for (const noMatch of results.noMatches) {
        console.log(`"${noMatch.response.address}" - ${noMatch.response.name || 'Unknown'}`);
        if (noMatch.bestGuess) {
          console.log(`     Best guess: "${noMatch.bestGuess.address}" (${Math.round(noMatch.bestGuess.score * 100)}% similarity)`);
        }
        console.log('');
      }
    }
    
    // Check for duplicate property assignments
    const duplicates = Array.from(results.duplicateProperties.entries())
      .filter(([propId, responses]) => responses.length > 1);
      
    if (duplicates.length > 0) {
      console.log('⚠️  POTENTIAL DUPLICATE ASSIGNMENTS');
      console.log('-'.repeat(50));
      for (const [propId, responseList] of duplicates) {
        const property = properties.find(p => p.property_id === propId);
        console.log(`Property: ${property.address} (Lot ${property.lot_number})`);
        for (const response of responseList) {
          console.log(`  - Survey: "${response.address}" by ${response.name || 'Unknown'}`);
        }
        console.log('');
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    process.exit(1);
  }
}

/**
 * Generate SQL update script for confirmed matches
 */
function generateUpdateScript(results) {
  console.log('\n🔧 GENERATING UPDATE SCRIPT');
  console.log('=' .repeat(50));
  
  const updates = [];
  
  // Add exact matches
  for (const match of results.exactMatches) {
    updates.push({
      responseId: match.response.response_id,
      propertyId: match.property.property_id,
      confidence: 'EXACT',
      surveyAddress: match.response.address,
      propertyAddress: match.property.address
    });
  }
  
  // Add high-confidence fuzzy matches (90%+)
  const highConfidenceMatches = results.fuzzyMatches.filter(m => m.confidence >= 90);
  for (const match of highConfidenceMatches) {
    updates.push({
      responseId: match.response.response_id,
      propertyId: match.property.property_id,
      confidence: `FUZZY_${match.confidence}%`,
      surveyAddress: match.response.address,
      propertyAddress: match.property.address
    });
  }
  
  if (updates.length === 0) {
    console.log('No automatic updates recommended. All matches need manual review.');
    return;
  }
  
  console.log(`Generating ${updates.length} automatic updates...`);
  console.log('\nSQL UPDATE SCRIPT:');
  console.log('-'.repeat(30));
  
  for (const update of updates) {
    console.log(`-- ${update.confidence}: "${update.surveyAddress}" → "${update.propertyAddress}"`);
    console.log(`UPDATE responses SET property_id = '${update.propertyId}' WHERE response_id = ${update.responseId};`);
    console.log('');
  }
  
  console.log('-- Verify the updates');
  console.log(`SELECT r.response_id, r.address as survey_address, p.address as property_address, p.lot_number, p.hoa_zone`);
  console.log(`FROM responses r`);
  console.log(`JOIN properties p ON r.property_id = p.property_id`);
  console.log(`WHERE r.response_id IN (${updates.map(u => u.responseId).join(', ')});`);
}

// Run the analysis
if (require.main === module) {
  analyzeAddressMatching()
    .then(results => {
      generateUpdateScript(results);
      console.log('\n✅ Analysis complete!');
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { analyzeAddressMatching, normalizeAddress, calculateSimilarity };