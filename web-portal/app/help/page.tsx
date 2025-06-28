'use client';

import { useAuth, useProfile } from '@/lib/auth-context-v2';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  Home, 
  ArrowLeft,
  HelpCircle,
  Mail,
  MessageCircle,
  FileText,
  Search,
  UserPlus
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function HelpPage() {
  const { user, loading } = useAuth();
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

  if (!user) {
    return null;
  }

  const hasProperties = userProfile?.accessible_properties && userProfile.accessible_properties.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link 
                href={hasProperties ? "/dashboard" : "/getting-started"}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Link>
              <div className="bg-blue-600 p-2 rounded-lg">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Help & Support
                </h1>
                <p className="text-sm text-gray-500">
                  Get answers and support
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Help */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">
            Need immediate help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <Search className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Can't find your property?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Try different search terms or contact support if your property isn't in our system.
              </p>
              <Link 
                href="/property-search"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Search Properties →
              </Link>
            </div>
            
            <div className="bg-white rounded-lg p-4">
              <UserPlus className="h-6 w-6 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">Access request pending?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Access requests are typically reviewed within 1-3 business days.
              </p>
              <Link 
                href="/getting-started"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Check Status →
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                How do I get access to my property?
              </h3>
              <p className="text-gray-600 text-sm">
                After creating your account, search for your property address and submit an access request. 
                The property owner or HOA administrator will review and approve your request.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                How long does approval take?
              </h3>
              <p className="text-gray-600 text-sm">
                Most access requests are reviewed within 1-3 business days. You'll receive an email notification when your request is approved or if additional information is needed.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Can I access multiple properties?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! You can request access to multiple properties if you own, rent, or have legitimate access to them. 
                Use the "Add Another Property" feature from your dashboard.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                What if my property isn't in the system?
              </h3>
              <p className="text-gray-600 text-sm">
                If you can't find your property in the search results, please contact support with your property address. 
                We'll work with the HOA to add it to the system.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                How do I update my profile information?
              </h3>
              <p className="text-gray-600 text-sm">
                You can update your profile information anytime by visiting your profile settings page.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Mail className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Email Support</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Send us an email with your question or issue. We typically respond within 24 hours.
            </p>
            <a
              href="mailto:support@example.com"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              support@example.com
            </a>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">User Guide</h3>
            </div>
            <p className="text-gray-600 mb-4">
              View our comprehensive user guide for detailed instructions on using the portal.
            </p>
            <button className="inline-flex items-center text-green-600 hover:text-green-700 font-medium">
              Coming Soon
            </button>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="mt-8 text-center">
          <Link
            href={hasProperties ? "/dashboard" : "/getting-started"}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {hasProperties ? "Back to Dashboard" : "Back to Getting Started"}
          </Link>
        </div>
      </div>
    </div>
  );
}