import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { MapPin, Building2, Users, BarChart3, TrendingUp, AlertTriangle, Calendar, Phone, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminGate from '@/components/AdminGate';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface ZoneDetailsData {
  zone: string;
  propertyCount: number;
  residentCount: number;
  surveyCount: number;
  completionRate: number;
  occupancyRate: number;
  ownerOccupiedCount: number;
  streetGroups: Array<{
    name: string;
    propertyCount: number;
    residentCount: number;
  }>;
  properties: Array<{
    property_id: string;
    address: string;
    lot_number: string | null;
    street_group: string | null;
    current_residents: number;
    primary_contact_name: string | null;
    primary_contact_email: string | null;
    primary_contact_phone: string | null;
    survey_count: number;
    last_survey_date: string | null;
    status: 'occupied' | 'vacant' | 'owner_occupied';
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    title: string;
    description: string;
    property_address?: string;
  }>;
  recentActivity: Array<{
    id: string;
    type: 'survey_completed' | 'resident_added' | 'property_updated';
    description: string;
    date: string;
  }>;
}

async function getZoneDetails(zone: string): Promise<ZoneDetailsData> {
  const supabase = createServiceClient();

  // Get properties in this zone with residents
  const { data: properties, error } = await supabase
    .from('properties')
    .select(`
      property_id,
      address,
      lot_number,
      street_group,
      hoa_zone,
      property_residents (
        resident_id,
        end_date,
        relationship_type,
        is_primary_contact,
        people (
          first_name,
          last_name,
          email,
          phone
        )
      )
    `)
    .eq('hoa_zone', zone)
    .order('address');

  if (error) {
    console.error('Error fetching zone properties:', error);
    notFound();
  }

  if (!properties || properties.length === 0) {
    notFound();
  }

  // Get survey responses for this zone (simplified matching)
  const { data: responses } = await supabase
    .from('responses')
    .select('address, created_at, review_status');

  // Process properties data
  const processedProperties = properties.map(property => {
    const currentResidents = property.property_residents?.filter((r: any) => !r.end_date) || [];
    const primaryContact = currentResidents.find((r: any) => r.is_primary_contact);
    const ownerResidents = currentResidents.filter((r: any) => r.relationship_type === 'owner');
    
    let status: 'occupied' | 'vacant' | 'owner_occupied' = 'vacant';
    if (ownerResidents.length > 0) {
      status = 'owner_occupied';
    } else if (currentResidents.length > 0) {
      status = 'occupied';
    }

    const contactPerson = primaryContact?.people ? 
      (Array.isArray(primaryContact.people) ? primaryContact.people[0] : primaryContact.people) : null;

    return {
      property_id: property.property_id,
      address: property.address,
      lot_number: property.lot_number,
      street_group: property.street_group,
      current_residents: currentResidents.length,
      primary_contact_name: contactPerson ? `${contactPerson.first_name} ${contactPerson.last_name}`.trim() : null,
      primary_contact_email: contactPerson?.email || null,
      primary_contact_phone: contactPerson?.phone || null,
      survey_count: 0, // TODO: Match with survey responses
      last_survey_date: null,
      status
    };
  });

  // Calculate street group statistics
  const streetGroupMap = new Map();
  processedProperties.forEach(property => {
    const group = property.street_group || 'Unassigned';
    if (!streetGroupMap.has(group)) {
      streetGroupMap.set(group, { name: group, propertyCount: 0, residentCount: 0 });
    }
    const groupData = streetGroupMap.get(group);
    groupData.propertyCount++;
    groupData.residentCount += property.current_residents;
  });

  const streetGroups = Array.from(streetGroupMap.values());

  // Calculate zone metrics
  const propertyCount = processedProperties.length;
  const residentCount = processedProperties.reduce((sum, p) => sum + p.current_residents, 0);
  const surveyCount = responses?.length || 0; // Simplified
  const completionRate = propertyCount > 0 ? (surveyCount / propertyCount) * 100 : 0;
  const occupancyRate = propertyCount > 0 ? (residentCount / propertyCount) * 100 : 0;
  const ownerOccupiedCount = processedProperties.filter(p => p.status === 'owner_occupied').length;

  // Generate alerts
  const alerts = [];
  if (completionRate < 50) {
    alerts.push({
      id: '1',
      type: 'warning' as const,
      title: 'Low Survey Response Rate',
      description: `Only ${completionRate.toFixed(1)}% of properties have completed surveys`
    });
  }
  
  if (occupancyRate < 70) {
    alerts.push({
      id: '2',
      type: 'error' as const,
      title: 'High Vacancy Rate',
      description: `${(100 - occupancyRate).toFixed(1)}% of properties appear vacant`
    });
  }

  // Find vacant properties for alerts
  const vacantProperties = processedProperties.filter(p => p.status === 'vacant');
  if (vacantProperties.length > 0) {
    vacantProperties.slice(0, 3).forEach((property, index) => {
      alerts.push({
        id: `vacant-${index}`,
        type: 'info' as const,
        title: 'Vacant Property',
        description: 'Property appears to have no current residents',
        property_address: property.address
      });
    });
  }

  // Generate recent activity (placeholder)
  const recentActivity = [
    {
      id: '1',
      type: 'survey_completed' as const,
      description: 'New landscaping survey completed',
      date: new Date().toISOString()
    },
    {
      id: '2',
      type: 'resident_added' as const, 
      description: 'New resident added to property',
      date: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  return {
    zone,
    propertyCount,
    residentCount,
    surveyCount,
    completionRate,
    occupancyRate,
    ownerOccupiedCount,
    streetGroups,
    properties: processedProperties,
    alerts,
    recentActivity
  };
}

function ZoneHeader({ zone }: { zone: ZoneDetailsData }) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 sm:truncate">
                  Zone {zone.zone}
                </h1>
              </div>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Building2 className="h-4 w-4 mr-1" />
                  {zone.propertyCount} Properties
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  {zone.residentCount} Residents
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  {zone.completionRate.toFixed(1)}% Survey Completion
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex lg:mt-0 lg:ml-4 space-x-3">
          <Link 
            href="/zones"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            ← Back to Zones
          </Link>
        </div>
      </div>
    </div>
  );
}

function ZoneMetrics({ zone }: { zone: ZoneDetailsData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="flex items-center">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Total Properties</p>
            <p className="text-2xl font-bold text-gray-900">{zone.propertyCount}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Current Residents</p>
            <p className="text-2xl font-bold text-gray-900">{zone.residentCount}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="flex items-center">
          <TrendingUp className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
            <p className="text-2xl font-bold text-gray-900">{zone.occupancyRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
        <div className="flex items-center">
          <BarChart3 className="h-8 w-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">Survey Completion</p>
            <p className="text-2xl font-bold text-gray-900">{zone.completionRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StreetGroupsOverview({ streetGroups }: { streetGroups: ZoneDetailsData['streetGroups'] }) {
  return (
    <div className="bg-white shadow-card rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Street Groups</h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {streetGroups.map(group => (
            <div key={group.name} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">{group.name}</h4>
              <div className="mt-2 space-y-1">
                <div className="text-sm text-gray-600">
                  {group.propertyCount} properties
                </div>
                <div className="text-sm text-gray-600">
                  {group.residentCount} residents
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PropertiesTable({ properties }: { properties: ZoneDetailsData['properties'] }) {
  const getStatusBadge = (status: string) => {
    const colors = {
      'owner_occupied': 'bg-green-100 text-green-800',
      'occupied': 'bg-blue-100 text-blue-800', 
      'vacant': 'bg-gray-100 text-gray-800'
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`;
  };

  return (
    <div className="bg-white shadow-card rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Properties ({properties.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Street Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Residents
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Primary Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map(property => (
              <tr key={property.property_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {property.address}
                      </div>
                      {property.lot_number && (
                        <div className="text-sm text-gray-500">
                          Lot {property.lot_number}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {property.street_group || 'Unassigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{property.current_residents}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {property.primary_contact_name ? (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {property.primary_contact_name}
                      </div>
                      <div className="text-sm text-gray-500 space-x-2">
                        {property.primary_contact_email && (
                          <a href={`mailto:${property.primary_contact_email}`} className="text-primary-600 hover:text-primary-700">
                            <Mail className="h-4 w-4 inline" />
                          </a>
                        )}
                        {property.primary_contact_phone && (
                          <a href={`tel:${property.primary_contact_phone}`} className="text-primary-600 hover:text-primary-700">
                            <Phone className="h-4 w-4 inline" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">No contact</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(property.status)}>
                    {property.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link 
                    href={`/properties/${property.property_id}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ZoneAlerts({ alerts }: { alerts: ZoneDetailsData['alerts'] }) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <div className="bg-white shadow-card rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Zone Alerts</h3>
      </div>
      <div className="p-6">
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{alert.title}</div>
                  <div className="text-sm text-gray-600">{alert.description}</div>
                  {alert.property_address && (
                    <div className="text-xs text-gray-500 mt-1">{alert.property_address}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <AlertTriangle className="h-12 w-12 text-green-400 mx-auto mb-2" />
            <p>No alerts - zone is operating smoothly!</p>
          </div>
        )}
      </div>
    </div>
  );
}

async function ZoneDetailContent({ zone }: { zone: string }) {
  const zoneData = await getZoneDetails(zone);

  return (
    <div className="space-y-6">
      <ZoneHeader zone={zoneData} />
      
      {/* Metrics */}
      <ZoneMetrics zone={zoneData} />
      
      {/* Street Groups Overview */}
      <StreetGroupsOverview streetGroups={zoneData.streetGroups} />
      
      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PropertiesTable properties={zoneData.properties} />
        </div>
        <div>
          <ZoneAlerts alerts={zoneData.alerts} />
        </div>
      </div>
    </div>
  );
}

export default function ZoneDetailPage({ params }: { params: { zone: string } }) {
  return (
    <AdminGate>
      <Suspense fallback={<LoadingSpinner />}>
        <ZoneDetailContent zone={params.zone} />
      </Suspense>
    </AdminGate>
  );
}