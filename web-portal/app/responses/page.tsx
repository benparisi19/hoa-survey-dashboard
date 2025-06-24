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
  q1_preference: string | null;
  q2_service_rating: string | null;
  q1_q2_notes: string | null;
  
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
  equipment_notes: string | null;
  
  // Dues and involvement
  dues_preference: string | null;
  dues_notes: string | null;
  biggest_concern: string | null;
  cost_reduction_ideas: string | null;
  involvement_preference: string | null;
  involvement_notes: string | null;
}

async function getResponsesData(): Promise<ResponseData[]> {
  try {
    // Use the pre-built complete_responses view
    const { data, error } = await supabase
      .from('complete_responses')
      .select('*')
      .order('response_id');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching responses data:', error);
    return [];
  }
}

async function ResponsesContent() {
  const responses = await getResponsesData();
  
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