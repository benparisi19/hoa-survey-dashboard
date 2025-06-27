import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { SurveyDefinition } from '@/types/survey-builder';
import { revalidateSurveyCache } from '@/lib/cache-utils';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const surveyData = await request.json();
    
    const { data, error } = await supabase
      .from('survey_definitions')
      .insert({
        survey_name: surveyData.survey_name,
        survey_type: surveyData.survey_type,
        description: surveyData.description,
        response_schema: surveyData.response_schema,
        display_config: surveyData.display_config,
        targeting_config: surveyData.targeting_config,
        is_active: surveyData.is_active,
        is_template: surveyData.is_template,
        template_category: surveyData.template_category,
        auto_recurring: surveyData.auto_recurring,
        recurrence_config: surveyData.recurrence_config,
        active_period_start: surveyData.active_period_start,
        active_period_end: surveyData.active_period_end,
        created_by: null // TODO: Get from auth context
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating survey:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Revalidate the surveys page cache so new survey appears immediately
    revalidateSurveyCache(data.survey_definition_id);

    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Unexpected error creating survey:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}