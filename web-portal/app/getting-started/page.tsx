'use client';

import { useAuth, useProfile } from '@/lib/auth-context-v2';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Home, 
  Search, 
  MapPin, 
  CheckCircle, 
  Mail,
  HelpCircle,
  ArrowRight,
  UserCheck,
  Clock,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Target
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function GettingStartedPage() {
  const { user, loading, signOut } = useAuth();
  const { userProfile } = useProfile();
  const router = useRouter();
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

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

        {/* Detailed Guides */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Step-by-Step Guides</h3>
            <button
              onClick={() => setShowTutorial(!showTutorial)}
              className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              <Target className="h-4 w-4 mr-2" />
              {showTutorial ? 'Hide Tutorial' : 'Start Tutorial'}
            </button>
          </div>

          {showTutorial && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Interactive Tutorial</h4>
                  <p className="text-blue-800 text-sm mb-4">
                    This tutorial will walk you through finding and requesting access to your property. It typically takes 2-3 minutes.
                  </p>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center mr-2">1</div>
                      Go to the property search page
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center mr-2">2</div>
                      Enter your property address or use the map
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center mr-2">3</div>
                      Request access and provide your relationship to the property
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center mr-2">4</div>
                      Wait for approval from property owner or HOA admin
                    </div>
                  </div>
                  <Link
                    href="/property-search?tutorial=true"
                    className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Start Guided Tour
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Guide 1: Finding Your Property */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <button
                onClick={() => setExpandedGuide(expandedGuide === 'property-search' ? null : 'property-search')}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <Search className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">How to Find Your Property</h4>
                    <p className="text-sm text-gray-500">Learn different ways to search for your property</p>
                  </div>
                </div>
                {expandedGuide === 'property-search' ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {expandedGuide === 'property-search' && (
                <div className="px-6 pb-4 border-t border-gray-100">
                  <div className="space-y-4 mt-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Method 1: Address Search</h5>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-4">
                        <li>Click "Find Your Property" or use the search bar</li>
                        <li>Enter your complete address (e.g., "123 Main St")</li>
                        <li>Select your property from the dropdown suggestions</li>
                        <li>Verify the property details match your residence</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Method 2: Interactive Map</h5>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-4">
                        <li>Use the map view on the property search page</li>
                        <li>Navigate to your neighborhood using zoom and pan</li>
                        <li>Click on your property marker on the map</li>
                        <li>Confirm this is your correct address</li>
                      </ol>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-yellow-800">Can't find your property?</p>
                          <p className="text-yellow-700 mt-1">
                            Try searching with different address formats, or contact support if your property doesn't appear in our system.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Guide 2: Requesting Access */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <button
                onClick={() => setExpandedGuide(expandedGuide === 'request-access' ? null : 'request-access')}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <UserCheck className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">How to Request Property Access</h4>
                    <p className="text-sm text-gray-500">Submit a request to connect with your property</p>
                  </div>
                </div>
                {expandedGuide === 'request-access' ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {expandedGuide === 'request-access' && (
                <div className="px-6 pb-4 border-t border-gray-100">
                  <div className="space-y-4 mt-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">What You'll Need</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                        <li>Your relationship to the property (Owner, Resident, Family Member, etc.)</li>
                        <li>A brief message explaining your request (optional but helpful)</li>
                        <li>Your contact information (already filled from your profile)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Step-by-Step Process</h5>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-4">
                        <li>Find your property using one of the search methods above</li>
                        <li>Click "Request Access" on the property details</li>
                        <li>Select your relationship to the property from the dropdown</li>
                        <li>Add a personal message explaining your connection (optional)</li>
                        <li>Review your contact information</li>
                        <li>Submit your request</li>
                      </ol>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-800">Processing Time</p>
                          <p className="text-blue-700 mt-1">
                            Requests are typically reviewed within 24-48 hours. You'll receive an email notification when your access is approved or if additional information is needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Guide 3: What Happens Next */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <button
                onClick={() => setExpandedGuide(expandedGuide === 'what-next' ? null : 'what-next')}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-purple-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">What Happens After You Request Access</h4>
                    <p className="text-sm text-gray-500">Understanding the approval process and next steps</p>
                  </div>
                </div>
                {expandedGuide === 'what-next' ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {expandedGuide === 'what-next' && (
                <div className="px-6 pb-4 border-t border-gray-100">
                  <div className="space-y-4 mt-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Review Process</h5>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 ml-4">
                        <li>
                          <strong>Request Submitted:</strong> Your request is sent to the property owner and HOA administrators
                        </li>
                        <li>
                          <strong>Under Review:</strong> Property owner or HOA admin reviews your request and verifies your information
                        </li>
                        <li>
                          <strong>Decision Made:</strong> You'll receive an email with the approval decision
                        </li>
                        <li>
                          <strong>Access Granted:</strong> Once approved, you can access your property dashboard and community features
                        </li>
                      </ol>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Once You Have Access</h5>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                        <li>View your property details and HOA zone information</li>
                        <li>Participate in community surveys and voting</li>
                        <li>Access neighborhood updates and announcements</li>
                        <li>Connect with neighbors and community resources</li>
                        <li>Manage your household members (if you're the property owner)</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm">
                          <p className="font-medium text-green-800">Pro Tip</p>
                          <p className="text-green-700 mt-1">
                            You can request access to multiple properties if you own or reside in more than one property in the community.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <BookOpen className="h-6 w-6 text-purple-600 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-purple-900 mb-3">Quick Tips for Success</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-purple-800 mb-2">✅ Do This</h4>
                  <ul className="space-y-1 text-purple-700">
                    <li>• Use your exact property address</li>
                    <li>• Be specific about your relationship</li>
                    <li>• Check your email for updates</li>
                    <li>• Keep your profile information current</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-purple-800 mb-2">❌ Avoid This</h4>
                  <ul className="space-y-1 text-purple-700">
                    <li>• Don't use abbreviations in addresses</li>
                    <li>• Don't submit duplicate requests</li>
                    <li>• Don't forget to check spam folder</li>
                    <li>• Don't request access for others</li>
                  </ul>
                </div>
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
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/help"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                View Help Center
              </Link>
              <Link
                href="/help#contact"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}