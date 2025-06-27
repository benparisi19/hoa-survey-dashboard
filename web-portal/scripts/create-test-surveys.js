const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestSurveys() {
  console.log('🚀 Creating test surveys for demonstration...\n');

  const surveys = [
    {
      survey_name: 'Quick Community Pulse Check',
      survey_type: 'community_wide',
      description: 'A brief survey to gauge current community sentiment',
      response_schema: {
        sections: [
          {
            id: 'pulse_check',
            title: 'Community Pulse',
            description: 'Quick questions about your community experience',
            questions: [
              {
                id: 'satisfaction',
                type: 'rating_scale',
                text: 'How satisfied are you with our community overall?',
                required: true,
                config: {
                  scale: { min: 1, max: 5 }
                }
              },
              {
                id: 'priority_issue',
                type: 'single_choice',
                text: 'What should be our top priority?',
                required: true,
                config: {
                  options: [
                    { value: 'maintenance', label: 'Property maintenance' },
                    { value: 'amenities', label: 'Community amenities' },
                    { value: 'communication', label: 'Better communication' },
                    { value: 'security', label: 'Security improvements' }
                  ]
                }
              }
            ]
          }
        ]
      },
      display_config: {
        theme: 'default',
        layout: 'sections',
        showProgress: true,
        allowSave: true,
        allowBack: true,
        showQuestionNumbers: true,
        submitButtonText: 'Submit Feedback',
        thankYouMessage: 'Thank you for your feedback!'
      },
      targeting_config: {
        type: 'all_properties'
      },
      is_active: true,
      is_template: false,
      auto_recurring: false
    },
    {
      survey_name: 'Maintenance Feedback Survey',
      survey_type: 'property_specific',
      description: 'Survey about recent maintenance work in your area',
      response_schema: {
        sections: [
          {
            id: 'maintenance_feedback',
            title: 'Recent Maintenance',
            questions: [
              {
                id: 'work_quality',
                type: 'rating_scale',
                text: 'How would you rate the quality of recent maintenance work?',
                required: true,
                config: {
                  scale: { min: 1, max: 5 }
                }
              },
              {
                id: 'work_issues',
                type: 'multiple_choice',
                text: 'Were there any issues with the maintenance work? (Select all that apply)',
                required: false,
                config: {
                  options: [
                    { value: 'timing', label: 'Poor timing/scheduling' },
                    { value: 'quality', label: 'Poor quality work' },
                    { value: 'cleanup', label: 'Inadequate cleanup' },
                    { value: 'communication', label: 'Lack of communication' },
                    { value: 'none', label: 'No issues' }
                  ]
                }
              },
              {
                id: 'additional_comments',
                type: 'long_text',
                text: 'Any additional comments about the maintenance work?',
                required: false,
                config: {
                  placeholder: 'Please share any additional feedback...'
                }
              }
            ]
          }
        ]
      },
      display_config: {
        theme: 'professional',
        layout: 'sections',
        showProgress: true,
        allowSave: true,
        allowBack: true,
        showQuestionNumbers: true,
        submitButtonText: 'Submit Feedback',
        thankYouMessage: 'Thank you for helping us improve our maintenance services!'
      },
      targeting_config: {
        type: 'property_filter',
        criteria: {
          zones: ['Zone A', 'Zone B']
        }
      },
      is_active: false,
      is_template: false,
      auto_recurring: false
    }
  ];

  try {
    for (const survey of surveys) {
      const { data, error } = await supabase
        .from('survey_definitions')
        .insert(survey)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating survey "${survey.survey_name}":`, error);
      } else {
        console.log(`✅ Created survey: "${data.survey_name}" (ID: ${data.survey_definition_id})`);
        console.log(`   Type: ${data.survey_type}, Status: ${data.is_active ? 'Active' : 'Draft'}`);
      }
    }

    console.log('\n🎉 Test surveys created successfully!');
    console.log('\nYou should now see:');
    console.log('- 1 Template (Annual Community Satisfaction Template)');
    console.log('- 1 Active Survey (Quick Community Pulse Check)');
    console.log('- 1 Draft Survey (Maintenance Feedback Survey)');
    console.log('\n🔧 Try editing the existing template to test the fix!');

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

createTestSurveys();