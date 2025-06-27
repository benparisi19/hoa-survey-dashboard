import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    const invitationData = await request.json();

    // Validate required fields
    if (!invitationData.invited_email || !invitationData.relationship_type || !invitationData.invited_by) {
      return NextResponse.json(
        { error: 'Missing required fields: invited_email, relationship_type, invited_by' },
        { status: 400 }
      );
    }

    // Verify the property exists and inviter has permission
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('property_id, address')
      .eq('property_id', params.id)
      .single();

    if (propertyError || !property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if inviter has permission to invite (they should be owner or have invite permission)
    const { data: inviterAccess, error: accessError } = await supabase
      .rpc('get_user_accessible_properties', { 
        user_auth_id: invitationData.invited_by 
      });

    if (accessError) {
      console.error('Error checking inviter access:', accessError);
      return NextResponse.json(
        { error: 'Failed to verify invitation permissions' },
        { status: 500 }
      );
    }

    const hasAccess = inviterAccess?.some((access: any) => 
      access.property_id === params.id && 
      (access.access_type === 'owner' || access.permissions.includes('invite_residents'))
    );

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have permission to invite residents to this property' },
        { status: 403 }
      );
    }

    // Check if person is already invited or has access
    const { data: existingInvite } = await supabase
      .from('property_invitations')
      .select('invitation_id, status')
      .eq('property_id', params.id)
      .eq('invited_email', invitationData.invited_email)
      .eq('status', 'sent')
      .single();

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email address' },
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
      .eq('email', invitationData.invited_email)
      .eq('property_residents.property_id', params.id)
      .is('property_residents.end_date', null);

    if (existingAccess && existingAccess.length > 0) {
      return NextResponse.json(
        { error: 'This person already has access to this property' },
        { status: 409 }
      );
    }

    // Create the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('property_invitations')
      .insert({
        property_id: params.id,
        invited_by: invitationData.invited_by,
        invited_email: invitationData.invited_email,
        invited_name: invitationData.invited_name,
        relationship_type: invitationData.relationship_type,
        message: invitationData.message,
        permissions: invitationData.permissions || ['survey_access', 'property_info'],
        access_level: invitationData.access_level || 'basic',
        can_invite_others: invitationData.can_invite_others || false,
        status: 'sent'
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // Log the invitation in audit trail
    await supabase
      .from('property_access_audit')
      .insert({
        property_id: params.id,
        action_type: 'invite_sent',
        action_details: {
          invitation_id: invitation.invitation_id,
          invited_email: invitationData.invited_email,
          relationship_type: invitationData.relationship_type,
          permissions: invitationData.permissions
        },
        performed_by: invitationData.invited_by
      });

    // TODO: Send email notification to invited person
    // This would integrate with your email service (SendGrid, AWS SES, etc.)
    console.log(`Invitation created for ${invitationData.invited_email} to property ${property.address}`);

    // Revalidate relevant pages
    revalidatePath(`/properties/${params.id}`);
    revalidatePath('/dashboard');

    return NextResponse.json({
      success: true,
      invitation_id: invitation.invitation_id,
      message: 'Invitation sent successfully'
    });

  } catch (error) {
    console.error('Unexpected error creating invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}