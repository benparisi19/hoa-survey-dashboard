'use client';

export const dynamic = 'force-dynamic';

import { useAuth, useProfile } from '@/lib/auth-context-v2';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  MapPin, 
  Clock, 
  Shield,
  LogOut,
  Plus,
  Eye
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const { userProfile } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !userProfile) {
    return null; // Will redirect to login
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Community Portal
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome back, {userProfile.first_name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Account Status Badge */}
              <div className="flex items-center space-x-2">
                <Shield className={`h-4 w-4 ${
                  userProfile.account_status === 'verified' 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`} />
                <span className={`text-sm font-medium capitalize ${
                  userProfile.account_status === 'verified' 
                    ? 'text-green-700' 
                    : 'text-yellow-700'
                }`}>
                  {userProfile.account_status}
                </span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Status Alert */}
        {userProfile.account_status !== 'verified' && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Account Verification Pending
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your account is {userProfile.account_status}. Some features may be limited until verification is complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Property Access Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Properties ({userProfile.accessible_properties.length})
          </h2>
          
          {userProfile.accessible_properties.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Property Access
              </h3>
              <p className="text-gray-600 mb-4">
                You don't have access to any properties yet. Request access or contact your property owner.
              </p>
              <a
                href="/request-access"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Request Property Access
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userProfile.accessible_properties.map((property) => (
                <div
                  key={property.property_id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {property.address}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Zone {property.hoa_zone}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      property.access_type === 'owner' 
                        ? 'bg-blue-100 text-blue-800'
                        : property.access_type === 'resident'
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {property.access_type}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      Permissions: {property.permissions.join(', ')}
                    </div>
                    
                    <div className="flex space-x-2">
                      <a
                        href={`/properties/${property.property_id}`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Surveys</h3>
                <p className="text-xs text-gray-600">Complete available surveys</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Residents</h3>
                <p className="text-xs text-gray-600">Manage household members</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Community</h3>
                <p className="text-xs text-gray-600">Neighborhood information</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-900">Settings</h3>
                <p className="text-xs text-gray-600">Account preferences</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">
                    {userProfile.first_name} {userProfile.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{userProfile.email}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Type</label>
                  <p className="text-sm text-gray-900 capitalize">
                    {userProfile.account_type}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Verification Method</label>
                  <p className="text-sm text-gray-900">
                    {userProfile.verification_method || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}