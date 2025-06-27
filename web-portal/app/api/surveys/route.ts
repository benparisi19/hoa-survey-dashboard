import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = createServiceClient();
    
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
      console.error('Error fetching surveys:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(surveys || []);
    
  } catch (error) {
    console.error('Unexpected error fetching surveys:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}