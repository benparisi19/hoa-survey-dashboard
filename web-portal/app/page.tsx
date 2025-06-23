import { Suspense } from 'react';
import { Users, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPercentage, CHART_COLORS, SERVICE_RATING_ORDER, PREFERENCE_ORDER } from '@/lib/utils';
import ServiceRatingChart from '@/components/ServiceRatingChart';
import PreferenceChart from '@/components/PreferenceChart';
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

interface PreferenceData {
  preference: string;
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

async function getPreferenceData(): Promise<PreferenceData[]> {
  try {
    const { data, error } = await supabase
      .from('q1_q2_preference_rating')
      .select('q1_preference');
    
    if (error) throw error;
    
    const counts: Record<string, number> = {};
    const total = data?.length || 0;
    
    data?.forEach(item => {
      const preference = item.q1_preference || 'Not specified';
      counts[preference] = (counts[preference] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([preference, count]) => ({
        preference,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error fetching preference data:', error);
    return [];
  }
}

async function DashboardContent() {
  const [stats, serviceRatingData, preferenceData] = await Promise.all([
    getDashboardStats(),
    getServiceRatingData(),
    getPreferenceData(),
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              HOA Survey Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Comprehensive analysis of 113 landscaping survey responses
            </p>
          </div>
          <div className="mt-4 md:mt-0 md:ml-4">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      
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
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <ServiceRatingChart data={serviceRatingData} />
        </div>
        
        {/* Preference Chart */}
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Landscaping Preferences</h2>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <PreferenceChart data={preferenceData} />
        </div>
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
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/responses?filter=poor-rating"
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div>
                <h3 className="font-medium text-gray-900">Contact Dissatisfied</h3>
                <p className="text-sm text-gray-500">Follow up with poor ratings</p>
              </div>
            </div>
          </a>
          
          <a
            href="/responses?filter=irrigation-issues"
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-blue-500" />
              <div>
                <h3 className="font-medium text-gray-900">Fix Irrigation</h3>
                <p className="text-sm text-gray-500">Address water problems</p>
              </div>
            </div>
          </a>
          
          <a
            href="/analysis"
            className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-medium text-gray-900">Detailed Analysis</h3>
                <p className="text-sm text-gray-500">View comprehensive data</p>
              </div>
            </div>
          </a>
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