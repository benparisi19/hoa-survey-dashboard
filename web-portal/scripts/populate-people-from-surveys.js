const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Parse contact information from survey responses
function parseContactInfo(contactString) {
  if (!contactString || typeof contactString !== 'string') {
    return { email: null, phone: null, preferred_contact_method: 'email' };
  }

  const emailMatch = contactString.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = contactString.match(/(\(?\d{3}\)?[-.\\s]?\d{3}[-.\\s]?\d{4}|\d{10})/);
  
  return {
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3') : null,
    preferred_contact_method: emailMatch ? 'email' : 'phone'
  };
}

// Clean and parse name
function parseName(nameString) {
  if (!nameString || typeof nameString !== 'string' || nameString.toLowerCase() === 'anonymous') {
    return null;
  }
  
  const cleanName = nameString.trim();
  const nameParts = cleanName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  if (!firstName) return null;
  
  return {
    first_name: firstName,
    last_name: lastName,
    full_name: cleanName
  };
}

async function populatePeopleFromSurveys() {
  console.log('🏠 Starting population of people and property_residents tables from survey responses...\n');

  try {
    // 1. Get all survey responses with contact info and addresses
    console.log('📊 Fetching survey responses...');
    const { data: responses, error: responseError } = await supabase
      .from('complete_responses')
      .select(`
        response_id,
        name,
        email_contact,
        address
      `)
      .not('name', 'is', null)
      .not('name', 'eq', '')
      .not('name', 'ilike', 'anonymous');

    if (responseError) {
      throw responseError;
    }

    console.log(`Found ${responses.length} survey responses with names\n`);

    // 2. Get existing properties to link people to
    console.log('🏘️ Fetching properties for address matching...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('property_id, address');

    if (propertiesError) {
      throw propertiesError;
    }

    console.log(`Found ${properties.length} properties\n`);

    // 3. Create address lookup map (normalize addresses for matching)
    const addressMap = new Map();
    properties.forEach(property => {
      const normalizedAddress = property.address.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .trim();
      addressMap.set(normalizedAddress, property.property_id);
    });

    // 4. Process each response
    const peopleToCreate = new Map(); // key: email+name, value: person data
    const residentsToCreate = [];
    let matchedAddresses = 0;
    let unmatchedAddresses = 0;

    console.log('👥 Processing survey responses...');

    for (const response of responses) {
      const nameInfo = parseName(response.name);
      if (!nameInfo) continue;

      const contactInfo = parseContactInfo(response.email_contact);
      
      // Create unique key for person (prefer email, fallback to name)
      const personKey = contactInfo.email ? 
        `${contactInfo.email.toLowerCase()}` : 
        `${nameInfo.first_name.toLowerCase()}_${nameInfo.last_name.toLowerCase()}`;

      // Store person info (will deduplicate)
      if (!peopleToCreate.has(personKey)) {
        peopleToCreate.set(personKey, {
          first_name: nameInfo.first_name,
          last_name: nameInfo.last_name,
          email: contactInfo.email,
          phone: contactInfo.phone,
          preferred_contact_method: contactInfo.preferred_contact_method,
          is_official_owner: false // We'll assume unknown for now
        });
      }

      // Try to match address to property
      if (response.address) {
        const normalizedResponseAddress = response.address.toLowerCase()
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s]/g, '')
          .trim();

        const propertyId = addressMap.get(normalizedResponseAddress);
        
        if (propertyId) {
          matchedAddresses++;
          residentsToCreate.push({
            person_key: personKey,
            property_id: propertyId,
            relationship_type: 'owner', // Default to owner since they're filling out HOA survey
            is_primary_contact: true, // Assume survey respondent is primary contact
            is_hoa_responsible: true,
            start_date: '2024-01-01', // Default start date
            notes: `Populated from survey response ${response.response_id}`
          });
        } else {
          unmatchedAddresses++;
          console.log(`   ⚠️  Could not match address: "${response.address}" for ${nameInfo.full_name}`);
        }
      }
    }

    console.log(`\n📈 Processing Summary:`);
    console.log(`   • Unique people found: ${peopleToCreate.size}`);
    console.log(`   • Address matches: ${matchedAddresses}`);
    console.log(`   • Unmatched addresses: ${unmatchedAddresses}`);
    console.log(`   • Property relationships to create: ${residentsToCreate.length}\n`);

    // 5. Insert people first
    console.log('👤 Creating people records...');
    const peopleArray = Array.from(peopleToCreate.values());
    
    const { data: insertedPeople, error: peopleError } = await supabase
      .from('people')
      .insert(peopleArray)
      .select('person_id, first_name, last_name, email');

    if (peopleError) {
      throw peopleError;
    }

    console.log(`✅ Created ${insertedPeople.length} people records\n`);

    // 6. Create person_id lookup map
    const personIdMap = new Map();
    insertedPeople.forEach(person => {
      const personKey = person.email ? 
        person.email.toLowerCase() : 
        `${person.first_name.toLowerCase()}_${person.last_name.toLowerCase()}`;
      personIdMap.set(personKey, person.person_id);
    });

    // 7. Insert property residents
    console.log('🏠 Creating property resident relationships...');
    const residentsWithIds = residentsToCreate
      .map(resident => {
        const personId = personIdMap.get(resident.person_key);
        if (!personId) {
          console.log(`   ⚠️  Could not find person_id for key: ${resident.person_key}`);
          return null;
        }
        
        return {
          person_id: personId,
          property_id: resident.property_id,
          relationship_type: resident.relationship_type,
          is_primary_contact: resident.is_primary_contact,
          is_hoa_responsible: resident.is_hoa_responsible,
          start_date: resident.start_date,
          notes: resident.notes
        };
      })
      .filter(Boolean);

    if (residentsWithIds.length > 0) {
      const { data: insertedResidents, error: residentsError } = await supabase
        .from('property_residents')
        .insert(residentsWithIds)
        .select('resident_id');

      if (residentsError) {
        throw residentsError;
      }

      console.log(`✅ Created ${insertedResidents.length} property resident relationships\n`);
    }

    // 8. Summary
    console.log('🎉 Population Complete!');
    console.log('=' .repeat(50));
    console.log(`📊 Final Results:`);
    console.log(`   • People created: ${insertedPeople.length}`);
    console.log(`   • Property relationships: ${residentsWithIds.length}`);
    console.log(`   • Survey responses processed: ${responses.length}`);
    console.log(`   • Address match rate: ${(matchedAddresses / responses.length * 100).toFixed(1)}%`);
    
    // 9. Show some examples
    console.log(`\n👥 Sample people created:`);
    insertedPeople.slice(0, 5).forEach(person => {
      console.log(`   • ${person.first_name} ${person.last_name} ${person.email ? `(${person.email})` : ''}`);
    });

    if (unmatchedAddresses > 0) {
      console.log(`\n⚠️  Note: ${unmatchedAddresses} addresses could not be matched to existing properties.`);
      console.log(`   These people were created but not linked to properties.`);
      console.log(`   You can manually link them later through the property detail pages.`);
    }

  } catch (error) {
    console.error('❌ Error populating people from surveys:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  populatePeopleFromSurveys()
    .then(() => {
      console.log('\n✨ Script completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { populatePeopleFromSurveys };