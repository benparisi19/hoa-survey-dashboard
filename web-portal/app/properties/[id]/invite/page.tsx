'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, UserPlus, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth, useProfile, hasPropertyPermission } from '@/lib/auth-context-v2';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

interface Property {
  property_id: string;
  address: string;
  hoa_zone: string;
}

export default function InviteResidentPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth();
  const { userProfile } = useProfile();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    invited_email: '',
    message: ''
  });

  useEffect(() => {
    if (!authLoading && !userProfile) {
      router.push('/auth/login');
      return;
    }

    if (userProfile && !hasPropertyPermission(userProfile, params.id, 'invite_residents')) {
      router.push('/dashboard');
      return;
    }

    fetchProperty();
  }, [userProfile, authLoading, params.id]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setProperty(data);
      } else {
        setMessage({ type: 'error', text: 'Property not found' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load property information' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/properties/${params.id}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invited_email: formData.invited_email,
          message: formData.message,
          invited_by: userProfile.person_id,
          relationship_type: 'resident', // Default relationship
          permissions: ['survey_access', 'property_info'], // Default permissions
          access_level: 'basic',
          can_invite_others: false
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Invitation sent successfully to ${formData.invited_email}!` 
        });
        
        // Reset form
        setFormData({
          invited_email: '',
          message: ''
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send invitation' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h2>
          <Link 
            href="/dashboard" 
            className="text-blue-600 hover:text-blue-700"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/properties/${params.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Property
          </Link>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Invite Resident</h1>
                <p className="text-gray-600">{property.address} • Zone {property.hoa_zone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 flex items-center p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Invitation Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Email Invitation</h3>
              
              <div>
                <label htmlFor="invited_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="invited_email"
                    required
                    value={formData.invited_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, invited_email: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="resident@example.com"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the email address of the person you want to invite. They'll complete their profile after accepting.
                </p>
              </div>
            </div>

            {/* Welcome Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Welcome Message (Optional)
              </label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Welcome to our community! Once you accept this invitation, you'll be able to access property information and participate in surveys."
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    What happens next?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>The person will receive an email invitation</li>
                      <li>They can create an account or sign in if they already have one</li>
                      <li>They'll gain access to property information and surveys</li>
                      <li>You can manage their access from the property page</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Link
                href={`/properties/${params.id}`}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !formData.invited_email}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}