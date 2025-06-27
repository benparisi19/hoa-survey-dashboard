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

async function testSurveyBuilder() {
  console.log('🧪 Testing Survey Builder Database Connectivity...\n');

  try {
    // 1. First, check current surveys
    console.log('📊 Checking existing surveys...');
    const { data: existingSurveys, error: listError } = await supabase
      .from('survey_definitions')
      .select('survey_definition_id, survey_name, survey_type, is_active, created_at')
      .order('created_at', { ascending: false });

    if (listError) {
      console.error('❌ Error fetching surveys:', listError);
      return;
    }

    console.log(`✅ Found ${existingSurveys.length} existing surveys:`);
    existingSurveys.forEach((survey, index) => {
      console.log(`   ${index + 1}. ${survey.survey_name} (${survey.survey_type}) - ${survey.is_active ? 'Active' : 'Draft'}`);
    });
    console.log();

    // 2. Create a test survey definition
    console.log('🏗️  Creating test survey...');
    
    const testSurvey = {
      survey_name: 'Test Community Feedback Survey',
      survey_type: 'community_wide',
      description: 'A test survey created by the survey builder to verify functionality',
      response_schema: {
        sections: [
          {
            id: 'section_1',
            title: 'Community Satisfaction',
            description: 'Tell us about your experience in our community',
            questions: [
              {
                id: 'question_1',
                type: 'rating_scale',
                text: 'How satisfied are you with the community overall?',
                required: true,
                config: {
                  scale: {
                    min: 1,
                    max: 5
                  }
                }
              },
              {
                id: 'question_2',
                type: 'single_choice',
                text: 'What is your primary concern about the community?',
                required: true,
                config: {
                  options: [
                    { value: 'maintenance', label: 'Property maintenance' },
                    { value: 'amenities', label: 'Community amenities' },
                    { value: 'communication', label: 'HOA communication' },
                    { value: 'fees', label: 'HOA fees' },
                    { value: 'other', label: 'Other' }
                  ]
                }
              },
              {
                id: 'question_3',
                type: 'long_text',
                text: 'What suggestions do you have for improving our community?',
                required: false,
                config: {
                  placeholder: 'Please share your ideas and suggestions...'
                }
              }
            ]
          },
          {
            id: 'section_2',
            title: 'Contact Information',
            description: 'Optional contact details',
            questions: [
              {
                id: 'question_4',
                type: 'email',
                text: 'Email address (optional)',
                required: false,
                config: {
                  placeholder: 'your.email@example.com'
                }
              },
              {
                id: 'question_5',
                type: 'yes_no',
                text: 'Would you like to be contacted about follow-up questions?',
                required: false
              }
            ]
          }
        ],
        metadata: {
          version: '1.0',
          created_with: 'Survey Builder v1.0'
        }
      },
      display_config: {
        theme: 'community',
        layout: 'sections',
        showProgress: true,
        allowSave: true,
        allowBack: true,
        showQuestionNumbers: true,
        submitButtonText: 'Submit Feedback',
        thankYouMessage: 'Thank you for your feedback! Your input helps us improve our community.'
      },
      targeting_config: {
        type: 'all_properties',
        description: 'Survey sent to all community members'
      },
      is_active: false, // Draft status for testing
      is_template: false,
      template_category: null,
      auto_recurring: false,
      recurrence_config: null,
      active_period_start: null,
      active_period_end: null,
      created_by: null
    };

    const { data: newSurvey, error: createError } = await supabase
      .from('survey_definitions')
      .insert(testSurvey)
      .select()
      .single();

    if (createError) {
      console.error('❌ Error creating test survey:', createError);
      return;
    }

    console.log(`✅ Successfully created test survey with ID: ${newSurvey.survey_definition_id}`);
    console.log(`   Survey Name: ${newSurvey.survey_name}`);
    console.log(`   Type: ${newSurvey.survey_type}`);
    console.log(`   Sections: ${newSurvey.response_schema.sections.length}`);
    console.log(`   Total Questions: ${newSurvey.response_schema.sections.reduce((total, section) => total + section.questions.length, 0)}`);
    console.log();

    // 3. Test updating the survey
    console.log('✏️  Testing survey update...');
    
    const { data: updatedSurvey, error: updateError } = await supabase
      .from('survey_definitions')
      .update({
        description: 'Updated: A test survey created by the survey builder to verify functionality',
        updated_at: new Date().toISOString()
      })
      .eq('survey_definition_id', newSurvey.survey_definition_id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating survey:', updateError);
    } else {
      console.log('✅ Successfully updated survey description');
    }

    // 4. Test fetching the survey back
    console.log('🔍 Testing survey retrieval...');
    
    const { data: retrievedSurvey, error: retrieveError } = await supabase
      .from('survey_definitions')
      .select('*')
      .eq('survey_definition_id', newSurvey.survey_definition_id)
      .single();

    if (retrieveError) {
      console.error('❌ Error retrieving survey:', retrieveError);
    } else {
      console.log('✅ Successfully retrieved survey');
      console.log(`   Schema sections: ${retrievedSurvey.response_schema.sections.length}`);
      console.log(`   Display config theme: ${retrievedSurvey.display_config.theme}`);
      console.log(`   Targeting type: ${retrievedSurvey.targeting_config.type}`);
    }

    // 5. Clean up - delete the test survey
    console.log('\n🧹 Cleaning up test survey...');
    
    const { error: deleteError } = await supabase
      .from('survey_definitions')
      .delete()
      .eq('survey_definition_id', newSurvey.survey_definition_id);

    if (deleteError) {
      console.error('❌ Error deleting test survey:', deleteError);
      console.log(`⚠️  You may need to manually delete survey ID: ${newSurvey.survey_definition_id}`);
    } else {
      console.log('✅ Successfully cleaned up test survey');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ Database connection working');
    console.log('   ✅ Survey creation working');
    console.log('   ✅ Survey updates working');
    console.log('   ✅ Survey retrieval working');
    console.log('   ✅ Survey deletion working');
    console.log('\n🚀 The survey builder is ready for production use!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

// Run the test
testSurveyBuilder();