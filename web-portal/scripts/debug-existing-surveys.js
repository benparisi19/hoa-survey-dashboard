const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugExistingSurveys() {
  console.log('🔍 Debugging existing surveys in database...\n');

  try {
    // Get all surveys with full data
    const { data: surveys, error } = await supabase
      .from('survey_definitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching surveys:', error);
      return;
    }

    console.log(`📊 Found ${surveys.length} surveys in database:\n`);

    surveys.forEach((survey, index) => {
      console.log(`Survey ${index + 1}:`);
      console.log(`  ID: ${survey.survey_definition_id}`);
      console.log(`  Name: ${survey.survey_name}`);
      console.log(`  Type: ${survey.survey_type}`);
      console.log(`  Description: ${survey.description || 'None'}`);
      console.log(`  Is Active: ${survey.is_active}`);
      console.log(`  Is Template: ${survey.is_template}`);
      console.log(`  Created: ${survey.created_at}`);
      console.log(`  Updated: ${survey.updated_at}`);
      
      // Check response_schema structure
      console.log(`  Response Schema Type: ${typeof survey.response_schema}`);
      if (survey.response_schema) {
        console.log(`  Response Schema Keys: ${Object.keys(survey.response_schema).join(', ')}`);
        if (survey.response_schema.sections) {
          console.log(`  Sections: ${survey.response_schema.sections.length}`);
          survey.response_schema.sections.forEach((section, sIndex) => {
            console.log(`    Section ${sIndex + 1}: ${section.title} (${section.questions?.length || 0} questions)`);
          });
        } else {
          console.log(`  No sections array found in response_schema`);
        }
      } else {
        console.log(`  No response_schema found`);
      }
      
      // Check display_config
      if (survey.display_config) {
        console.log(`  Display Config Keys: ${Object.keys(survey.display_config).join(', ')}`);
      } else {
        console.log(`  No display_config found`);
      }
      
      // Check targeting_config
      if (survey.targeting_config) {
        console.log(`  Targeting Config Keys: ${Object.keys(survey.targeting_config).join(', ')}`);
      } else {
        console.log(`  No targeting_config found`);
      }
      
      console.log(''); // Empty line between surveys
    });

    // Also check if we have any property_surveys
    console.log('🏠 Checking property_surveys table...');
    const { data: propertySurveys, error: psError } = await supabase
      .from('property_surveys')
      .select('survey_definition_id, count(*)')
      .group('survey_definition_id');

    if (psError) {
      console.error('❌ Error fetching property_surveys:', psError);
    } else {
      console.log(`Found ${propertySurveys.length} survey definition IDs with responses`);
      propertySurveys.forEach(ps => {
        console.log(`  Survey ${ps.survey_definition_id}: ${ps.count} responses`);
      });
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the debug
debugExistingSurveys();