import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, Edit3, Save, X, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { parseContactInfo } from '@/lib/utils';
import ResponseEditor from '@/components/ResponseEditor';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ResponseDetailData {
  response_id: string;
  address: string | null;
  name: string | null;
  email_contact: string | null;
  anonymous: string;
  review_status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  
  // Q1/Q2: Preference and Rating
  q1_preference: string | null;
  q2_service_rating: string | null;
  q1_q2_notes: string | null;
  
  // Q3: Opt-out reasons
  q3_maintain_self: string | null;
  q3_quality: string | null;
  q3_pet_safety: string | null;
  q3_privacy: string | null;
  q3_other_text: string | null;
  
  // Q4: Issues
  irrigation: string | null;
  poor_mowing: string | null;
  property_damage: string | null;
  missed_service: string | null;
  inadequate_weeds: string | null;
  irrigation_detail: string | null;
  other_issues: string | null;
  
  // Q5/Q6: Construction and group action
  q5_construction_issues: string | null;
  q5_explanation: string | null;
  q6_group_action: string | null;
  
  // Q7: Interest areas
  plant_selection: string | null;
  watering_irrigation: string | null;
  fertilizing_pest: string | null;
  lawn_maintenance: string | null;
  seasonal_planning: string | null;
  other_interests: string | null;
  
  // Q8: Equipment
  lawn_mower: string | null;
  trimmer: string | null;
  blower: string | null;
  basic_tools: string | null;
  truck_trailer: string | null;
  equipment_notes: string | null;
  
  // Q9: Dues preference
  dues_preference: string | null;
  dues_notes: string | null;
  
  // Q10: Biggest concern
  biggest_concern: string | null;
  
  // Q11: Cost reduction
  cost_reduction_ideas: string | null;
  
  // Q12: Involvement
  involvement_preference: string | null;
  involvement_notes: string | null;
}

async function getResponseDetail(id: string): Promise<ResponseDetailData | null> {
  try {
    // Get response data and review data separately since complete_responses view 
    // hasn't been updated with review columns yet
    const [responseResult, reviewResult] = await Promise.all([
      supabase.from('complete_responses').select('*').eq('response_id', id).single(),
      supabase.from('responses').select('review_status, reviewed_by, reviewed_at, review_notes').eq('response_id', id).single()
    ]);

    if (responseResult.error) {
      console.error('Error fetching response detail:', responseResult.error);
      return null;
    }

    if (reviewResult.error) {
      console.error('Error fetching review data:', reviewResult.error);
      // Continue without review data if it fails
    }

    // Merge the data
    const combinedData = {
      ...responseResult.data,
      review_status: reviewResult.data?.review_status || 'unreviewed',
      reviewed_by: reviewResult.data?.reviewed_by || null,
      reviewed_at: reviewResult.data?.reviewed_at || null,
      review_notes: reviewResult.data?.review_notes || null,
    };
    
    return combinedData;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

async function ResponseDetailContent({ id }: { id: string }) {
  const response = await getResponseDetail(id);
  
  if (!response) {
    notFound();
  }
  
  const contactInfo = parseContactInfo(response.email_contact);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/responses"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Responses</span>
          </Link>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Response {response.response_id}
            </h1>
            <p className="text-gray-600">
              {response.anonymous === 'Yes' ? 'Anonymous Response' : response.name || 'Named Response'}
            </p>
          </div>
        </div>
        
        {/* Review Status */}
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
            response.review_status === 'reviewed' ? 'bg-green-100 text-green-800' :
            response.review_status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            response.review_status === 'flagged' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {response.review_status === 'reviewed' ? <CheckCircle className="h-4 w-4" /> :
             response.review_status === 'flagged' ? <AlertCircle className="h-4 w-4" /> :
             <AlertCircle className="h-4 w-4" />}
            <span>
              {response.review_status.charAt(0).toUpperCase() + response.review_status.slice(1).replace('_', ' ')}
            </span>
          </div>
          {response.reviewed_by && (
            <span className="text-sm text-gray-600">
              by {response.reviewed_by}
              {response.reviewed_at && (
                <span className="ml-1">
                  on {new Date(response.reviewed_at).toLocaleDateString()}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
      
      {/* Response Editor */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200">
        <ResponseEditor response={response} />
      </div>
    </div>
  );
}

export default function ResponseDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ResponseDetailContent id={params.id} />
    </Suspense>
  );
}