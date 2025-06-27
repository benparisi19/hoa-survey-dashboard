import { NextResponse } from 'next/server';
import { createServiceClient, createAdminClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token and email are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const adminClient = createAdminClient();

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from('property_invitations')
      .select('*')
      .eq('invitation_token', token)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    // Validate invitation
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 410 }
      );
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: 'This invitation has already been used' },
        { status: 409 }
      );
    }

    // If invitation has specific email, verify it matches
    if (invitation.invitee_email && invitation.invitee_email !== email) {
      return NextResponse.json(
        { error: 'This invitation is for a different email address' },
        { status: 403 }
      );
    }

    // Check if person already exists
    let { data: person, error: personError } = await supabase
      .from('people')
      .select('person_id, auth_user_id')
      .eq('email', email)
      .single();

    let authUserId: string | null = null;
    let personId: string;

    // Create or update person record
    if (personError || !person) {
      // Create new Supabase Auth user
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: email,
        email_confirm: true, // Auto-confirm since invited by property owner
        user_metadata: {
          first_name: invitation.invitee_name?.split(' ')[0] || '',
          last_name: invitation.invitee_name?.split(' ').slice(1).join(' ') || '',
          account_type: 'resident',
          invited_by: invitation.inviter_id
        }
      });

      if (authError) {
        console.error('Error creating Supabase Auth user:', authError);
        return NextResponse.json(
          { error: 'Failed to create authentication account' },
          { status: 500 }
        );
      }

      authUserId = authData.user.id;

      // Create person record
      const { data: newPerson, error: createPersonError } = await supabase
        .from('people')
        .insert({
          auth_user_id: authUserId,
          first_name: invitation.invitee_name?.split(' ')[0] || 'Guest',
          last_name: invitation.invitee_name?.split(' ').slice(1).join(' ') || 'User',
          email: email,
          account_status: 'verified',
          account_type: 'resident',
          verification_method: 'invitation'
        })
        .select('person_id')
        .single();

      if (createPersonError) {
        console.error('Error creating person:', createPersonError);
        // Clean up auth user
        await adminClient.auth.admin.deleteUser(authUserId);
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      personId = newPerson.person_id;
    } else {
      personId = person.person_id;

      // If person exists but no auth user, create one
      if (!person.auth_user_id) {
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
          email: email,
          email_confirm: true,
          user_metadata: {
            first_name: invitation.invitee_name?.split(' ')[0] || '',
            last_name: invitation.invitee_name?.split(' ').slice(1).join(' ') || '',
            account_type: 'resident',
            invited_by: invitation.inviter_id
          }
        });

        if (authError) {
          console.error('Error creating Supabase Auth user:', authError);
          return NextResponse.json(
            { error: 'Failed to create authentication account' },
            { status: 500 }
          );
        }

        authUserId = authData.user.id;

        // Update person with auth_user_id
        const { error: updateError } = await supabase
          .from('people')
          .update({ 
            auth_user_id: authUserId,
            account_status: 'verified',
            verification_method: 'invitation'
          })
          .eq('person_id', personId);

        if (updateError) {
          console.error('Error updating person:', updateError);
          // Clean up auth user
          await adminClient.auth.admin.deleteUser(authUserId);
          return NextResponse.json(
            { error: 'Failed to link authentication account' },
            { status: 500 }
          );
        }
      }
    }

    // Create property_residents relationship
    const { error: residentError } = await supabase
      .from('property_residents')
      .insert({
        person_id: personId,
        property_id: invitation.property_id,
        relationship_type: invitation.relationship_type,
        start_date: new Date().toISOString().split('T')[0],
        verification_status: 'verified',
        permissions: invitation.permissions,
        access_level: invitation.access_level,
        can_invite_others: invitation.can_invite_others,
        invited_by: invitation.inviter_id
      });

    if (residentError) {
      console.error('Error creating property resident relationship:', residentError);
      return NextResponse.json(
        { error: 'Failed to grant property access' },
        { status: 500 }
      );
    }

    // Update invitation status
    const { error: updateInviteError } = await supabase
      .from('property_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('invitation_id', invitation.invitation_id);

    if (updateInviteError) {
      console.error('Error updating invitation status:', updateInviteError);
    }

    // Log the action
    await supabase
      .from('property_access_audit')
      .insert({
        property_id: invitation.property_id,
        action_type: 'invitation_accepted',
        action_details: {
          invitation_id: invitation.invitation_id,
          invitee_email: email,
          invited_by: invitation.inviter_id
        },
        performed_by: personId
      });

    // Send magic link for first login
    if (authUserId) {
      // In production, this would send an email
      console.log(`Invitation accepted by ${email}`);
      console.log(`User should receive magic link email to sign in`);
      
      // Generate magic link for immediate sign in
      // const { data: magicLink } = await adminClient.auth.admin.generateLink({
      //   type: 'magiclink',
      //   email: email,
      // });
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation accepted successfully',
      requiresLogin: true
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}