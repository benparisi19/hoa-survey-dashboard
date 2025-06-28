'use client';

import { useAuth, useProfile } from '@/lib/auth-context-v2';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  Home, 
  Search, 
  MapPin, 
  CheckCircle, 
  Mail,
  HelpCircle,
  ArrowRight,
  UserCheck,
  Clock
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function GettingStartedPage() {
  const { user, loading, signOut } = useAuth();
  const { userProfile } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
    
    // If user has properties, redirect to main dashboard
    if (userProfile?.accessible_properties && userProfile.accessible_properties.length > 0) {
      router.push('/dashboard');
    }
  }, [user, userProfile, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

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
                  HOA Community Portal
                </h1>
                <p className="text-sm text-gray-500">
                  Welcome, {userProfile.first_name}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Profile Complete
                </span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-8 text-white mb-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Welcome to Your Community Portal!
            </h2>
            <p className="text-blue-100 text-lg mb-6">
              You're just one step away from accessing your property information and community features.
            </p>
            <Link
              href="/property-search"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              <Search className="h-5 w-5 mr-2" />
              Find Your Property
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Progress</h3>
          
          <div className="space-y-4">
            {/* Step 1 - Complete */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Create Account</h4>
                <p className="text-sm text-gray-500">Account created and profile completed</p>
              </div>
            </div>

            {/* Step 2 - Current */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Find Your Property</h4>
                <p className="text-sm text-gray-500">Search for and request access to your property</p>
              </div>
              <div className="ml-auto">
                <Link
                  href="/property-search"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Start Now →
                </Link>
              </div>
            </div>

            {/* Step 3 - Future */}
            <div className="flex items-center opacity-50">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Get Approved</h4>
                <p className="text-sm text-gray-500">Wait for property owner or HOA admin approval</p>
              </div>
            </div>

            {/* Step 4 - Future */}
            <div className="flex items-center opacity-50">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Home className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-medium text-gray-900">Access Community Features</h4>
                <p className="text-sm text-gray-500">View property info, take surveys, and connect with neighbors</p>
              </div>
            </div>
          </div>
        </div>

        {/* What You Can Do Now */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Search className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Find Your Property</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Search for your property address and request access. This connects you to your community portal.
            </p>
            <Link
              href="/property-search"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Search Properties
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <HelpCircle className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Need Help?</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Can't find your property or have questions? Contact support or check our help resources.
            </p>
            <Link
              href="/help"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              Get Help
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Account</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Profile Information</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Name:</strong> {userProfile.first_name} {userProfile.last_name}</p>
                <p><strong>Email:</strong> {userProfile.email}</p>
                <p><strong>Account Type:</strong> {userProfile.account_type}</p>
                <p><strong>Status:</strong> {userProfile.account_status}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="block text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit Profile Settings
                </Link>
                <Link
                  href="/help"
                  className="block text-sm text-blue-600 hover:text-blue-700"
                >
                  View Help & FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center">
          <div className="bg-gray-100 rounded-lg p-6">
            <Mail className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Still need help?
            </h3>
            <p className="text-gray-600 mb-4">
              If you can't find your property or run into issues, don't hesitate to reach out.
            </p>
            <Link
              href="/help"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}