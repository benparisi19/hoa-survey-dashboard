import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { revalidateSurveyCache } from '@/lib/cache-utils';

export async function GET() {
  try {
    const supabase = createServiceClient();
    
    // Test multiple ways of querying to see if there's a difference
    console.log('🔍 Starting debug survey check from Vercel...');
    
    // 1. Simple count query
    const { count, error: countError } = await supabase
      .from('survey_definitions')
      .select('*', { count: 'exact', head: true });
    
    // 2. Get all survey IDs only
    const { data: ids, error: idsError } = await supabase
      .from('survey_definitions')
      .select('survey_definition_id, created_at')
      .order('created_at', { ascending: false });
    
    // 3. Get surveys with all fields (same as main page)
    const { data: surveys, error: surveysError } = await supabase
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
    
    // 4. Try with different ordering
    const { data: surveysAsc, error: surveysAscError } = await supabase
      .from('survey_definitions')
      .select('survey_definition_id, survey_name, created_at')
      .order('created_at', { ascending: true });
    
    // 5. Check environment variables
    const envCheck = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceKeyPrefix: process.env.SUPABASE_SERVICE_KEY?.substring(0, 20) + '...'
    };
    
    // 6. Try inserting a test survey to see if writes work
    let insertTest = null;
    try {
      const testSurvey = {
        survey_name: `Vercel Test ${new Date().getTime()}`,
        survey_type: 'community_wide',
        description: 'Test survey created from Vercel API',
        response_schema: { sections: [] },
        display_config: { theme: 'default' },
        targeting_config: { type: 'all_properties' },
        is_active: false,
        is_template: false,
        auto_recurring: false
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('survey_definitions')
        .insert(testSurvey)
        .select()
        .single();
      
      insertTest = {
        success: !insertError,
        error: insertError?.message,
        surveyId: insertData?.survey_definition_id
      };
      
      // Revalidate after insert
      if (insertData) {
        revalidateSurveyCache(insertData.survey_definition_id);
      }
      
      // Clean up test survey
      if (insertData) {
        await supabase
          .from('survey_definitions')
          .delete()
          .eq('survey_definition_id', insertData.survey_definition_id);
          
        // Revalidate after delete
        revalidateSurveyCache();
      }
    } catch (insertErr) {
      insertTest = {
        success: false,
        error: insertErr instanceof Error ? insertErr.message : 'Unknown insert error'
      };
    }
    
    const result = {
      timestamp: new Date().toISOString(),
      environment: envCheck,
      queries: {
        count: {
          result: count,
          error: countError?.message
        },
        ids: {
          count: ids?.length || 0,
          result: ids?.map(s => ({ id: s.survey_definition_id.substring(0, 8), created: s.created_at })),
          error: idsError?.message
        },
        surveys: {
          count: surveys?.length || 0,
          result: surveys?.map(s => ({ 
            id: s.survey_definition_id.substring(0, 8), 
            name: s.survey_name, 
            template: s.is_template, 
            active: s.is_active,
            created: s.created_at
          })),
          error: surveysError?.message
        },
        surveysAsc: {
          count: surveysAsc?.length || 0,
          result: surveysAsc?.map(s => ({ id: s.survey_definition_id.substring(0, 8), name: s.survey_name, created: s.created_at })),
          error: surveysAscError?.message
        },
        insertTest
      }
    };
    
    console.log('🎯 Vercel debug result:', JSON.stringify(result, null, 2));
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('💥 Debug API error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}