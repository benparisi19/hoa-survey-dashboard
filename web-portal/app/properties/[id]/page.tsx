import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Building2, Users, MapPin, Phone, Mail, Calendar, AlertTriangle, CheckCircle, Settings, MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';

interface PropertyDetailsData {
  property_id: string;
  address: string;
  lot_number: string;
  hoa_zone: string;
  street_group: string;
  property_type: string;
  square_footage: number;
  lot_size_sqft: number;
  year_built: number;
  special_features: any;
  notes: string;
  current_residents: Array<{
    resident_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    relationship_type: string;
    is_primary_contact: boolean;
    start_date: string;
  }>;
  survey_history: Array<{
    survey_id: string;
    survey_name: string;
    survey_type: string;
    completed_date: string;
    status: string;
    respondent: string;
  }>;
  recent_activity: Array<{
    activity_id: string;
    type: string;
    description: string;
    date: string;
    status: string;
  }>;
  issues_count: number;
  status: 'active' | 'vacant' | 'issue' | 'compliant';
}

async function getPropertyDetails(id: string): Promise<PropertyDetailsData> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/properties/${id}`, {
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch property details');
  }

  return response.json();
}

function PropertyHeader({ property }: { property: PropertyDetailsData }) {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-gray-400 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:truncate">
                {property.address}
              </h1>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  Lot {property.lot_number} • Zone {property.hoa_zone} • {property.street_group}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-shrink-0 lg:mt-0 lg:ml-4">
          <Link
            href={`/properties/${property.property_id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Edit Property
          </Link>
          <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact Residents
          </button>
          <button className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Survey
          </button>
        </div>
      </div>
    </div>
  );
}

function ResidentsSection({ residents }: { residents: PropertyDetailsData['current_residents'] }) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Current Residents
        </h3>
      </div>
      <div className="px-6 py-4">
        {residents.length > 0 ? (
          <div className="space-y-4">
            {residents.map((resident) => (
              <div key={resident.resident_id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {resident.first_name} {resident.last_name}
                      {resident.is_primary_contact && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Primary Contact
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {resident.relationship_type.replace('_', ' ')}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      {resident.email && (
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[150px]">{resident.email}</span>
                        </div>
                      )}
                      {resident.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          <span>{resident.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Since {new Date(resident.start_date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No resident information available</p>
            <button className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
              Add Resident
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PropertyInfoSection({ property }: { property: PropertyDetailsData }) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Building2 className="h-5 w-5 mr-2" />
          Property Information
        </h3>
      </div>
      <div className="px-6 py-4">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Year Built</dt>
            <dd className="mt-1 text-sm text-gray-900">{property.year_built || 'Unknown'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Square Footage</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {property.square_footage ? `${property.square_footage.toLocaleString()} sq ft` : 'Unknown'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Lot Size</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {property.lot_size_sqft ? `${(property.lot_size_sqft / 43560).toFixed(2)} acres` : 'Unknown'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Property Type</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">
              {property.property_type?.replace('_', ' ') || 'Unknown'}
            </dd>
          </div>
          {property.special_features && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Special Features</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {Array.isArray(property.special_features) 
                  ? property.special_features.join(', ')
                  : JSON.stringify(property.special_features)
                }
              </dd>
            </div>
          )}
          {property.notes && (
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Notes</dt>
              <dd className="mt-1 text-sm text-gray-900">{property.notes}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

function SurveyHistorySection({ surveys }: { surveys: PropertyDetailsData['survey_history'] }) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Survey History
        </h3>
      </div>
      <div className="px-6 py-4">
        {surveys.length > 0 ? (
          <div className="space-y-3">
            {surveys.map((survey) => (
              <div key={survey.survey_id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-2 w-2 rounded-full ${
                    survey.status === 'complete' ? 'bg-green-400' : 'bg-yellow-400'
                  }`} />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">{survey.survey_name}</div>
                    <div className="text-xs text-gray-500">
                      {survey.respondent} • {new Date(survey.completed_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    survey.status === 'complete' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {survey.status === 'complete' ? 'Complete' : 'Pending'}
                  </span>
                  <Link 
                    href={`/responses/${survey.survey_id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No survey responses recorded</p>
            <button className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
              Add Survey Response
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ActivitySection({ activities, issuesCount }: { 
  activities: PropertyDetailsData['recent_activity'];
  issuesCount: number;
}) {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Recent Activity & Issues
        </h3>
      </div>
      <div className="px-6 py-4">
        {issuesCount === 0 ? (
          <div className="flex items-center text-green-600 mb-4">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">No open infractions</span>
          </div>
        ) : (
          <div className="flex items-center text-red-600 mb-4">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">{issuesCount} open issue{issuesCount !== 1 ? 's' : ''}</span>
          </div>
        )}

        {activities.length > 0 ? (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.activity_id} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 h-2 w-2 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-400' : 'bg-blue-400'
                  }`} />
                  <span className="ml-3 text-gray-900">{activity.description}</span>
                </div>
                <span className="text-gray-500">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No recent activity</p>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Link 
            href={`#`} 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View Activity History
          </Link>
        </div>
      </div>
    </div>
  );
}

async function PropertyDetailsContent({ id }: { id: string }) {
  const property = await getPropertyDetails(id);

  return (
    <div className="min-h-screen bg-gray-50">
      <PropertyHeader property={property} />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ResidentsSection residents={property.current_residents} />
            <SurveyHistorySection surveys={property.survey_history} />
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <PropertyInfoSection property={property} />
            <ActivitySection 
              activities={property.recent_activity} 
              issuesCount={property.issues_count}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading property details...</p>
        </div>
      </div>
    }>
      <PropertyDetailsContent id={params.id} />
    </Suspense>
  );
}