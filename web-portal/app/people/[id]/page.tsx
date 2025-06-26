import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { User, Mail, Phone, Building2, MapPin, Calendar, Settings, MessageSquare, Star, Edit } from 'lucide-react';
import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase';
import LoadingSpinner from '@/components/LoadingSpinner';
import AdminGate from '@/components/AdminGate';

interface PersonDetailsData {
  person_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  preferred_contact_method: 'email' | 'phone' | 'text' | 'mail';
  is_official_owner: boolean;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  mailing_address: string | null;
  mailing_city: string | null;
  mailing_state: string | null;
  mailing_zip: string | null;
  created_at: string | null;
  updated_at: string | null;
  properties: Array<{
    property_id: string;
    address: string;
    lot_number: string | null;
    hoa_zone: string;
    street_group: string | null;
    relationship_type: 'owner' | 'renter' | 'family_member' | 'unknown';
    is_primary_contact: boolean;
    is_hoa_responsible: boolean;
    start_date: string;
    end_date: string | null;
    notes: string | null;
  }>;
  survey_history: Array<{
    survey_id: string;
    survey_name: string;
    survey_type: string;
    completed_date: string;
    status: string;
    property_address: string;
  }>;
}

async function getPersonDetails(id: string): Promise<PersonDetailsData> {
  const supabase = createServiceClient();

  // Get person details
  const { data: person, error: personError } = await supabase
    .from('people')
    .select(`
      person_id,
      first_name,
      last_name,
      email,
      phone,
      preferred_contact_method,
      is_official_owner,
      emergency_contact_name,
      emergency_contact_phone,
      mailing_address,
      mailing_city,
      mailing_state,
      mailing_zip,
      created_at,
      updated_at
    `)
    .eq('person_id', id)
    .single();

  if (personError) {
    console.error('Error fetching person:', personError);
    notFound();
  }

  // Get property relationships
  const { data: propertyRelationships, error: propertiesError } = await supabase
    .from('property_residents')
    .select(`
      property_id,
      relationship_type,
      is_primary_contact,
      is_hoa_responsible,
      start_date,
      end_date,
      notes,
      properties (
        property_id,
        address,
        lot_number,
        hoa_zone,
        street_group
      )
    `)
    .eq('person_id', id)
    .order('start_date', { ascending: false });

  if (propertiesError) {
    console.error('Error fetching property relationships:', propertiesError);
  }

  // Transform property relationships
  const properties = propertyRelationships?.map(rel => {
    const property = Array.isArray(rel.properties) ? rel.properties[0] : rel.properties;
    return {
      property_id: property?.property_id || '',
      address: property?.address || '',
      lot_number: property?.lot_number || null,
      hoa_zone: property?.hoa_zone || '',
      street_group: property?.street_group || null,
      relationship_type: rel.relationship_type,
      is_primary_contact: rel.is_primary_contact,
      is_hoa_responsible: rel.is_hoa_responsible,
      start_date: rel.start_date,
      end_date: rel.end_date,
      notes: rel.notes
    };
  }) || [];

  // Get survey history (based on name matching for now)
  const { data: surveys, error: surveysError } = await supabase
    .from('responses')
    .select(`
      response_id,
      address,
      created_at,
      review_status,
      name
    `)
    .ilike('name', `%${person.first_name}%${person.last_name}%`)
    .order('created_at', { ascending: false });

  if (surveysError) {
    console.error('Error fetching surveys:', surveysError);
  }

  // Format survey data
  const surveyHistory = surveys?.map(survey => ({
    survey_id: survey.response_id,
    survey_name: 'Landscaping 2024',
    survey_type: 'landscaping',
    completed_date: survey.created_at,
    status: survey.review_status === 'reviewed' ? 'complete' : 'pending',
    property_address: survey.address || 'Unknown'
  })) || [];

  return {
    ...person,
    properties,
    survey_history: surveyHistory
  };
}

