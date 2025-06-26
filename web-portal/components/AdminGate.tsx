'use client';

import { useAuth } from '@/lib/auth-context';
import { Shield, AlertTriangle, UserX } from 'lucide-react';

interface AdminGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminGate({ children, fallback }: AdminGateProps) {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this content.</p>
        </div>
      </div>
    );
  }
  
  if (profile?.role !== 'admin') {
    return fallback || (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-yellow-100 rounded-full p-3 mx-auto w-fit mb-4">
            <Shield className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Restricted</h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700 mb-2">
              <strong>Current Status:</strong> {profile?.role || 'No access'}
            </p>
            <p className="text-gray-700">
              <strong>User:</strong> {profile?.email || user.email}
            </p>
          </div>
          <p className="text-gray-600 mb-4">
            You need administrator privileges to view this content.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Need access?</p>
                <p>Contact an existing administrator to request admin privileges for your account.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}