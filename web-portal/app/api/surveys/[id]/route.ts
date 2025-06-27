import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    
    const { data: survey, error } = await supabase
      .from('survey_definitions')
      .select('*')
      .eq('survey_definition_id', params.id)
      .single();

    if (error) {
      console.error('Error fetching survey:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!survey) {
      return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
    }

    return NextResponse.json(survey);
    
  } catch (error) {
    console.error('Unexpected error fetching survey:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    const surveyData = await request.json();
    
    const { data, error } = await supabase
      .from('survey_definitions')
      .update({
        ...surveyData,
        updated_at: new Date().toISOString()
      })
      .eq('survey_definition_id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating survey:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Revalidate cache for updated survey
    revalidatePath('/surveys');
    revalidatePath('/api/surveys');
    revalidatePath(`/surveys/${params.id}`);

    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Unexpected error updating survey:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}