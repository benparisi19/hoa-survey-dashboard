import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getUserState, shouldRedirect, UserState } from '@/lib/user-state';
import { UserProfile } from '@/lib/auth-context-v2';

async function getUserProfile(supabase: any, userId: string): Promise<UserProfile | null> {
  try {
    // Get user's profile from people table
    const { data: profile, error: profileError } = await supabase
      .from('people')
      .select('*')
      .eq('auth_user_id', userId)
      .single();

    if (profileError || !profile) {
      return null;
    }

    // Get user's accessible properties
    const { data: properties, error: propertiesError } = await supabase
      .rpc('get_user_accessible_properties', { user_auth_id: userId });

    if (propertiesError) {
      console.error('Error fetching accessible properties:', propertiesError);
      return {
        ...profile,
        accessible_properties: []
      };
    }

    return {
      ...profile,
      accessible_properties: properties || []
    };
  } catch (error) {
    console.error('Error fetching user profile in middleware:', error);
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile if authenticated
  let userProfile: UserProfile | null = null;
  if (user) {
    userProfile = await getUserProfile(supabase, user.id);
  }

  // Determine user state
  const userState = getUserState(user, userProfile);
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return supabaseResponse;
  }

  // Check if user should be redirected based on their state and current route
  const redirectCheck = shouldRedirect(userState, pathname);

  if (redirectCheck.shouldRedirect && redirectCheck.redirectTo) {
    const url = request.nextUrl.clone();
    url.pathname = redirectCheck.redirectTo;
    
    console.log(`[Middleware] Redirecting ${pathname} → ${redirectCheck.redirectTo} (User state: ${userState})`);
    
    return NextResponse.redirect(url);
  }

  // Add user state to headers for debugging (optional)
  supabaseResponse.headers.set('x-user-state', userState);

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object

  return supabaseResponse;
}