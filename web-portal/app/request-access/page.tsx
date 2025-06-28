'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Home, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function RequestAccessRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      router.push('/auth/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Home className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Account Required
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Property access requests now require an account for enhanced security
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                New Secure Process
              </h3>
              <div className="text-sm text-blue-700 space-y-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">1</div>
                  <span>Create your account or sign in</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">2</div>
                  <span>Search for your property address</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3">3</div>
                  <span>Request access and get approved</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-500 text-center">
                Choose your option below, or wait 3 seconds to be redirected...
              </p>
              
              <Link
                href="/auth/signup"
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Create New Account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>

              <Link
                href="/auth/login"
                className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In to Existing Account
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            This change improves security and provides a better experience for managing your property access.
          </p>
        </div>
      </div>
    </div>
  );
}