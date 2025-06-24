import { Suspense } from 'react';
import { Users, AlertCircle, CheckCircle2, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPercentage, CHART_COLORS, SERVICE_RATING_ORDER } from '@/lib/utils';
import ServiceRatingChart from '@/components/ServiceRatingChart';
import IssuesOverview from '@/components/IssuesOverview';
import MetricCard from '@/components/MetricCard';
import LoadingSpinner from '@/components/LoadingSpinner';

interface DashboardStats {
  totalResponses: number;
  anonymousResponses: number;
  poorRatings: number;
  wantOptOut: number;
  hasContactInfo: number;
  irrigationIssues: number;
}

interface ServiceRatingData {
  rating: string;
  count: number;
  percentage: number;
}

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Get total responses
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('response_id, anonymous, email_contact');
    
    if (responsesError) throw responsesError;
    
    // Get service ratings
    const { data: ratings, error: ratingsError } = await supabase
      .from('q1_q2_preference_rating')
      .select('q2_service_rating, q1_preference');
    
    if (ratingsError) throw ratingsError;
    
    // Get landscaping issues
    const { data: issues, error: issuesError } = await supabase
      .from('q4_landscaping_issues')
      .select('irrigation');
    
    if (issuesError) throw issuesError;
    
    const totalResponses = responses?.length || 0;
    const anonymousResponses = responses?.filter(r => r.anonymous === 'Yes').length || 0;
    const poorRatings = ratings?.filter(r => 
      r.q2_service_rating === 'Poor' || r.q2_service_rating === 'Very Poor'
    ).length || 0;
    const wantOptOut = ratings?.filter(r => 
      r.q1_preference?.toLowerCase().includes('opt out')
    ).length || 0;
    const hasContactInfo = responses?.filter(r => 
      r.email_contact && 
      r.email_contact !== 'Not provided' && 
      r.email_contact.trim() !== ''
    ).length || 0;
    const irrigationIssues = issues?.filter(i => i.irrigation === 'Yes').length || 0;
    
    return {
      totalResponses,
      anonymousResponses,
      poorRatings,
      wantOptOut,
      hasContactInfo,
      irrigationIssues,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalResponses: 0,
      anonymousResponses: 0,
      poorRatings: 0,
      wantOptOut: 0,
      hasContactInfo: 0,
      irrigationIssues: 0,
    };
  }
}

async function getServiceRatingData(): Promise<ServiceRatingData[]> {
  try {
    const { data, error } = await supabase
      .from('q1_q2_preference_rating')
      .select('q2_service_rating');
    
    if (error) throw error;
    
    const counts: Record<string, number> = {};
    const total = data?.length || 0;
    
    data?.forEach(item => {
      const rating = item.q2_service_rating || 'Not specified';
      counts[rating] = (counts[rating] || 0) + 1;
    });
    
    return SERVICE_RATING_ORDER
      .filter(rating => counts[rating] > 0)
      .map(rating => ({
        rating,
        count: counts[rating],
        percentage: Math.round((counts[rating] / total) * 100),
      }));
  } catch (error) {
    console.error('Error fetching service rating data:', error);
    return [];
  }
}

async function DashboardContent() {
  const [stats, serviceRatingData] = await Promise.all([
    getDashboardStats(),
    getServiceRatingData(),
  ]);
  
  const alertMetrics = [
    {
      label: 'Poor Service Ratings',
      value: stats.poorRatings,
      total: stats.totalResponses,
      type: 'error' as const,
      description: 'Residents rating service as Poor or Very Poor',
    },
    {
      label: 'Want to Opt Out',
      value: stats.wantOptOut,
      total: stats.totalResponses,
      type: 'warning' as const,
      description: 'Residents who want to opt out of HOA landscaping',
    },
    {
      label: 'Irrigation Issues',
      value: stats.irrigationIssues,
      total: stats.totalResponses,
      type: 'error' as const,
      description: 'Properties reporting irrigation problems',
    },
  ];
  
  const positiveMetrics = [
    {
      label: 'Total Responses',
      value: stats.totalResponses,
      total: stats.totalResponses,
      type: 'success' as const,
      description: 'Complete survey responses received',
    },
    {
      label: 'Contact Information',
      value: stats.hasContactInfo,
      total: stats.totalResponses,
      type: 'info' as const,
      description: 'Responses with contact information for follow-up',
    },
  ];
  
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {positiveMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
        {alertMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Rating Chart */}
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Service Ratings</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <ServiceRatingChart data={serviceRatingData} />
        </div>
        
        {/* Issues Overview */}
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Common Issues</h2>
            <AlertCircle className="h-5 w-5 text-gray-400" />
          </div>
          <Suspense fallback={<LoadingSpinner />}>
            <IssuesOverview />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
  );
}