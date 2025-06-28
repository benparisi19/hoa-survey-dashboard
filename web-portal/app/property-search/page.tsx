'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Search, 
  MapPin, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { useAuth, useProfile } from '@/lib/auth-context-v2';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Property {
  property_id: string;
  address: string;
  hoa_zone: string;
}

export default function PropertySearchPage() {
  const { user, loading: authLoading } = useAuth();
  const { userProfile } = useProfile();
  const router = useRouter();
  const [step, setStep] = useState<'search' | 'request'>('search');
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [hasExistingProperties, setHasExistingProperties] = useState(false);
  
  const [formData, setFormData] = useState({
    claimed_relationship: 'resident' as 'owner' | 'primary_renter' | 'resident' | 'family' | 'caretaker',
    request_message: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && !userProfile) {
      router.push('/auth/setup-profile');
      return;
    }

    // Check if user already has properties
    if (userProfile?.accessible_properties && userProfile.accessible_properties.length > 0) {
      setHasExistingProperties(true);
    }
  }, [user, userProfile, authLoading, router]);

  const handlePropertySearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setMessage(null);
    
    try {
      const response = await fetch(`/api/properties/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (response.ok) {
        setProperties(data.properties || []);
        if (data.properties?.length === 0) {
          setMessage({ 
            type: 'error', 
            text: 'No properties found matching your search. Please try a different address.' 
          });
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to search properties' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSearching(false);
    }
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperty(property);
    setStep('request');
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty || !userProfile) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/access-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester_email: userProfile.email,
          requester_name: `${userProfile.first_name} ${userProfile.last_name}`,
          claimed_relationship: formData.claimed_relationship,
          request_message: formData.request_message,
          property_id: selectedProperty.property_id
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: 'Access request submitted successfully! You\'ll be notified when it\'s reviewed.' 
        });
        
        // Reset form
        setFormData({
          claimed_relationship: 'resident',
          request_message: '',
        });
        
        // Go back to search after 3 seconds
        setTimeout(() => {
          setStep('search');
          setSelectedProperty(null);
          setProperties([]);
          setSearchQuery('');
        }, 3000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to submit access request' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !userProfile) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {hasExistingProperties ? 'Add Another Property' : 'Find Your Property'}
                </h1>
                <p className="text-sm text-gray-600">
                  {hasExistingProperties 
                    ? `Welcome back, ${userProfile.first_name}! Add another property to your account.`
                    : `Welcome, ${userProfile.first_name}! Let's get you connected to your property.`
                  }
                </p>
              </div>
            </div>
            
            {hasExistingProperties && (
              <button
                onClick={handleGoToDashboard}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Skip for now → Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'search' && (
          <div className="space-y-6">
            {/* Search Instructions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-center mb-6">
                <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {hasExistingProperties ? 'Find Another Property' : 'Find Your Property'}
                </h2>
                <p className="text-gray-600">
                  {hasExistingProperties 
                    ? 'Search for additional properties you own, rent, or have access to'
                    : 'Search for your property address to request access to the community portal'
                  }
                </p>
              </div>

              {/* Search Form */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Property Address
                  </label>
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handlePropertySearch()}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter property address..."
                      />
                    </div>
                    <button
                      onClick={handlePropertySearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>

                {/* Message Display */}
                {message && (
                  <div className={`flex items-center p-3 rounded-md ${
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
              </div>
            </div>

            {/* Search Results */}
            {properties.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Found Properties ({properties.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {properties.map((property) => (
                    <div
                      key={property.property_id}
                      className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handlePropertySelect(property)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {property.address}
                            </p>
                            <p className="text-sm text-gray-500">
                              Zone {property.hoa_zone}
                            </p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Request Access →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skip Option for First-Time Users */}
            {!hasExistingProperties && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Can't find your property?
                </h3>
                <p className="text-gray-600 mb-4">
                  If you can't locate your property, you can skip this step and add it later from your dashboard.
                </p>
                <button
                  onClick={handleGoToDashboard}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Skip for now and go to dashboard
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'request' && selectedProperty && (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => setStep('search')}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </button>

            {/* Request Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Request Property Access
                </h2>
                <div className="flex items-center space-x-2 text-gray-600 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedProperty.address} • Zone {selectedProperty.hoa_zone}</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Requesting access for:</strong> {userProfile.first_name} {userProfile.last_name} ({userProfile.email})
                  </p>
                </div>
              </div>

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

              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label htmlFor="claimed_relationship" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Relationship to Property *
                  </label>
                  <select
                    id="claimed_relationship"
                    required
                    value={formData.claimed_relationship}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      claimed_relationship: e.target.value as typeof formData.claimed_relationship 
                    }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="owner">Property Owner</option>
                    <option value="primary_renter">Primary Renter</option>
                    <option value="resident">Resident</option>
                    <option value="family">Family Member</option>
                    <option value="caretaker">Caretaker</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="request_message" className="block text-sm font-medium text-gray-700 mb-1">
                    Why should you have access? *
                  </label>
                  <textarea
                    id="request_message"
                    required
                    rows={4}
                    value={formData.request_message}
                    onChange={(e) => setFormData(prev => ({ ...prev, request_message: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please explain your relationship to this property and why you need access to the community portal..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">What happens next?</p>
                      <ul className="space-y-1">
                        <li>• Your request will be reviewed by the property owner or HOA administrator</li>
                        <li>• You'll receive an email notification when your request is approved or denied</li>
                        <li>• If approved, you'll get access to property information and community surveys</li>
                        <li>• You can request access to multiple properties if needed</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setStep('search')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner />
                        <span className="ml-2">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}