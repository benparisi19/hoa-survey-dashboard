'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context-v2';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BarChart3, 
  Shield, 
  Users, 
  Building2, 
  ArrowRight,
  MapPin,
  Star,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to their appropriate dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render landing page for authenticated users (they'll be redirected)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                HOA Community Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-16 pb-20 text-center lg:pt-32">
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl">
            Connect with your{' '}
            <span className="relative whitespace-nowrap text-blue-600">
              <span className="relative">community</span>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-gray-700">
            Manage your property, participate in community decisions, and stay connected with your neighbors through our comprehensive HOA platform.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <Link
              href="/auth/signup"
              className="group inline-flex items-center justify-center rounded-full py-3 px-6 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-800 focus-visible:outline-blue-600"
            >
              Get started today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/request-access"
              className="group inline-flex ring-1 items-center justify-center rounded-full py-3 px-6 text-sm focus:outline-none ring-gray-200 text-gray-700 hover:text-gray-900 hover:ring-gray-300 active:bg-gray-100 active:text-gray-600 focus-visible:outline-blue-600 focus-visible:ring-gray-300"
            >
              Request property access
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="pb-16 lg:pb-20">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Property Management */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6">
                <div className="bg-blue-100 rounded-full p-3 w-fit">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Property Management
              </h3>
              <p className="text-gray-600 mb-6">
                Access your property information, manage residents, and track community updates all in one place.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  View property details and history
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Manage household members
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Access community documents
                </li>
              </ul>
            </div>

            {/* Community Engagement */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6">
                <div className="bg-green-100 rounded-full p-3 w-fit">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Community Engagement
              </h3>
              <p className="text-gray-600 mb-6">
                Participate in surveys, provide feedback, and help shape your community's future.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Complete community surveys
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Voice your opinions
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Stay informed on decisions
                </li>
              </ul>
            </div>

            {/* Neighborhood Insights */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6">
                <div className="bg-purple-100 rounded-full p-3 w-fit">
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Neighborhood Insights
              </h3>
              <p className="text-gray-600 mb-6">
                Explore interactive maps, view zone information, and discover community amenities.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Interactive community map
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Zone-based information
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Community statistics
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 rounded-2xl p-8 lg:p-12 text-center text-white mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Ready to connect with your community?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of residents already using our platform to stay connected and engaged with their HOA community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Create Your Account
            </Link>
            <Link
              href="/request-access"
              className="border border-blue-300 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Request Access
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-900">HOA Community Portal</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <Link href="/help" className="hover:text-gray-900">
                Help & Support
              </Link>
              <Link href="/request-access" className="hover:text-gray-900">
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}