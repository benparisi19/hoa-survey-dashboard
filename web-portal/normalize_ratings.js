const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vohotwsicnxjpninkukw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaG90d3NpY254anBuaW5rdWt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDcxNTQ5OSwiZXhwIjoyMDY2MjkxNDk5fQ.91MxEbst3D6SXwCCTourIcMJR3guKv5OpbqgbdoHHsY'
);

// Normalization function
function normalizeServiceRating(rating) {
  if (!rating || rating.trim() === '') {
    return null;
  }

  const ratingLower = rating.toLowerCase();

  if (ratingLower.includes('not marked')) {
    return 'Not Specified';
  }

  const ratingHierarchy = {
    'very poor': 1,
    'poor': 2,
    'fair': 3,
    'good': 4,
    'excellent': 5,
  };

  const mentionedRatings = [];
  
  Object.entries(ratingHierarchy).forEach(([ratingName, value]) => {
    if (ratingLower.includes(ratingName)) {
      mentionedRatings.push({ rating: ratingName, value });
    }
  });

  if (mentionedRatings.length > 0) {
    const worstRating = mentionedRatings.reduce((worst, current) => 
      current.value < worst.value ? current : worst
    );
    
    switch (worstRating.rating) {
      case 'very poor': return 'Very Poor';
      case 'poor': return 'Poor';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'excellent': return 'Excellent';
      default: return 'Not Specified';
    }
  }

  return 'Not Specified';
}

async function updateRatings() {
  // First, get all current ratings
  const { data: ratings, error: fetchError } = await supabase
    .from('q1_q2_preference_rating')
    .select('response_id, q2_service_rating');
  
  if (fetchError) {
    console.error('Error fetching ratings:', fetchError);
    return;
  }

  console.log('Processing', ratings.length, 'records...');
  
  // Process each record
  let normalizedCounts = {};
  let updates = [];
  
  for (const record of ratings) {
    const original = record.q2_service_rating;
    const normalized = normalizeServiceRating(original);
    
    if (normalized !== original) {
      updates.push({
        response_id: record.response_id,
        original: original,
        normalized: normalized
      });
    }
    
    normalizedCounts[normalized] = (normalizedCounts[normalized] || 0) + 1;
  }
  
  console.log('\nUpdates needed:', updates.length);
  updates.forEach(update => {
    console.log(`${update.response_id}: "${update.original}" → "${update.normalized}"`);
  });
  
  console.log('\nNormalized Rating Distribution:');
  Object.entries(normalizedCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([rating, count]) => {
      console.log(`${rating}: ${count}`);
    });

  // Update records one by one
  console.log('\nUpdating database...');
  for (const update of updates) {
    const { error } = await supabase
      .from('q1_q2_preference_rating')
      .update({ q2_service_rating: update.normalized })
      .eq('response_id', update.response_id);
    
    if (error) {
      console.error(`Error updating ${update.response_id}:`, error);
    } else {
      console.log(`Updated ${update.response_id}`);
    }
  }
  
  console.log('Update complete!');
}

updateRatings();