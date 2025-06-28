import { User } from '@supabase/supabase-js';
import { UserProfile } from '@/lib/auth-context-v2';

// User states in the application lifecycle
export enum UserState {
  UNAUTHENTICATED = 'unauthenticated',
  AUTHENTICATED_NO_PROFILE = 'authenticated_no_profile', 
  PROFILE_NO_PROPERTIES = 'profile_no_properties',
  HAS_PROPERTIES = 'has_properties',
  ADMIN = 'admin'
}

// Route access tiers
export enum RouteTier {
  PUBLIC = 'public',           // No authentication required
  ONBOARDING = 'onboarding',   // Auth required, no property access needed
  USER = 'user',               // Auth + property access required
  ADMIN = 'admin'              // Admin privileges required
}

/**
 * Determine the user's current state in the application
 */
export function getUserState(user: User | null, userProfile: UserProfile | null): UserState {
  // No authentication
  if (!user) {
    return UserState.UNAUTHENTICATED;
  }

  // Authenticated but no profile
  if (!userProfile) {
    return UserState.AUTHENTICATED_NO_PROFILE;
  }

  // Admin users (always prioritized)
  if (userProfile.account_type === 'hoa_admin') {
    return UserState.ADMIN;
  }

  // Profile exists but no property access
  if (!userProfile.accessible_properties || userProfile.accessible_properties.length === 0) {
    return UserState.PROFILE_NO_PROPERTIES;
  }

  // Has property access
  return UserState.HAS_PROPERTIES;
}

/**
 * Define route tiers and their accessible paths
 */
export const ROUTE_TIERS = {
  [RouteTier.PUBLIC]: [
    '/',
    '/auth/login',
    '/auth/signup', 
    '/auth/callback',
    '/about',
    '/request-access' // Keep during transition
  ],
  
  [RouteTier.ONBOARDING]: [
    '/auth/setup-profile',
    '/property-search',
    '/getting-started',
    '/profile',
    '/help'
  ],
  
  [RouteTier.USER]: [
    '/dashboard',
    '/properties',
    '/surveys',
    '/community',
    '/invitations'
  ],
  
  [RouteTier.ADMIN]: [
    '/admin',
    '/people', // Current admin-only pages
    '/zones',
    '/neighborhood',
    '/responses'
  ]
};

/**
 * Get the accessible route tiers for a user state
 */
export function getAccessibleTiers(userState: UserState): RouteTier[] {
  switch (userState) {
    case UserState.UNAUTHENTICATED:
      return [RouteTier.PUBLIC];
      
    case UserState.AUTHENTICATED_NO_PROFILE:
      return [RouteTier.PUBLIC, RouteTier.ONBOARDING];
      
    case UserState.PROFILE_NO_PROPERTIES:
      return [RouteTier.PUBLIC, RouteTier.ONBOARDING];
      
    case UserState.HAS_PROPERTIES:
      return [RouteTier.PUBLIC, RouteTier.ONBOARDING, RouteTier.USER];
      
    case UserState.ADMIN:
      return [RouteTier.PUBLIC, RouteTier.ONBOARDING, RouteTier.USER, RouteTier.ADMIN];
      
    default:
      return [RouteTier.PUBLIC];
  }
}

/**
 * Check if a user can access a specific route
 */
export function canAccessRoute(userState: UserState, pathname: string): boolean {
  const accessibleTiers = getAccessibleTiers(userState);
  
  // Check each tier to see if the route is accessible
  for (const tier of accessibleTiers) {
    const tierRoutes = ROUTE_TIERS[tier];
    
    // Check for exact match or path prefix match
    for (const route of tierRoutes) {
      if (pathname === route || pathname.startsWith(route + '/')) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Get the appropriate default route for a user state
 */
export function getDefaultRoute(userState: UserState): string {
  switch (userState) {
    case UserState.UNAUTHENTICATED:
      return '/auth/login';
      
    case UserState.AUTHENTICATED_NO_PROFILE:
      return '/auth/setup-profile';
      
    case UserState.PROFILE_NO_PROPERTIES:
      return '/getting-started';
      
    case UserState.HAS_PROPERTIES:
      return '/dashboard';
      
    case UserState.ADMIN:
      return '/dashboard'; // Admins can choose between user dashboard or admin
      
    default:
      return '/auth/login';
  }
}

/**
 * Get appropriate redirect destination when accessing an unauthorized route
 */
export function getRedirectRoute(userState: UserState, intendedPath: string): string {
  // If trying to access auth routes while authenticated, go to default
  if ((intendedPath === '/auth/login' || intendedPath === '/auth/signup') && 
      userState !== UserState.UNAUTHENTICATED) {
    return getDefaultRoute(userState);
  }
  
  // For unauthorized routes, redirect to default for user state
  return getDefaultRoute(userState);
}

/**
 * Check if user should be redirected from current route
 */
export function shouldRedirect(userState: UserState, pathname: string): { 
  shouldRedirect: boolean; 
  redirectTo?: string; 
} {
  // Special case: authenticated users shouldn't access login/signup
  if ((pathname === '/auth/login' || pathname === '/auth/signup') && 
      userState !== UserState.UNAUTHENTICATED) {
    return {
      shouldRedirect: true,
      redirectTo: getDefaultRoute(userState)
    };
  }
  
  // Check general route access
  if (!canAccessRoute(userState, pathname)) {
    return {
      shouldRedirect: true,
      redirectTo: getRedirectRoute(userState, pathname)
    };
  }
  
  return { shouldRedirect: false };
}

/**
 * Get user-friendly state description for debugging/UI
 */
export function getUserStateDescription(userState: UserState): string {
  switch (userState) {
    case UserState.UNAUTHENTICATED:
      return 'Not signed in';
    case UserState.AUTHENTICATED_NO_PROFILE:
      return 'Signed in, setting up profile';
    case UserState.PROFILE_NO_PROPERTIES:
      return 'Profile complete, finding property';
    case UserState.HAS_PROPERTIES:
      return 'Active community member';
    case UserState.ADMIN:
      return 'Administrator';
    default:
      return 'Unknown state';
  }
}