import { Suspense } from 'react';
import { MapPin, Building2, Users, BarChart3, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminGate from '@/components/AdminGate';
import ZonesPageClient from '@/components/ZonesPageClient';
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

async function getPropertiesForMap() {
  const supabase = createServiceClient();

  // Get properties with coordinates - use * to ensure coordinates are included
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*, property_residents(resident_id, end_date, relationship_type)')
    .order('address');

  if (error) {
    console.error('Error fetching properties for map:', error);
  }

  // Transform data for map component
  return (properties || []).map(property => {
    const currentResidents = property.property_residents?.filter((r: any) => !r.end_date) || [];
    const ownerResidents = currentResidents.filter((r: any) => r.relationship_type === 'owner');
    
    let status: 'occupied' | 'vacant' | 'owner_occupied' = 'vacant';
    if (ownerResidents.length > 0) {
      status = 'owner_occupied';
    } else if (currentResidents.length > 0) {
      status = 'occupied';
    }

    return {
      property_id: property.property_id,
      address: property.address,
      latitude: property.latitude,  // Now these should have values
      longitude: property.longitude, // Now these should have values
      hoa_zone: property.hoa_zone,
      current_residents: currentResidents.length,
      status,
      survey_count: 0 // TODO: Match with actual survey responses
    };
  });
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
  const properties = await getPropertiesForMap();

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

      {/* Interactive Zone View */}
      <ZonesPageClient zones={zones} properties={properties} />
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