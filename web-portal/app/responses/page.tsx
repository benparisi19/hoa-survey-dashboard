import { Suspense } from 'react';
import { Users, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ResponsesTable from '@/components/ResponsesTable';
import LoadingSpinner from '@/components/LoadingSpinner';

export interface ResponseData {
  response_id: string;
  address: string | null;
  name: string | null;
  email_contact: string | null;
  anonymous: string;
  review_status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  q1_preference: string | null;
  q2_service_rating: string | null;
  
  // Opt-out reasons
  q3_maintain_self: string | null;
  q3_quality: string | null;
  q3_pet_safety: string | null;
  q3_privacy: string | null;
  q3_other_text: string | null;
  
  // Landscaping issues
  irrigation: string | null;
  poor_mowing: string | null;
  property_damage: string | null;
  missed_service: string | null;
  inadequate_weeds: string | null;
  irrigation_detail: string | null;
  other_issues: string | null;
  
  // Construction and group action
  q5_construction_issues: string | null;
  q5_explanation: string | null;
  q6_group_action: string | null;
  
  // Interest areas
  plant_selection: string | null;
  watering_irrigation: string | null;
  fertilizing_pest: string | null;
  lawn_maintenance: string | null;
  seasonal_planning: string | null;
  other_interests: string | null;
  
  // Equipment
  lawn_mower: string | null;
  trimmer: string | null;
  blower: string | null;
  basic_tools: string | null;
  truck_trailer: string | null;
  
  // Dues and involvement
  dues_preference: string | null;
  biggest_concern: string | null;
  cost_reduction_ideas: string | null;
  involvement_preference: string | null;
  
  // Notes summary
  total_notes: number;
  follow_up_notes: number;
  critical_notes: number;
}

export interface SurveyNote {
  note_id: number;
  response_id: string;
  section: string;
  question_context: string | null;
  note_text: string;
  note_type: string;
  requires_follow_up: boolean;
  priority: string;
  admin_notes: string | null;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

async function getResponsesData(): Promise<ResponseData[]> {
  try {
    // Fetch from complete_responses view and add review status from responses table
    const { data: responsesData, error: responsesError } = await supabase
      .from('complete_responses')
      .select('*')
      .order('response_id');
    
    if (responsesError) throw responsesError;
    
    // Fetch review status data separately
    const { data: reviewData, error: reviewError } = await supabase
      .from('responses')
      .select('response_id, review_status, reviewed_by, reviewed_at')
      .order('response_id');
    
    if (reviewError) throw reviewError;
    
    // Merge the data
    const mergedData = responsesData?.map(response => {
      const reviewInfo = reviewData?.find(r => r.response_id === response.response_id);
      return {
        ...response,
        review_status: reviewInfo?.review_status || 'unreviewed',
        reviewed_by: reviewInfo?.reviewed_by || null,
        reviewed_at: reviewInfo?.reviewed_at || null
      };
    }) || [];
    
    return mergedData;
  } catch (error) {
    console.error('Error fetching responses data:', error);
    return [];
  }
}

async function ResponsesContent() {
  const responses = await getResponsesData();
  
  // Calculate summary statistics
  const stats = {
    total: responses.length,
    unreviewed: responses.filter(r => (r.review_status || 'unreviewed') === 'unreviewed').length,
    reviewed: responses.filter(r => r.review_status === 'reviewed').length,
    flagged: responses.filter(r => r.review_status === 'flagged').length,
    withNotes: responses.filter(r => (r.total_notes || 0) > 0).length,
    criticalNotes: responses.filter(r => (r.critical_notes || 0) > 0).length,
    followUpNotes: responses.filter(r => (r.follow_up_notes || 0) > 0).length,
    veryPoor: responses.filter(r => r.q2_service_rating === 'Very Poor').length,
    wantsOptOut: responses.filter(r => r.q1_preference?.toLowerCase().includes('opt out')).length,
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Survey Responses</h1>
            <p className="text-gray-600">
              View and analyze individual survey responses ({responses.length} total)
            </p>
          </div>
        </div>
      </div>
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">{stats.unreviewed}</div>
          <div className="text-sm text-gray-600">Unreviewed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.flagged}</div>
          <div className="text-sm text-gray-600">Flagged</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.withNotes}</div>
          <div className="text-sm text-gray-600">With Notes</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.criticalNotes}</div>
          <div className="text-sm text-gray-600">Critical</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.followUpNotes}</div>
          <div className="text-sm text-gray-600">Follow-up</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.veryPoor}</div>
          <div className="text-sm text-gray-600">Very Poor</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{stats.wantsOptOut}</div>
          <div className="text-sm text-gray-600">Want Opt-out</div>
        </div>
      </div>
      
      {/* Responses Table */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200">
        <ResponsesTable responses={responses} />
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