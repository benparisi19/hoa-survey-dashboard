import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName } = await request.json();
    
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - no authenticated user' },
        { status: 401 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('people')
      .select('person_id')
      .eq('auth_user_id', user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists for this user' },
        { status: 400 }
      );
    }

    // Create the person record
    const { data: profile, error: createError } = await supabase
      .from('people')
      .insert({
        auth_user_id: user.id,
        email: user.email!,
        first_name: firstName,
        last_name: lastName,
        account_type: 'resident',
        account_status: 'pending',
        verification_method: 'email_signup',
        preferred_contact_method: 'email'
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating profile:', createError);
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      profile 
    });

  } catch (error) {
    console.error('Profile setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}