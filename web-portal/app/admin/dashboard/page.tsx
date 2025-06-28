import { Suspense } from 'react';
import { Users, AlertCircle, CheckCircle2, BarChart3, Mail, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/admin-client';
import { formatPercentage, CHART_COLORS, SERVICE_RATING_ORDER, parseContactInfo } from '@/lib/utils';
import ServiceRatingChart from '@/components/ServiceRatingChart';
import IssuesOverview from '@/components/IssuesOverview';
import ContactOverview from '@/components/ContactOverview';
import MetricCard from '@/components/MetricCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminGate from '@/components/AdminGate';
import UserStateGuidance from '@/components/UserStateGuidance';

export const dynamic = 'force-dynamic';

interface DashboardStats {
  totalResponses: number;
  anonymousResponses: number;
  poorRatings: number;
  wantOptOut: number;
  hasContactInfo: number;
  irrigationIssues: number;
  unreviewed: number;
  reviewed: number;
  flagged: number;
  contactByType: {
    none: number;
    email: number;
    phone: number;
    both: number;
    other: number;
  };
}

interface ServiceRatingData {
  rating: string;
  count: number;
  percentage: number;
}

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Use service client for admin operations to bypass RLS
    const supabase = getServiceClient();
    
    // Get total responses with review status
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('response_id, anonymous, email_contact, review_status');
    
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
    // Analyze contact information
    const contactAnalysis = { none: 0, email: 0, phone: 0, both: 0, other: 0 };
    let hasContactInfo = 0;
    
    responses?.forEach(r => {
      const contactInfo = parseContactInfo(r.email_contact);
      contactAnalysis[contactInfo.type]++;
      if (contactInfo.isValid) hasContactInfo++;
    });
    
    const irrigationIssues = issues?.filter(i => i.irrigation === 'Yes').length || 0;
    
    // Calculate review status counts
    const unreviewed = responses?.filter(r => !r.review_status || r.review_status === 'unreviewed').length || 0;
    const reviewed = responses?.filter(r => r.review_status === 'reviewed').length || 0;
    const flagged = responses?.filter(r => r.review_status === 'flagged').length || 0;
    
    return {
      totalResponses,
      anonymousResponses,
      poorRatings,
      wantOptOut,
      hasContactInfo,
      irrigationIssues,
      unreviewed,
      reviewed,
      flagged,
      contactByType: contactAnalysis,
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
      unreviewed: 0,
      reviewed: 0,
      flagged: 0,
      contactByType: { none: 0, email: 0, phone: 0, both: 0, other: 0 },
    };
  }
}

async function getServiceRatingData(): Promise<ServiceRatingData[]> {
  try {
    // Use service client for admin operations to bypass RLS
    const supabase = getServiceClient();
    
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

async function AdminDashboardContent() {
  const [stats, serviceRatingData] = await Promise.all([
    getDashboardStats(),
    getServiceRatingData(),
  ]);
  
  const keyMetrics = [
    {
      label: 'Unreviewed Responses',
      value: stats.unreviewed,
      total: stats.totalResponses,
      type: 'warning' as const,
      description: 'Responses that need review and validation',
    },
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
  ];
  
  const reviewMetrics = [
    {
      label: 'Reviewed',
      value: stats.reviewed,
      total: stats.totalResponses,
      type: 'success' as const,
      description: 'Responses verified and approved',
    },
    {
      label: 'Flagged',
      value: stats.flagged,
      total: stats.totalResponses,
      type: 'error' as const,
      description: 'Responses requiring attention or clarification',
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Survey responses and community analytics overview</p>
      </div>

      {/* Admin Guidance */}
      <UserStateGuidance page="admin-dashboard" />

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {keyMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      
      {/* Review Status Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviewMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
        
        {/* Contact Overview */}
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Contact Methods</h2>
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <ContactOverview 
            contactByType={stats.contactByType} 
            totalResponses={stats.totalResponses} 
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGate>
      <Suspense fallback={<LoadingSpinner />}>
        <AdminDashboardContent />
      </Suspense>
    </AdminGate>
  );
}