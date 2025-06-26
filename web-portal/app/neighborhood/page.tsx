import { Suspense } from 'react';
import { TrendingUp, Users, Building2, BarChart3, AlertTriangle, CheckCircle, Activity, Star } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminGate from '@/components/AdminGate';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface CommunityMetrics {
  totalProperties: number;
  totalResidents: number;
  totalPeople: number;
  totalSurveyResponses: number;
  occupancyRate: number;
  surveyCompletionRate: number;
  averageSatisfaction: number;
  zoneMetrics: Array<{
    zone: string;
    propertyCount: number;
    residentCount: number;
    surveyCount: number;
    completionRate: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'survey_completed' | 'resident_added' | 'property_updated';
    description: string;
    date: string;
    zone?: string;
  }>;
  communityAlerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    description: string;
    zone?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

async function getCommunityMetrics(): Promise<CommunityMetrics> {
  const supabase = createServiceClient();

  // Get total properties
  const { count: totalProperties } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });

  // Get total people
  const { count: totalPeople } = await supabase
    .from('people')
    .select('*', { count: 'exact', head: true });

  // Get total current residents
  const { count: totalResidents } = await supabase
    .from('property_residents')
    .select('*', { count: 'exact', head: true })
    .is('end_date', null);

  // Get total survey responses
  const { count: totalSurveyResponses } = await supabase
    .from('responses')
    .select('*', { count: 'exact', head: true });

  // Get properties with zone data for zone metrics
  const { data: propertiesWithZones } = await supabase
    .from('properties')
    .select(`
      hoa_zone,
      property_residents!inner(resident_id, end_date)
    `);

  // Get responses for completion rate calculation
  const { data: responses } = await supabase
    .from('responses')
    .select('address, review_status');

  // Calculate zone metrics
  const zoneMap = new Map();
  propertiesWithZones?.forEach(property => {
    const zone = property.hoa_zone;
    if (!zoneMap.has(zone)) {
      zoneMap.set(zone, {
        zone,
        propertyCount: 0,
        residentCount: 0,
        surveyCount: 0
      });
    }
    
    const zoneData = zoneMap.get(zone);
    zoneData.propertyCount++;
    
    // Count current residents
    const currentResidents = property.property_residents?.filter((r: any) => !r.end_date) || [];
    zoneData.residentCount += currentResidents.length;
  });

  // Add survey counts to zones (simplified - would need better address matching)
  responses?.forEach(response => {
    // This is a simplified approach - in reality you'd want better address-to-zone mapping
    const zones = Array.from(zoneMap.keys());
    const randomZone = zones[Math.floor(Math.random() * zones.length)];
    if (zoneMap.has(randomZone)) {
      zoneMap.get(randomZone).surveyCount++;
    }
  });

  const zoneMetrics = Array.from(zoneMap.values()).map(zone => ({
    ...zone,
    completionRate: zone.propertyCount > 0 ? (zone.surveyCount / zone.propertyCount) * 100 : 0
  }));

  // Calculate community-wide metrics
  const occupancyRate = totalProperties ? (totalResidents || 0) / totalProperties * 100 : 0;
  const surveyCompletionRate = totalProperties ? (totalSurveyResponses || 0) / totalProperties * 100 : 0;

  // Generate recent activity (placeholder)
  const recentActivity = [
    {
      id: '1',
      type: 'survey_completed' as const,
      description: 'New landscaping survey completed',
      date: new Date().toISOString(),
      zone: '2'
    },
    {
      id: '2',
      type: 'resident_added' as const,
      description: 'New resident added to property',
      date: new Date(Date.now() - 86400000).toISOString(),
      zone: '1'
    },
    {
      id: '3',
      type: 'property_updated' as const,
      description: 'Property information updated',
      date: new Date(Date.now() - 172800000).toISOString(),
      zone: '3'
    }
  ];

  // Generate community alerts (placeholder)
  const communityAlerts = [
    {
      id: '1',
      type: 'warning' as const,
      title: 'Low Survey Response Rate',
      description: 'Zone 3 has only 45% survey completion rate',
      zone: '3',
      priority: 'medium' as const
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'New Residents Welcome',
      description: '5 new residents added this month',
      priority: 'low' as const
    }
  ];

  return {
    totalProperties: totalProperties || 0,
    totalResidents: totalResidents || 0,
    totalPeople: totalPeople || 0,
    totalSurveyResponses: totalSurveyResponses || 0,
    occupancyRate,
    surveyCompletionRate,
    averageSatisfaction: 4.2, // Placeholder
    zoneMetrics,
    recentActivity,
    communityAlerts
  };
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  trend,
  link 
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: string;
  trend?: { value: number; label: string };
  link?: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100',
    gray: 'text-gray-600 bg-gray-100'
  };

  const content = (
    <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              {trend && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  trend.value >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </div>
              )}
            </dd>
            <dd className="text-sm text-gray-500">{subtitle}</dd>
          </dl>
        </div>
      </div>
    </div>
  );

  return link ? <Link href={link}>{content}</Link> : content;
}

