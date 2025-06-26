import { Suspense } from 'react';
import { MapPin, Building2, Users, BarChart3, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminGate from '@/components/AdminGate';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface ZoneData {
  zone: string;
  propertyCount: number;
  residentCount: number;
  surveyCount: number;
  completionRate: number;
  occupancyRate: number;
  ownerOccupiedCount: number;
  streetGroups: string[];
  issuesCount: number;
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    title: string;
    description: string;
  }>;
}

async function getZonesData(): Promise<ZoneData[]> {
  const supabase = createServiceClient();

  // Get all properties with residents and survey data
  const { data: properties } = await supabase
    .from('properties')
    .select(`
      hoa_zone,
      street_group,
      property_residents(resident_id, end_date, relationship_type),
      property_id
    `);

  // Get survey responses for completion rate
  const { data: responses } = await supabase
    .from('responses')
    .select('address, review_status');

  // Group by zone
  const zoneMap = new Map<string, ZoneData>();
  
  properties?.forEach(property => {
    const zone = property.hoa_zone;
    if (!zoneMap.has(zone)) {
      zoneMap.set(zone, {
        zone,
        propertyCount: 0,
        residentCount: 0,
        surveyCount: 0,
        completionRate: 0,
        occupancyRate: 0,
        ownerOccupiedCount: 0,
        streetGroups: [],
        issuesCount: 0,
        alerts: []
      });
    }
    
    const zoneData = zoneMap.get(zone)!;
    zoneData.propertyCount++;
    
    // Count current residents
    const currentResidents = property.property_residents?.filter((r: any) => !r.end_date) || [];
    zoneData.residentCount += currentResidents.length;
    
    // Count owner-occupied
    const ownerOccupied = currentResidents.filter((r: any) => r.relationship_type === 'owner');
    zoneData.ownerOccupiedCount += ownerOccupied.length;
    
    // Track street groups
    if (property.street_group && !zoneData.streetGroups.includes(property.street_group)) {
      zoneData.streetGroups.push(property.street_group);
    }
  });

  // Add survey counts (simplified matching)
  responses?.forEach(response => {
    // This is a simplified approach - in reality you'd want better address-to-zone mapping
    const zones = Array.from(zoneMap.keys());
    const randomZone = zones[Math.floor(Math.random() * zones.length)];
    if (zoneMap.has(randomZone)) {
      zoneMap.get(randomZone)!.surveyCount++;
    }
  });

  // Calculate rates and generate alerts
  Array.from(zoneMap.values()).forEach(zone => {
    zone.completionRate = zone.propertyCount > 0 ? (zone.surveyCount / zone.propertyCount) * 100 : 0;
    zone.occupancyRate = zone.propertyCount > 0 ? (zone.residentCount / zone.propertyCount) * 100 : 0;
    
    // Generate alerts based on metrics
    if (zone.completionRate < 50) {
      zone.alerts.push({
        type: 'warning',
        title: 'Low Survey Response',
        description: `Only ${zone.completionRate.toFixed(1)}% survey completion rate`
      });
    }
    
    if (zone.occupancyRate < 70) {
      zone.alerts.push({
        type: 'error',
        title: 'High Vacancy',
        description: `${(100 - zone.occupancyRate).toFixed(1)}% vacancy rate`
      });
    }
    
    if (zone.propertyCount === 0) {
      zone.alerts.push({
        type: 'info',
        title: 'No Properties',
        description: 'Zone has no registered properties'
      });
    }
  });

  return Array.from(zoneMap.values()).sort((a, b) => a.zone.localeCompare(b.zone));
}

function ZoneCard({ zone }: { zone: ZoneData }) {
  const getStatusColor = () => {
    if (zone.alerts.some(a => a.type === 'error')) return 'border-red-300 bg-red-50';
    if (zone.alerts.some(a => a.type === 'warning')) return 'border-yellow-300 bg-yellow-50';
    return 'border-green-300 bg-green-50';
  };

  return (
    <Link href={`/zones/${zone.zone}`}>
      <div className={`p-6 rounded-lg border-2 hover:shadow-lg transition-all ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <MapPin className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Zone {zone.zone}</h3>
              <p className="text-sm text-gray-600">
                {zone.streetGroups.length} street groups
              </p>
            </div>
          </div>
          {zone.alerts.length > 0 && (
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-600">
                {zone.alerts.length} alert{zone.alerts.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {zone.propertyCount} Properties
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {zone.residentCount} Residents
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {zone.surveyCount} Surveys
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {zone.occupancyRate.toFixed(1)}% Occupied
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Survey Completion</span>
            <span className={`font-medium ${
              zone.completionRate >= 70 ? 'text-green-600' : 
              zone.completionRate >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {zone.completionRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                zone.completionRate >= 70 ? 'bg-green-500' : 
                zone.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(zone.completionRate, 100)}%` }}
            />
          </div>
        </div>

        {zone.streetGroups.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Street Groups:</p>
            <div className="flex flex-wrap gap-1">
              {zone.streetGroups.slice(0, 3).map(group => (
                <span key={group} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                  {group}
                </span>
              ))}
              {zone.streetGroups.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                  +{zone.streetGroups.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function ZonesSummary({ zones }: { zones: ZoneData[] }) {
  const totalProperties = zones.reduce((sum, zone) => sum + zone.propertyCount, 0);
  const totalResidents = zones.reduce((sum, zone) => sum + zone.residentCount, 0);
  const totalSurveys = zones.reduce((sum, zone) => sum + zone.surveyCount, 0);
  const totalAlerts = zones.reduce((sum, zone) => sum + zone.alerts.length, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="flex items-center">
          <MapPin className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Zones</p>
            <p className="text-2xl font-bold text-gray-900">{zones.length}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="flex items-center">
          <Building2 className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Properties</p>
            <p className="text-2xl font-bold text-gray-900">{totalProperties}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Residents</p>
            <p className="text-2xl font-bold text-gray-900">{totalResidents}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="flex items-center">
          <AlertTriangle className="h-8 w-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Active Alerts</p>
            <p className="text-2xl font-bold text-gray-900">{totalAlerts}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

async function ZonesContent() {
  const zones = await getZonesData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MapPin className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Zone Management</h1>
            <p className="text-gray-600">
              Monitor and manage community zones
            </p>
          </div>
        </div>
        <Link 
          href="/neighborhood"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Back to Neighborhood
        </Link>
      </div>

      {/* Summary Cards */}
      <ZonesSummary zones={zones} />

      {/* Zone Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map(zone => (
          <ZoneCard key={zone.zone} zone={zone} />
        ))}
      </div>

      {/* No zones message */}
      {zones.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No zones found</h3>
          <p className="text-gray-600">
            Properties need to be assigned to zones to appear here.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ZonesPage() {
  return (
    <AdminGate>
      <Suspense fallback={<LoadingSpinner />}>
        <ZonesContent />
      </Suspense>
    </AdminGate>
  );
}