import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Get invitation details
    const { data: invitation, error } = await supabase
      .from('property_invitations')
      .select(`
        *,
        properties!inner(address, hoa_zone),
        inviter:people!property_invitations_inviter_id_fkey(first_name, last_name)
      `)
      .eq('invitation_token', token)
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 410 }
      );
    }

    // Check if invitation has already been accepted
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'This invitation has already been used' },
        { status: 409 }
      );
    }

    // Return invitation details
    return NextResponse.json({
      invitation_id: invitation.invitation_id,
      property_id: invitation.property_id,
      property_address: invitation.properties.address,
      inviter_name: `${invitation.inviter.first_name} ${invitation.inviter.last_name}`,
      invitee_email: invitation.invitee_email,
      invitee_name: invitation.invitee_name,
      relationship_type: invitation.relationship_type,
      permissions: invitation.permissions,
      access_level: invitation.access_level,
      can_invite_others: invitation.can_invite_others
    });

  } catch (error) {
    console.error('Error verifying invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}