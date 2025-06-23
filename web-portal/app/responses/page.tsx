import { Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getServiceRatingColor, getPreferenceColor, parseContactInfo } from '@/lib/utils';

interface ResponseData {
  response_id: string;
  address: string | null;
  name: string | null;
  email_contact: string | null;
  anonymous: string | null;
  q1_preference: string | null;
  q2_service_rating: string | null;
}

async function getResponsesData(): Promise<ResponseData[]> {
  try {
    const { data, error } = await supabase
      .from('responses')
      .select(`
        response_id,
        address,
        name,
        email_contact,
        anonymous,
        q1_q2_preference_rating (
          q1_preference,
          q2_service_rating
        )
      `)
      .order('response_id');
    
    if (error) throw error;
    
    return data?.map(item => ({
      response_id: item.response_id,
      address: item.address,
      name: item.name,
      email_contact: item.email_contact,
      anonymous: item.anonymous,
      q1_preference: (item.q1_q2_preference_rating as any)?.[0]?.q1_preference || null,
      q2_service_rating: (item.q1_q2_preference_rating as any)?.[0]?.q2_service_rating || null,
    })) || [];
  } catch (error) {
    console.error('Error fetching responses:', error);
    return [];
  }
}

async function ResponsesContent() {
  const responses = await getResponsesData();
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Survey Responses</h1>
        <p className="text-gray-600">
          Browse all {responses.length} survey responses with key information and preferences.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-card border border-gray-200 overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">ID</th>
                <th className="table-header-cell">Address</th>
                <th className="table-header-cell">Name</th>
                <th className="table-header-cell">Contact</th>
                <th className="table-header-cell">Preference</th>
                <th className="table-header-cell">Rating</th>
                <th className="table-header-cell">Anonymous</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {responses.map((response) => {
                const contactInfo = parseContactInfo(response.email_contact);
                return (
                  <tr key={response.response_id} className="hover:bg-gray-50">
                    <td className="table-cell font-medium">
                      {response.response_id}
                    </td>
                    <td className="table-cell">
                      {response.address || 'Not provided'}
                    </td>
                    <td className="table-cell">
                      {response.name || 'Not provided'}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-1">
                        <span className={`badge ${contactInfo.isValid ? 'badge-green' : 'badge-gray'}`}>
                          {contactInfo.hasEmail ? '📧' : contactInfo.hasPhone ? '📞' : '❌'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {contactInfo.isValid ? 'Available' : 'None'}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge border ${getPreferenceColor(response.q1_preference)}`}>
                        {response.q1_preference ? 
                          (response.q1_preference.length > 20 ? 
                            response.q1_preference.substring(0, 20) + '...' : 
                            response.q1_preference
                          ) : 
                          'Not specified'
                        }
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge border ${getServiceRatingColor(response.q2_service_rating)}`}>
                        {response.q2_service_rating || 'Not rated'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${response.anonymous === 'Yes' ? 'badge-blue' : 'badge-gray'}`}>
                        {response.anonymous === 'Yes' ? 'Anonymous' : 'Named'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Poor Ratings</h3>
            <p className="text-sm text-gray-600 mb-3">
              Responses with Poor or Very Poor service ratings
            </p>
            <span className="text-2xl font-bold text-red-600">
              {responses.filter(r => r.q2_service_rating === 'Poor' || r.q2_service_rating === 'Very Poor').length}
            </span>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Want to Opt Out</h3>
            <p className="text-sm text-gray-600 mb-3">
              Responses wanting to opt out of HOA landscaping
            </p>
            <span className="text-2xl font-bold text-yellow-600">
              {responses.filter(r => r.q1_preference?.toLowerCase().includes('opt out')).length}
            </span>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Have Contact Info</h3>
            <p className="text-sm text-gray-600 mb-3">
              Responses with email or phone for follow-up
            </p>
            <span className="text-2xl font-bold text-green-600">
              {responses.filter(r => parseContactInfo(r.email_contact).isValid).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResponsesPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResponsesContent />
    </Suspense>
  );
}