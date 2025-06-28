import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    
    try {
      const { data: { user }, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (sessionError || !user) {
        console.error('Error exchanging code for session:', sessionError);
        return NextResponse.redirect(new URL('/auth/login?error=auth_error', request.url));
      }

      // Check if user has a profile in the people table
      const { data: profile, error: profileError } = await supabase
        .from('people')
        .select('person_id')
        .eq('auth_user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 is "not found" - which is expected for new users
        console.error('Error checking user profile:', profileError);
        return NextResponse.redirect(new URL('/auth/login?error=auth_error', request.url));
      }

      if (!profile) {
        // New user - redirect to profile setup
        return NextResponse.redirect(new URL(`/auth/setup-profile?email=${encodeURIComponent(user.email || '')}`, request.url));
      }

      // Existing user - redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      console.error('Error in auth callback:', error);
      // Redirect to login with error
      return NextResponse.redirect(new URL('/auth/login?error=auth_error', request.url));
    }
  }

  // Redirect to login if no code
  return NextResponse.redirect(new URL('/auth/login', request.url));
}