function ZoneOverview({ zoneMetrics }: { zoneMetrics: CommunityMetrics['zoneMetrics'] }) {
  return (
    <div className="bg-white shadow-card rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Zone Performance</h3>
          <Link 
            href="/zones" 
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            View All Zones →
          </Link>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {zoneMetrics.map((zone) => (
            <Link 
              key={zone.zone}
              href={`/zones/${zone.zone}`}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">Zone {zone.zone}</div>
                <div className="mt-2 space-y-1">
                  <div className="text-sm text-gray-600">{zone.propertyCount} Properties</div>
                  <div className="text-sm text-gray-600">{zone.residentCount} Residents</div>
                  <div className="text-sm text-gray-600">{zone.surveyCount} Surveys</div>
                  <div className={`text-sm font-medium ${
                    zone.completionRate >= 70 ? 'text-green-600' : 
                    zone.completionRate >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {zone.completionRate.toFixed(1)}% Response Rate
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommunityAlerts({ alerts }: { alerts: CommunityMetrics['communityAlerts'] }) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      default:
        return <Activity className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-white shadow-card rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Community Alerts</h3>
      </div>
      <div className="p-6">
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                  <div className="text-sm text-gray-600">{alert.description}</div>
                  {alert.zone && (
                    <div className="text-xs text-gray-500 mt-1">Zone {alert.zone}</div>
                  )}
                </div>
                <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                  alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                  alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alert.priority}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
            <p>No alerts - community is running smoothly!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RecentActivity({ activities }: { activities: CommunityMetrics['recentActivity'] }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'survey_completed':
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
      case 'resident_added':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'property_updated':
        return <Building2 className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white shadow-card rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900">{activity.description}</div>
                <div className="text-xs text-gray-500">
                  {new Date(activity.date).toLocaleDateString()} 
                  {activity.zone && ` • Zone ${activity.zone}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function NeighborhoodContent() {
  const metrics = await getCommunityMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Star className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Neighborhood Overview</h1>
            <p className="text-gray-600">
              Community health and performance metrics
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Properties"
          value={metrics.totalProperties}
          subtitle="Community properties"
          icon={Building2}
          color="blue"
          link="/properties"
        />
        <MetricCard
          title="Total Residents"
          value={metrics.totalResidents}
          subtitle="Active residents"
          icon={Users}
          color="green"
          link="/people"
        />
        <MetricCard
          title="Survey Responses"
          value={metrics.totalSurveyResponses}
          subtitle={`${metrics.surveyCompletionRate.toFixed(1)}% completion rate`}
          icon={BarChart3}
          color="purple"
          link="/responses"
        />
        <MetricCard
          title="Occupancy Rate"
          value={`${metrics.occupancyRate.toFixed(1)}%`}
          subtitle="Properties with residents"
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Zone Overview */}
      <ZoneOverview zoneMetrics={metrics.zoneMetrics} />

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommunityAlerts alerts={metrics.communityAlerts} />
        <RecentActivity activities={metrics.recentActivity} />
      </div>
    </div>
  );
}

export default function NeighborhoodPage() {
  return (
    <AdminGate>
      <Suspense fallback={<LoadingSpinner />}>
        <NeighborhoodContent />
      </Suspense>
    </AdminGate>
  );
}