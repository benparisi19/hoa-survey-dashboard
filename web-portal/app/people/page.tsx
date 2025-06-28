import { Suspense } from 'react';
import { Users, Download } from 'lucide-react';
import PeopleTable, { PersonData } from '@/components/PeopleTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import PeoplePageClient from '@/components/PeoplePageClient';
import AdminGate from '@/components/AdminGate';

export const dynamic = 'force-dynamic';

async function getPeopleData(): Promise<PersonData[]> {
  try {
    // Use authenticated client that respects RLS policies
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('No authenticated user, returning empty people list');
      return [];
    }
    
    // Get people with property relationships (same logic as API)
    const { data, error } = await supabase
      .from('people')
      .select(`
        person_id,
        first_name,
        last_name,
        email,
        phone,
        preferred_contact_method,
        is_official_owner,
        created_at,
        updated_at,
        property_residents(property_id, end_date, properties(address))
      `)
      .order('first_name');

    if (error) {
      console.error('Error fetching people:', error);
      return [];
    }

    // Transform data (same logic as API)
    const peopleData = (data || []).map(person => {
      if (!person || typeof person !== 'object' || Array.isArray(person)) return null;
      
      const currentProperties = (person as any).property_residents?.filter((r: any) => !r.end_date) || [];
      
      return {
        ...(person as any),
        full_name: `${(person as any).first_name || ''} ${(person as any).last_name || ''}`.trim(),
        property_count: currentProperties.length,
        primary_property_address: currentProperties[0]?.properties?.address || null
      };
    }).filter(Boolean);
    
    
    // Transform the data to match our interface
    const transformedData: PersonData[] = (peopleData || []).map((person: any) => ({
      person_id: person.person_id || '',
      first_name: person.first_name || '',
      last_name: person.last_name || '',
      email: person.email,
      phone: person.phone,
      preferred_contact_method: person.preferred_contact_method || 'email',
      is_official_owner: person.is_official_owner || false,
      property_count: person.property_count || 0,
      primary_property_address: person.primary_property_address,
      survey_count: 0, // TODO: Calculate from survey responses
      created_at: person.created_at,
      updated_at: person.updated_at
    }));
    
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching people data:', error);
    return [];
  }
}

async function PeopleContent() {
  const people = await getPeopleData();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">People Directory</h1>
            <p className="text-gray-600">
              Manage residents and property relationships ({people.length} total)
            </p>
          </div>
        </div>
        {/* People Actions - handled by client component */}
        <PeoplePageClient />
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total People</dt>
                <dd className="text-2xl font-bold text-gray-900">{people.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Property Owners</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {people.filter(p => p.is_official_owner).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">With Properties</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {people.filter(p => p.property_count > 0).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">With Contact Info</dt>
                <dd className="text-2xl font-bold text-gray-900">
                  {people.filter(p => p.email || p.phone).length}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
      
      {/* People Table */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200">
        <PeopleTable people={people} />
      </div>
    </div>
  );
}

export default function PeoplePage() {
  return (
    <AdminGate>
      <Suspense fallback={<LoadingSpinner />}>
        <PeopleContent />
      </Suspense>
    </AdminGate>
  );
}