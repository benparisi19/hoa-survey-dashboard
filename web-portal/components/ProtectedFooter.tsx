'use client';

import { useAuth } from '@/lib/auth-context';

export default function ProtectedFooter() {
  const { user, profile, loading, hydrated } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-500">
            <p>HOA Survey Analysis Dashboard</p>
            <p>Data collected and analyzed for community decision making</p>
          </div>
          
          {/* Only show sensitive data for authenticated admins after hydration */}
          {hydrated && user && isAdmin && !loading && (
            <div className="flex space-x-6 text-sm text-gray-500">
              <span>Last updated: {new Date().toLocaleDateString()}</span>
              <span>•</span>
              <span>113 Total Responses</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}