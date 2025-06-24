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
    const { data, error } = await supabase
      .from('complete_responses')
      .select('*')
      .eq('response_id', id)
      .single();
    
    if (error) {
      console.error('Error fetching response detail:', error);
      return null;
    }
    
    return data;
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
        
        {/* Review Status (placeholder for future implementation) */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Unreviewed</span>
          </div>
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