function PersonHeader({ person }: { person: PersonDetailsData }) {
  const fullName = `${person.first_name} ${person.last_name}`.trim();
  const currentProperties = person.properties.filter(p => !p.end_date);
  const primaryProperty = currentProperties.find(p => p.is_primary_contact);

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
            </div>
            <div className="ml-4">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900 sm:truncate">
                  {fullName}
                </h1>
                {person.is_official_owner && (
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <Star className="h-4 w-4 mr-1" />
                    Owner
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                {primaryProperty && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    Primary: {primaryProperty.address}
                  </div>
                )}
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Building2 className="h-4 w-4 mr-1" />
                  {currentProperties.length} {currentProperties.length === 1 ? 'Property' : 'Properties'}
                </div>
                {person.created_at && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Added {new Date(person.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex lg:mt-0 lg:ml-4 space-x-3">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Settings className="h-4 w-4 mr-1" />
            Actions
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactInformation({ person }: { person: PersonDetailsData }) {
  const getContactIcon = (method: string) => {
    switch (method) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      case 'text':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white shadow-card rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div>
          <dt className="text-sm font-medium text-gray-500">Email</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {person.email ? (
              <a href={`mailto:${person.email}`} className="text-primary-600 hover:text-primary-700">
                {person.email}
              </a>
            ) : (
              <span className="text-gray-400">Not provided</span>
            )}
          </dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-500">Phone</dt>
          <dd className="mt-1 text-sm text-gray-900">
            {person.phone ? (
              <a href={`tel:${person.phone}`} className="text-primary-600 hover:text-primary-700">
                {person.phone}
              </a>
            ) : (
              <span className="text-gray-400">Not provided</span>
            )}
          </dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-gray-500">Preferred Contact Method</dt>
          <dd className="mt-1 text-sm text-gray-900">
            <div className="flex items-center">
              {getContactIcon(person.preferred_contact_method)}
              <span className="ml-2 capitalize">{person.preferred_contact_method}</span>
            </div>
          </dd>
        </div>

        {(person.emergency_contact_name || person.emergency_contact_phone) && (
          <>
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Emergency Contact</h4>
              {person.emergency_contact_name && (
                <div className="mb-2">
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{person.emergency_contact_name}</dd>
                </div>
              )}
              {person.emergency_contact_phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={`tel:${person.emergency_contact_phone}`} className="text-primary-600 hover:text-primary-700">
                      {person.emergency_contact_phone}
                    </a>
                  </dd>
                </div>
              )}
            </div>
          </>
        )}

        {(person.mailing_address || person.mailing_city) && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Mailing Address</h4>
            <div className="text-sm text-gray-900">
              {person.mailing_address && <div>{person.mailing_address}</div>}
              {(person.mailing_city || person.mailing_state || person.mailing_zip) && (
                <div>
                  {person.mailing_city && person.mailing_city}
                  {person.mailing_state && `, ${person.mailing_state}`}
                  {person.mailing_zip && ` ${person.mailing_zip}`}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PropertyRelationships({ person }: { person: PersonDetailsData }) {
  const currentProperties = person.properties.filter(p => !p.end_date);
  const pastProperties = person.properties.filter(p => p.end_date);

  return (
    <div className="bg-white shadow-card rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Property Relationships</h3>
      </div>
      <div className="px-6 py-4">
        {currentProperties.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Current Properties</h4>
            <div className="space-y-3">
              {currentProperties.map((property) => (
                <div key={property.property_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Link 
                          href={`/properties/${property.property_id}`}
                          className="text-lg font-medium text-primary-600 hover:text-primary-700"
                        >
                          {property.address}
                        </Link>
                        {property.is_primary_contact && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Primary Contact
                          </span>
                        )}
                        {property.is_hoa_responsible && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            HOA Responsible
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span className="capitalize">{property.relationship_type.replace('_', ' ')}</span>
                        {property.lot_number && ` • Lot ${property.lot_number}`}
                        {property.hoa_zone && ` • Zone ${property.hoa_zone}`}
                        {property.street_group && ` • ${property.street_group}`}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Since {new Date(property.start_date).toLocaleDateString()}
                      </div>
                      {property.notes && (
                        <div className="mt-2 text-sm text-gray-600">{property.notes}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pastProperties.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Past Properties</h4>
            <div className="space-y-3">
              {pastProperties.map((property) => (
                <div key={property.property_id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Link 
                          href={`/properties/${property.property_id}`}
                          className="text-lg font-medium text-gray-600 hover:text-gray-800"
                        >
                          {property.address}
                        </Link>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        <span className="capitalize">{property.relationship_type.replace('_', ' ')}</span>
                        {property.lot_number && ` • Lot ${property.lot_number}`}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {new Date(property.start_date).toLocaleDateString()} - {new Date(property.end_date!).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {person.properties.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p>No property relationships found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SurveyHistory({ person }: { person: PersonDetailsData }) {
  return (
    <div className="bg-white shadow-card rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Survey History</h3>
      </div>
      <div className="px-6 py-4">
        {person.survey_history.length > 0 ? (
          <div className="space-y-3">
            {person.survey_history.map((survey) => (
              <div key={survey.survey_id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <Link 
                        href={`/responses/${survey.survey_id}`}
                        className="text-lg font-medium text-primary-600 hover:text-primary-700"
                      >
                        {survey.survey_name}
                      </Link>
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        survey.status === 'complete' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {survey.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Property: {survey.property_address}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      Completed {new Date(survey.completed_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p>No survey responses found</p>
          </div>
        )}
      </div>
    </div>
  );
}

async function PersonDetailContent({ id }: { id: string }) {
  const person = await getPersonDetails(id);

  return (
    <div className="space-y-6">
      <PersonHeader person={person} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ContactInformation person={person} />
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <PropertyRelationships person={person} />
          <SurveyHistory person={person} />
        </div>
      </div>
    </div>
  );
}

export default function PersonDetailPage({ params }: { params: { id: string } }) {
  return (
    <AdminGate>
      <Suspense fallback={<LoadingSpinner />}>
        <PersonDetailContent id={params.id} />
      </Suspense>
    </AdminGate>
  );
}