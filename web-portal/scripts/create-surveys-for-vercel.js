const { createClient } = require('@supabase/supabase-js');

// Use the exact same environment variables that Vercel would use
const supabaseUrl = 'https://vohotwsicnxjpninkukw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvaG90d3NpY254anBuaW5rdWt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDcxNTQ5OSwiZXhwIjoyMDY2MjkxNDk5fQ.91MxEbst3D6SXwCCTourIcMJR3guKv5OpbqgbdoHHsY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSurveysForVercel() {
  console.log('🔧 Creating surveys directly with hardcoded credentials (same as Vercel)...\n');

  try {
    // First, check what exists
    const { data: existing, error: listError } = await supabase
      .from('survey_definitions')
      .select('survey_definition_id, survey_name, created_at')
      .order('created_at', { ascending: false });

    if (listError) {
      console.error('❌ Error fetching existing surveys:', listError);
      return;
    }

    console.log(`📊 Current surveys in database: ${existing.length}`);
    existing.forEach((s, i) => {
      console.log(`   ${i + 1}. ${s.survey_name} (${s.survey_definition_id})`);
    });

    // Create the surveys that Vercel should see
    const newSurveys = [
      {
        survey_name: 'Community Health Survey',
        survey_type: 'community_wide',
        description: 'Monthly survey about community wellbeing and satisfaction',
        response_schema: {
          sections: [
            {
              id: 'health_section',
              title: 'Community Health',
              questions: [
                {
                  id: 'overall_health',
                  type: 'rating_scale',
                  text: 'How would you rate the overall health of our community?',
                  required: true,
                  config: { scale: { min: 1, max: 5 } }
                }
              ]
            }
          ]
        },
        display_config: {
          theme: 'community',
          layout: 'sections',
          showProgress: true,
          allowSave: true,
          allowBack: true,
          showQuestionNumbers: true,
          submitButtonText: 'Submit',
          thankYouMessage: 'Thank you!'
        },
        targeting_config: { type: 'all_properties' },
        is_active: true,
        is_template: false,
        auto_recurring: false
      },
      {
        survey_name: 'Winter Preparation Survey',
        survey_type: 'property_specific',
        description: 'Survey about winter preparation and maintenance needs',
        response_schema: {
          sections: [
            {
              id: 'winter_prep',
              title: 'Winter Preparation',
              questions: [
                {
                  id: 'heating_readiness',
                  type: 'yes_no',
                  text: 'Is your heating system ready for winter?',
                  required: true
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
          submitButtonText: 'Submit',
          thankYouMessage: 'Thank you!'
        },
        targeting_config: { type: 'all_properties' },
        is_active: false,
        is_template: false,
        auto_recurring: false
      }
    ];

    console.log('\n🚀 Creating new surveys...');
    
    for (const survey of newSurveys) {
      const { data, error } = await supabase
        .from('survey_definitions')
        .insert(survey)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating "${survey.survey_name}":`, error);
      } else {
        console.log(`✅ Created: ${data.survey_name} (${data.is_active ? 'Active' : 'Draft'})`);
      }
    }

    // Verify the final count
    const { data: final, error: finalError } = await supabase
      .from('survey_definitions')
      .select('survey_definition_id, survey_name, is_active, is_template')
      .order('created_at', { ascending: false });

    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
    } else {
      console.log(`\n🎉 Final verification - Total surveys: ${final.length}`);
      final.forEach((s, i) => {
        const type = s.is_template ? 'Template' : (s.is_active ? 'Active' : 'Draft');
        console.log(`   ${i + 1}. ${s.survey_name} (${type})`);
      });
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

createSurveysForVercel();