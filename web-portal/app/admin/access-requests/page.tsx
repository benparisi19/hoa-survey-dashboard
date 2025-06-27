'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context-v2';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Mail, 
  MapPin,
  User,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AccessRequest {
  request_id: string;
  property_id: string;
  requester_email: string;
  requester_name: string;
  claimed_relationship: string;
  request_message: string;
  status: string;
  requested_at: string;
  expires_at: string;
  properties: {
    address: string;
    hoa_zone: string;
  };
}

export default function AccessRequestsAdminPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (!authLoading && (!userProfile || userProfile.account_type !== 'hoa_admin')) {
      router.push('/dashboard');
      return;
    }

    if (userProfile) {
      fetchRequests();
    }
  }, [userProfile, authLoading, filter]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/access-requests?status=${filter}`);
      const data = await response.json();
      
      if (response.ok) {
        setRequests(data.requests || []);
      } else {
        console.error('Failed to fetch requests:', data.error);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject', notes?: string) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch(`/api/access-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          review_notes: notes,
          reviewed_by: userProfile?.person_id
        })
      });

      if (response.ok) {
        // Refresh the requests list
        await fetchRequests();
        setSelectedRequest(null);
      } else {
        const data = await response.json();
        console.error('Failed to process request:', data.error);
      }
    } catch (error) {
      console.error('Error processing request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userProfile || userProfile.account_type !== 'hoa_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need HOA admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Property Access Requests</h1>
              <p className="text-gray-600">Review and manage resident access requests</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {(['pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  filter === status
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {status === 'pending' && requests.length > 0 && (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                    {requests.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {filter} requests
              </h3>
              <p className="text-gray-600">
                {filter === 'pending' 
                  ? 'All caught up! No pending access requests to review.'
                  : `No ${filter} access requests found.`
                }
              </p>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.request_id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {request.requester_name}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            request.claimed_relationship === 'owner'
                              ? 'bg-blue-100 text-blue-800'
                              : request.claimed_relationship === 'primary_renter'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {request.claimed_relationship.replace('_', ' ')}
                          </span>
                          {isExpired(request.expires_at) && filter === 'pending' && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Expired
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{request.requester_email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4" />
                            <span>{request.properties.address} • Zone {request.properties.hoa_zone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Requested {new Date(request.requested_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {request.request_message && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <div className="flex items-start space-x-2">
                              <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                              <p className="text-sm text-gray-700">{request.request_message}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {filter === 'pending' && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleRequestAction(request.request_id, 'reject')}
                        disabled={isProcessing}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Deny
                      </button>
                      <button
                        onClick={() => handleRequestAction(request.request_id, 'approve')}
                        disabled={isProcessing}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                    </div>
                  )}

                  {filter !== 'pending' && (
                    <div className="ml-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium ${
                        filter === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {filter === 'approved' ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}