import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Create a single response object to avoid conflicts
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Set cookie on both request and response without creating new response
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          // Remove cookie on both request and response without creating new response
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Allow access to auth routes and public pages
    const publicPaths = ['/auth/login', '/auth/callback', '/request-access', '/invitations/accept'];
    const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));
    
    if (isPublicPath) {
      // If user is already authenticated and trying to access login, redirect to dashboard
      if (session && request.nextUrl.pathname === '/auth/login') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return response;
    }

    // Protect all other routes - require authentication
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return response;
  } catch (error) {
    // On auth error, redirect to login to prevent infinite loading
    console.error('Middleware auth error:', error);
    if (!request.nextUrl.pathname.startsWith('/auth/login')) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (they handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};