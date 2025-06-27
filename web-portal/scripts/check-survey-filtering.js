const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSurveyFiltering() {
  console.log('🔍 Checking survey filtering logic...\n');

  try {
    // Simulate exactly what the surveys page does
    const { data: surveys, error } = await supabase
      .from('survey_definitions')
      .select(`
        survey_definition_id,
        survey_name,
        survey_type,
        description,
        is_active,
        is_template,
        template_category,
        active_period_start,
        active_period_end,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching surveys:', error);
      return;
    }

    console.log(`📊 Total surveys found: ${surveys.length}\n`);

    // Apply the same filtering logic as the page
    const activeSurveys = surveys.filter(s => !s.is_template && s.is_active);
    const templates = surveys.filter(s => s.is_template);
    const draftSurveys = surveys.filter(s => !s.is_template && !s.is_active);

    console.log(`🟢 Active Surveys (not template + is_active): ${activeSurveys.length}`);
    activeSurveys.forEach(survey => {
      console.log(`   - ${survey.survey_name} (is_template: ${survey.is_template}, is_active: ${survey.is_active})`);
    });

    console.log(`\n📋 Templates (is_template): ${templates.length}`);
    templates.forEach(survey => {
      console.log(`   - ${survey.survey_name} (is_template: ${survey.is_template}, is_active: ${survey.is_active})`);
    });

    console.log(`\n📝 Draft Surveys (not template + not active): ${draftSurveys.length}`);
    draftSurveys.forEach(survey => {
      console.log(`   - ${survey.survey_name} (is_template: ${survey.is_template}, is_active: ${survey.is_active})`);
    });

    console.log('\n🔍 Detailed survey analysis:');
    surveys.forEach((survey, index) => {
      console.log(`\nSurvey ${index + 1}: ${survey.survey_name}`);
      console.log(`  - is_template: ${survey.is_template} (type: ${typeof survey.is_template})`);
      console.log(`  - is_active: ${survey.is_active} (type: ${typeof survey.is_active})`);
      console.log(`  - Filter results:`);
      console.log(`    * Not template: ${!survey.is_template}`);
      console.log(`    * Is active: ${survey.is_active}`);
      console.log(`    * Would show in Active: ${!survey.is_template && survey.is_active}`);
      console.log(`    * Would show in Templates: ${survey.is_template}`);
      console.log(`    * Would show in Drafts: ${!survey.is_template && !survey.is_active}`);
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkSurveyFiltering();