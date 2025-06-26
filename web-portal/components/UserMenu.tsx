'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { User, LogOut, Shield, ChevronDown, RefreshCw } from 'lucide-react';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut, refreshAuth, loading, hydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    router.push('/login');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAuth();
    setRefreshing(false);
    setIsOpen(false);
  };

  const handleHardRefresh = () => {
    window.location.reload();
  };

  if (loading || !hydrated) {
    return (
      <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = profile?.role === 'admin';
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const roleDisplay = profile?.role === 'admin' ? 'Administrator' : 'Limited Access';
  
  // Detect corrupted state: user exists but no profile, or stuck loading
  const isCorrupted = (user && !profile && !loading) || (loading && hydrated);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md px-3 py-2 transition-colors ${
          isCorrupted 
            ? 'text-amber-700 hover:text-amber-900 bg-amber-50' 
            : 'text-gray-700 hover:text-gray-900'
        }`}
      >
        <div className="flex items-center space-x-2">
          <div className={`p-1 rounded-full ${
            isCorrupted ? 'bg-amber-100' : 
            isAdmin ? 'bg-green-100' : 'bg-yellow-100'
          }`}>
            {isCorrupted ? (
              <RefreshCw className="h-4 w-4 text-amber-600" />
            ) : isAdmin ? (
              <Shield className="h-4 w-4 text-green-600" />
            ) : (
              <User className="h-4 w-4 text-yellow-600" />
            )}
          </div>
          <span className="hidden sm:block">
            {isCorrupted ? 'Session Issue' : displayName}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="text-sm font-medium text-gray-900">{displayName}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                isAdmin 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {isAdmin ? (
                  <Shield className="h-3 w-3 mr-1" />
                ) : (
                  <User className="h-3 w-3 mr-1" />
                )}
                {roleDisplay}
              </div>
            </div>

            {/* Actions */}
            {isCorrupted && (
              <>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center w-full px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 hover:text-amber-900 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh Session'}
                </button>
                
                <button
                  onClick={handleHardRefresh}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors border-b border-gray-100"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Hard Refresh Page
                </button>
              </>
            )}
            
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}