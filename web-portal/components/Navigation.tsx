'use client';

import Link from 'next/link';
import { 
  BarChart3, 
  Users, 
  Building2, 
  UserCheck, 
  Star, 
  MapPin,
  Search,
  HelpCircle,
  User,
  Zap
} from 'lucide-react';
import { useAuth, useProfile } from '@/lib/auth-context-v2';
import { getUserState, UserState } from '@/lib/user-state';
import UserMenu from './UserMenu';
import ResponseCount from './ResponseCount';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

// Admin navigation (full system access)
const adminNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: BarChart3,
    description: 'Admin overview and survey metrics',
  },
  {
    name: 'Neighborhood',
    href: '/neighborhood',
    icon: Star,
    description: 'Community-wide executive overview',
  },
  {
    name: 'Zones',
    href: '/zones',
    icon: MapPin,
    description: 'Zone-based analytics and management',
  },
  {
    name: 'Properties',
    href: '/properties',
    icon: Building2,
    description: 'Manage community properties and residents',
  },
  {
    name: 'People',
    href: '/people',
    icon: UserCheck,
    description: 'Manage residents and contact information',
  },
  {
    name: 'Responses',
    href: '/responses',
    icon: Users,
    description: 'View and filter individual responses',
  },
];

// User navigation (property owners/residents)
const userNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Your property dashboard',
  },
  {
    name: 'Properties',
    href: '/properties',
    icon: Building2,
    description: 'Your accessible properties',
  },
];

// Onboarding navigation (users without properties)
const onboardingNavigation: NavigationItem[] = [
  {
    name: 'Getting Started',
    href: '/getting-started',
    icon: Zap,
    description: 'Complete your account setup',
  },
  {
    name: 'Find Property',
    href: '/property-search',
    icon: Search,
    description: 'Search and claim your property',
  },
  {
    name: 'Help',
    href: '/help',
    icon: HelpCircle,
    description: 'Get help and support',
  },
];

export default function Navigation() {
  const { user } = useAuth();
  const { userProfile, loading: profileLoading, isAdmin } = useProfile();
  
  // Determine user state and appropriate navigation
  const userState = getUserState(user, userProfile);
  
  // Get navigation items based on user state
  const getNavigationItems = (): NavigationItem[] => {
    switch (userState) {
      case UserState.ADMIN:
        return adminNavigation;
      case UserState.HAS_PROPERTIES:
        return userNavigation;
      case UserState.PROFILE_NO_PROPERTIES:
      case UserState.AUTHENTICATED_NO_PROFILE:
        return onboardingNavigation;
      case UserState.UNAUTHENTICATED:
      default:
        return []; // No navigation for unauthenticated users
    }
  };

  const navigationItems = getNavigationItems();
  const showNavigation = navigationItems.length > 0 && !profileLoading;
  const userIsAdmin = isAdmin();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                HOA Community Portal
              </span>
            </div>
            
            {/* Show navigation based on user state */}
            {showNavigation && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-1"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Only show response count for authenticated admins */}
            {user && userIsAdmin && !profileLoading && (
              <ResponseCount />
            )}
            
            {/* Show UserMenu for authenticated users */}
            {user && <UserMenu />}
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {showNavigation && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200"
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}