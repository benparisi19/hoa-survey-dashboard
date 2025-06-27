/**
 * Geocoding Script for Property Addresses
 * 
 * This script fetches all properties without coordinates and geocodes them
 * using the Mapbox Geocoding API, then updates the database with lat/lng.
 * 
 * Usage:
 * node scripts/geocode-properties.js
 * 
 * Requirements:
 * - NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in .env
 * - SUPABASE_SERVICE_KEY in .env
 * - latitude/longitude columns added to properties table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const MAPBOX_API_BASE = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
const BATCH_SIZE = 10; // Process in batches to respect rate limits
const DELAY_MS = 100; // Delay between requests to avoid rate limiting

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Geocode a single address using Mapbox API
 */
async function geocodeAddress(address) {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `${MAPBOX_API_BASE}/${encodedAddress}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&limit=1&types=address`;
    
    console.log(`Geocoding: ${address}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.center;
      
      return {
        latitude,
        longitude,
        accuracy: feature.properties?.accuracy || 'unknown',
        place_name: feature.place_name,
        success: true
      };
    } else {
      console.warn(`No geocoding results for: ${address}`);
      return { success: false, error: 'No results found' };
    }
  } catch (error) {
    console.error(`Geocoding failed for ${address}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Update property with geocoded coordinates
 */
async function updatePropertyCoordinates(propertyId, geocodeResult) {
  try {
    const updateData = {
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude,
      geocoded_at: new Date().toISOString(),
      geocoding_accuracy: geocodeResult.accuracy
    };
    
    const { error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('property_id', propertyId);
    
    if (error) {
      throw error;
    }
    
    console.log(`✓ Updated property ${propertyId} with coordinates`);
    return true;
  } catch (error) {
    console.error(`Failed to update property ${propertyId}:`, error.message);
    return false;
  }
}

/**
 * Get properties that need geocoding
 */
async function getPropertiesToGeocode() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('property_id, address')
      .or('latitude.is.null,longitude.is.null')
      .order('address');
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch properties:', error.message);
    return [];
  }
}

/**
 * Sleep function for rate limiting
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main geocoding function
 */
async function geocodeAllProperties() {
  console.log('🗺️  Starting property geocoding process...\n');
  
  // Validate environment variables
  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    console.error('❌ Missing NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in .env file');
    process.exit(1);
  }
  
  if (!process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_KEY in .env file');
    process.exit(1);
  }
  
  // Get properties to geocode
  const properties = await getPropertiesToGeocode();
  
  if (properties.length === 0) {
    console.log('✅ All properties already have coordinates!');
    return;
  }
  
  console.log(`📍 Found ${properties.length} properties to geocode:\n`);
  
  let successCount = 0;
  let failureCount = 0;
  
  // Process properties in batches
  for (let i = 0; i < properties.length; i += BATCH_SIZE) {
    const batch = properties.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(properties.length / BATCH_SIZE)}`);
    
    for (const property of batch) {
      const geocodeResult = await geocodeAddress(property.address);
      
      if (geocodeResult.success) {
        const updated = await updatePropertyCoordinates(property.property_id, geocodeResult);
        if (updated) {
          successCount++;
        } else {
          failureCount++;
        }
      } else {
        console.error(`❌ Geocoding failed for ${property.address}: ${geocodeResult.error}`);
        failureCount++;
      }
      
      // Rate limiting delay
      await sleep(DELAY_MS);
    }
    
    // Longer delay between batches
    if (i + BATCH_SIZE < properties.length) {
      console.log('Waiting before next batch...\n');
      await sleep(1000);
    }
  }
  
  console.log('\n🎯 Geocoding complete!');
  console.log(`✅ Successfully geocoded: ${successCount} properties`);
  console.log(`❌ Failed to geocode: ${failureCount} properties`);
  
  if (failureCount > 0) {
    console.log('\nℹ️  Failed properties may need manual review of addresses');
  }
}

/**
 * Show geocoding statistics
 */
async function showStats() {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('property_id, address, latitude, longitude, geocoded_at');
    
    if (error) throw error;
    
    const total = data.length;
    const geocoded = data.filter(p => p.latitude && p.longitude).length;
    const needGeocoding = total - geocoded;
    
    console.log('\n📊 Geocoding Statistics:');
    console.log(`Total properties: ${total}`);
    console.log(`Geocoded: ${geocoded}`);
    console.log(`Need geocoding: ${needGeocoding}`);
    
    if (geocoded > 0) {
      console.log('\nRecently geocoded:');
      const recent = data
        .filter(p => p.geocoded_at)
        .sort((a, b) => new Date(b.geocoded_at) - new Date(a.geocoded_at))
        .slice(0, 5);
      
      recent.forEach(p => {
        console.log(`  ${p.address} (${new Date(p.geocoded_at).toLocaleString()})`);
      });
    }
  } catch (error) {
    console.error('Failed to get stats:', error.message);
  }
}

// Command line interface
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'stats':
      await showStats();
      break;
    case 'geocode':
    default:
      await geocodeAllProperties();
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { geocodeAllProperties, showStats };