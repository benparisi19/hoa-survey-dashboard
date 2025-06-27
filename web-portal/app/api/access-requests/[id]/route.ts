import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    const { action, review_notes, reviewed_by } = await request.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get the access request
    const { data: accessRequest, error: fetchError } = await supabase
      .from('property_access_requests')
      .select('*')
      .eq('request_id', params.id)
      .single();

    if (fetchError || !accessRequest) {
      return NextResponse.json(
        { error: 'Access request not found' },
        { status: 404 }
      );
    }

    if (accessRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Request has already been processed' },
        { status: 409 }
      );
    }

    // Update the request status
    const { error: updateError } = await supabase
      .from('property_access_requests')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by,
        review_notes,
        reviewed_at: new Date().toISOString()
      })
      .eq('request_id', params.id);

    if (updateError) {
      console.error('Error updating access request:', updateError);
      return NextResponse.json(
        { error: 'Failed to update access request' },
        { status: 500 }
      );
    }

    // If approved, create the user account and property access
    if (action === 'approve') {
      // Check if person already exists in people table
      let { data: person, error: personError } = await supabase
        .from('people')
        .select('person_id')
        .eq('email', accessRequest.requester_email)
        .single();

      // If person doesn't exist, create them
      if (personError || !person) {
        const { data: newPerson, error: createPersonError } = await supabase
          .from('people')
          .insert({
            first_name: accessRequest.requester_name.split(' ')[0] || accessRequest.requester_name,
            last_name: accessRequest.requester_name.split(' ').slice(1).join(' ') || '',
            email: accessRequest.requester_email,
            account_status: 'verified',
            account_type: accessRequest.claimed_relationship === 'owner' ? 'owner' : 'resident',
            verification_method: 'hoa_verified'
          })
          .select('person_id')
          .single();

        if (createPersonError) {
          console.error('Error creating person:', createPersonError);
          return NextResponse.json(
            { error: 'Failed to create user account' },
            { status: 500 }
          );
        }

        person = newPerson;
      }

      // Create property_residents relationship
      const { error: residentError } = await supabase
        .from('property_residents')
        .insert({
          person_id: person.person_id,
          property_id: accessRequest.property_id,
          relationship_type: accessRequest.claimed_relationship,
          start_date: new Date().toISOString().split('T')[0],
          verification_status: 'verified',
          permissions: ['survey_access', 'property_info'],
          access_level: accessRequest.claimed_relationship === 'owner' ? 'full' : 'basic',
          can_invite_others: accessRequest.claimed_relationship === 'owner'
        });

      if (residentError) {
        console.error('Error creating property resident relationship:', residentError);
        return NextResponse.json(
          { error: 'Failed to grant property access' },
          { status: 500 }
        );
      }

      // If they claimed to be an owner, create ownership record
      if (accessRequest.claimed_relationship === 'owner') {
        await supabase
          .from('property_ownership')
          .insert({
            property_id: accessRequest.property_id,
            owner_id: person.person_id,
            ownership_type: 'sole_owner',
            verified_by_hoa: true,
            verified_by: reviewed_by,
            verified_at: new Date().toISOString()
          });
      }
    }

    // Log the action in audit trail
    await supabase
      .from('property_access_audit')
      .insert({
        property_id: accessRequest.property_id,
        action_type: action === 'approve' ? 'access_granted' : 'access_denied',
        action_details: {
          request_id: params.id,
          requester_email: accessRequest.requester_email,
          review_notes
        },
        performed_by: reviewed_by
      });

    // TODO: Send email notification to requester
    console.log(`Access request ${action}d for ${accessRequest.requester_email}`);

    // Revalidate relevant pages
    revalidatePath('/admin/access-requests');
    revalidatePath('/dashboard');

    return NextResponse.json({
      success: true,
      action,
      message: `Access request ${action}d successfully`
    });

  } catch (error) {
    console.error('Unexpected error processing access request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}