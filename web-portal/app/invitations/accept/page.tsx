'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Mail, Home, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context-v2';

function AcceptInvitationContent() {
  const [status, setStatus] = useState<'loading' | 'error' | 'success' | 'prompt'>('loading');
  const [error, setError] = useState<string>('');
  const [invitationDetails, setInvitationDetails] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Invalid invitation link');
      return;
    }

    // Verify the invitation token
    verifyInvitation();
  }, [token]);

  const verifyInvitation = async () => {
    try {
      const response = await fetch(`/api/invitations/verify?token=${encodeURIComponent(token!)}`);
      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setError(data.error || 'Invalid or expired invitation');
        return;
      }

      setInvitationDetails(data);
      setEmail(data.invitee_email);
      
      // If user is already logged in with the same email, auto-accept
      if (user && user.email === data.invitee_email) {
        acceptInvitation();
      } else {
        setStatus('prompt');
      }
    } catch (err) {
      setStatus('error');
      setError('Failed to verify invitation');
    }
  };

  const acceptInvitation = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/invitations/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token,
          email: email.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus('error');
        setError(data.error || 'Failed to accept invitation');
        return;
      }

      setStatus('success');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      
    } catch (err) {
      setStatus('error');
      setError('Failed to accept invitation');
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/auth/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Accepted!</h2>
          <p className="text-gray-600 mb-2">
            Your account has been created and linked to the property.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to login page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Home className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Property Invitation</h1>
          <p className="text-gray-600 mt-2">
            You've been invited to join a property
          </p>
        </div>

        {/* Invitation Details */}
        {invitationDetails && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Invitation Details</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Property:</dt>
                  <dd className="font-medium">{invitationDetails.property_address}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Invited by:</dt>
                  <dd className="font-medium">{invitationDetails.inviter_name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Relationship:</dt>
                  <dd className="font-medium capitalize">{invitationDetails.relationship_type}</dd>
                </div>
                {invitationDetails.permissions && invitationDetails.permissions.length > 0 && (
                  <div className="pt-2 mt-2 border-t">
                    <dt className="text-gray-600 mb-1">Permissions:</dt>
                    <dd className="flex flex-wrap gap-1">
                      {invitationDetails.permissions.map((perm: string) => (
                        <span key={perm} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {perm.replace('_', ' ')}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Email Confirmation */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={invitationDetails.invitee_email}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    placeholder="your.email@example.com"
                  />
                </div>
                {invitationDetails.invitee_email && (
                  <p className="mt-1 text-xs text-gray-500">
                    This invitation is specifically for this email address
                  </p>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>We'll create your account with this email</li>
                      <li>You'll receive a magic link to sign in</li>
                      <li>You'll have access to property information and surveys</li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                onClick={acceptInvitation}
                disabled={isProcessing || !email}
                className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Accept Invitation
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}