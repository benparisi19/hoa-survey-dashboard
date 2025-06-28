'use client';

import { useState, useEffect } from 'react';
import { useAuth, useProfile } from '@/lib/auth-context-v2';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  User,
  Mail,
  Shield,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { userProfile, refreshProfile } = useProfile();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    preferred_contact_method: 'email' as 'email' | 'phone' | 'text' | 'mail'
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }

    if (userProfile) {
      setFormData({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
        phone: userProfile.phone || '',
        preferred_contact_method: userProfile.preferred_contact_method || 'email'
      });
    }
  }, [user, userProfile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Profile updated successfully!' 
        });
        await refreshProfile();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !userProfile) {
    return null;
  }

  const hasProperties = userProfile.accessible_properties && userProfile.accessible_properties.length > 0;
  const backUrl = hasProperties ? "/dashboard" : "/getting-started";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link 
                href={backUrl}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Link>
              <div className="bg-blue-600 p-2 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Profile Settings
                </h1>
                <p className="text-sm text-gray-500">
                  Manage your account information
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Account Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Shield className={`h-4 w-4 ${
                  userProfile.account_status === 'verified' 
                    ? 'text-green-600' 
                    : 'text-yellow-600'
                }`} />
                <span className="text-sm font-medium text-gray-700">Account Status</span>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                userProfile.account_status === 'verified'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {userProfile.account_status}
              </span>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Account Type</span>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {userProfile.account_type}
              </span>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center space-x-2 mb-2">
              <Mail className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Email Address</span>
            </div>
            <p className="text-sm text-gray-600">{userProfile.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              Contact support to change your email address
            </p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 flex items-center p-3 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  id="first_name"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  id="last_name"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="preferred_contact_method" className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Contact Method
              </label>
              <select
                id="preferred_contact_method"
                value={formData.preferred_contact_method}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  preferred_contact_method: e.target.value as typeof formData.preferred_contact_method 
                }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="email">Email</option>
                <option value="phone">Phone Call</option>
                <option value="text">Text Message</option>
                <option value="mail">Physical Mail</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href={backUrl}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Property Access */}
        {hasProperties && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Access</h2>
            <div className="space-y-3">
              {userProfile.accessible_properties.map((property) => (
                <div key={property.property_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{property.address}</p>
                    <p className="text-sm text-gray-600">Zone {property.hoa_zone} • {property.access_type}</p>
                  </div>
                  <Link
                    href={`/properties/${property.property_id}`}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href="/property-search"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Another Property
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}