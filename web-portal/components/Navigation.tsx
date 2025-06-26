'use client';

import Link from 'next/link';
import { BarChart3, Users, Building2, UserCheck } from 'lucide-react';
import { useAuth, useProfile } from '@/lib/auth-context';
import UserMenu from './UserMenu';
import ResponseCount from './ResponseCount';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: BarChart3,
    description: 'Overview and key metrics',
  },
  {
    name: 'Responses',
    href: '/responses',
    icon: Users,
    description: 'View and filter individual responses',
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
];

export default function Navigation() {
  const { user } = useAuth();
  const { profile, loading: profileLoading, isAdmin } = useProfile();
  const userIsAdmin = isAdmin();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                HOA Survey Dashboard
              </span>
            </div>
            
            {/* Only show navigation links for authenticated admins */}
            {user && userIsAdmin && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
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
            
            {/* Always show UserMenu - it handles its own auth state */}
            <UserMenu />
          </div>
        </div>
      </div>
      
      {/* Mobile navigation - only for authenticated admins */}
      {user && userIsAdmin && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
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