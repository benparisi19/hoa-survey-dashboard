const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugSpecificSurvey() {
  const surveyId = 'ac654339-e9d8-47f5-b330-bcb59e1c918e';
  
  console.log(`🔍 Testing edit page logic for survey: ${surveyId}\n`);

  try {
    // Simulate what the edit page does
    const { data, error } = await supabase
      .from('survey_definitions')
      .select('*')
      .eq('survey_definition_id', surveyId)
      .single();

    console.log('Database query result:');
    console.log('Error:', error);
    console.log('Data exists:', !!data);
    
    if (data) {
      console.log('\nSurvey data structure:');
      console.log('- survey_definition_id:', data.survey_definition_id);
      console.log('- survey_name:', data.survey_name);
      console.log('- survey_type:', data.survey_type);
      console.log('- response_schema type:', typeof data.response_schema);
      console.log('- response_schema:', JSON.stringify(data.response_schema, null, 2));
      console.log('- display_config:', JSON.stringify(data.display_config, null, 2));
      console.log('- targeting_config:', JSON.stringify(data.targeting_config, null, 2));
      
      // Test if this matches our SurveyDefinition type
      console.log('\nType compatibility check:');
      console.log('- Has sections array:', !!data.response_schema?.sections);
      console.log('- Sections count:', data.response_schema?.sections?.length || 0);
      
      if (data.response_schema?.sections) {
        data.response_schema.sections.forEach((section, index) => {
          console.log(`- Section ${index + 1}:`, section.title);
          console.log(`  Questions:`, section.questions?.length || 0);
          if (section.questions) {
            section.questions.forEach((q, qIndex) => {
              console.log(`    ${qIndex + 1}. ${q.text} (${q.type})`);
            });
          }
        });
      }
    }

  } catch (error) {
    console.error('💥 Error in debug:', error);
  }
}

debugSpecificSurvey();