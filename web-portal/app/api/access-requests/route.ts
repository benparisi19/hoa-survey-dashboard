import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient();
    const requestData = await request.json();

    // Validate required fields
    if (!requestData.property_id || !requestData.requester_email || !requestData.requester_name || !requestData.claimed_relationship) {
      return NextResponse.json(
        { error: 'Missing required fields: property_id, requester_email, requester_name, claimed_relationship' },
        { status: 400 }
      );
    }

    // Verify the property exists
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('property_id, address')
      .eq('property_id', requestData.property_id)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if person already has a pending request for this property
    const { data: existingRequest } = await supabase
      .from('property_access_requests')
      .select('request_id, status')
      .eq('property_id', requestData.property_id)
      .eq('requester_email', requestData.requester_email)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return NextResponse.json(
        { error: 'You already have a pending access request for this property' },
        { status: 409 }
      );
    }

    // Check if person already has access to property
    const { data: existingAccess } = await supabase
      .from('people')
      .select(`
        person_id,
        property_residents!inner(property_id, end_date)
      `)
      .eq('email', requestData.requester_email)
      .eq('property_residents.property_id', requestData.property_id)
      .is('property_residents.end_date', null);

    if (existingAccess && existingAccess.length > 0) {
      return NextResponse.json(
        { error: 'You already have access to this property' },
        { status: 409 }
      );
    }

    // Create the access request
    const { data: accessRequest, error: requestError } = await supabase
      .from('property_access_requests')
      .insert({
        property_id: requestData.property_id,
        requester_email: requestData.requester_email,
        requester_name: requestData.requester_name,
        claimed_relationship: requestData.claimed_relationship,
        request_message: requestData.request_message,
        status: 'pending'
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating access request:', requestError);
      return NextResponse.json(
        { error: 'Failed to create access request' },
        { status: 500 }
      );
    }

    // Log the request in audit trail
    await supabase
      .from('property_access_audit')
      .insert({
        property_id: requestData.property_id,
        action_type: 'access_requested',
        action_details: {
          request_id: accessRequest.request_id,
          requester_email: requestData.requester_email,
          claimed_relationship: requestData.claimed_relationship
        },
        performed_by: null // No authenticated user yet
      });

    // TODO: Send email notifications to property owners and HOA admins
    console.log(`Access request created for ${requestData.requester_email} to property ${property.address}`);

    return NextResponse.json({
      success: true,
      request_id: accessRequest.request_id,
      message: 'Access request submitted successfully'
    });

  } catch (error) {
    console.error('Unexpected error creating access request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const propertyId = searchParams.get('property_id');

    const supabase = createServiceClient();

    let query = supabase
      .from('property_access_requests')
      .select(`
        *,
        properties (
          address,
          hoa_zone
        )
      `)
      .eq('status', status)
      .order('requested_at', { ascending: false });

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('Error fetching access requests:', error);
      return NextResponse.json(
        { error: 'Failed to fetch access requests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      requests: requests || [],
      total: requests?.length || 0
    });

  } catch (error) {
    console.error('Unexpected error fetching access requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}