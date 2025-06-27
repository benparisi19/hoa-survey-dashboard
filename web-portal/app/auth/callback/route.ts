import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      await supabase.auth.exchangeCodeForSession(code);
      
      // Redirect to dashboard after successful authentication
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      // Redirect to login with error
      return NextResponse.redirect(new URL('/auth/login?error=auth_error', request.url));
    }
  }

  // Redirect to login if no code
  return NextResponse.redirect(new URL('/auth/login', request.url));
}