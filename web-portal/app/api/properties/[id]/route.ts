import { NextResponse, NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    const propertyId = params.id;

    // Get basic property information
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select(`
        property_id,
        address,
        lot_number,
        hoa_zone,
        street_group,
        property_type,
        square_footage,
        lot_size_sqft,
        year_built,
        special_features,
        notes,
        created_at,
        updated_at
      `)
      .eq('property_id', propertyId)
      .single();

    if (propertyError) {
      console.error('Error fetching property:', propertyError);
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Get current residents (this will be implemented when we have the residents table)
    // For now, return placeholder data
    const residents = [
      {
        resident_id: 'placeholder-1',
        person_id: 'placeholder-person-1',
        first_name: 'Contact',
        last_name: 'TBD',
        email: '',
        phone: '',
        relationship_type: 'unknown',
        is_primary_contact: true,
        start_date: new Date().toISOString(),
        end_date: null
      }
    ];

    // Get survey history (using existing responses table for now)
    const { data: surveys, error: surveysError } = await supabase
      .from('responses')
      .select(`
        response_id,
        address,
        created_at,
        review_status,
        name
      `)
      .eq('address', property.address)
      .order('created_at', { ascending: false });

    if (surveysError) {
      console.error('Error fetching surveys:', surveysError);
    }

    // Format survey data
    const surveyHistory = surveys?.map(survey => ({
      survey_id: survey.response_id,
      survey_name: 'Landscaping 2024',
      survey_type: 'landscaping',
      completed_date: survey.created_at,
      status: survey.review_status === 'reviewed' ? 'complete' : 'pending',
      respondent: survey.name || 'Anonymous'
    })) || [];

    // Get recent activity (placeholder for now)
    const recentActivity = [
      {
        activity_id: 'activity-1',
        type: 'survey_completed',
        description: 'Landscaping survey completed',
        date: new Date().toISOString(),
        status: 'completed'
      }
    ];

    const propertyDetails = {
      ...property,
      current_residents: residents,
      survey_history: surveyHistory,
      recent_activity: recentActivity,
      issues_count: 0, // Placeholder
      status: 'active' as const // Placeholder
    };

    return NextResponse.json(propertyDetails);
  } catch (error) {
    console.error('Unexpected error fetching property details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    const propertyId = params.id;
    const body = await request.json();

    // Update property information
    const { data: property, error: updateError } = await supabase
      .from('properties')
      .update({
        square_footage: body.square_footage,
        lot_size_sqft: body.lot_size_sqft,
        year_built: body.year_built,
        property_type: body.property_type,
        special_features: body.special_features,
        notes: body.notes,
        updated_at: new Date().toISOString()
      })
      .eq('property_id', propertyId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating property:', updateError);
      return NextResponse.json(
        { error: 'Failed to update property' },
        { status: 500 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Unexpected error updating property:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}