import { Suspense } from 'react';
import { Building2, Download } from 'lucide-react';
import PropertiesTable from '@/components/PropertiesTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import PropertiesPageClient from '@/components/PropertiesPageClient';
import AdminGate from '@/components/AdminGate';

export const dynamic = 'force-dynamic';

export interface PropertyData {
  property_id: string;
  address: string;
  lot_number: string | null;
  hoa_zone: string;
  street_group: string | null;
  property_type: string | null;
  square_footage: number | null;
  lot_size_sqft: number | null;
  year_built: number | null;
  architectural_style: string | null;
  special_features: any;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  
  // Aggregated data from joins
  current_residents: number;
  total_surveys: number;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  last_survey_date: string | null;
  issues_count: number;
  status: 'active' | 'vacant' | 'issue' | 'compliant';
}

async function getPropertiesData(): Promise<PropertyData[]> {
  try {
    // Use direct database query for SSR instead of API call
    const { createServiceClient } = await import('@/lib/supabase');
    const supabase = createServiceClient();
    
    // Get properties with residents count (same logic as API)
    const { data, error } = await supabase
      .from('properties')
      .select(`
        property_id,
        address,
        lot_number,
        hoa_zone,
        street_group,
        property_type,
        square_footage,
        lot_size_sqft,
        year_built,
        special_features,
        notes,
        created_at,
        updated_at,
        property_residents (
          resident_id,
          end_date
        )
      `)
      .order('address');

    if (error) {
      console.error('Error fetching properties:', error);
      return [];
    }

    // Transform data to include current_residents count (same logic as API)
    const propertiesData = (data || []).map(property => {
      const currentResidents = property.property_residents
        ? property.property_residents.filter((r: any) => !r.end_date).length
        : 0;

      const { property_residents, ...propertyData } = property;
      return {
        ...propertyData,
        current_residents: currentResidents
      };
    });
    
    
    // Transform the data to match our interface
    const transformedData: PropertyData[] = (propertiesData || []).map((property: any) => ({
      property_id: property.property_id || '',
      address: property.address || '',
      lot_number: property.lot_number,
      hoa_zone: property.hoa_zone || '',
      street_group: property.street_group,
      property_type: property.property_type,
      square_footage: property.square_footage,
      lot_size_sqft: property.lot_size_sqft,
      year_built: property.year_built,
      architectural_style: null,
      special_features: property.special_features,
      notes: property.notes,
      created_at: property.created_at,
      updated_at: property.updated_at,
      
      // Use the actual residents count from API
      current_residents: property.current_residents || 0,
      total_surveys: 0, // TODO: Calculate from property_surveys  
      owner_name: null, // TODO: Get from people/property_residents
      owner_email: null,
      owner_phone: null,
      primary_contact_name: null,
      primary_contact_email: null,
      primary_contact_phone: null,
      last_survey_date: null,
      issues_count: 0,
      status: 'active' as const
    }));
    
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching properties data:', error);
    return [];
  }
}

async function PropertiesContent() {
  const properties = await getPropertiesData();
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Property Directory</h1>
            <p className="text-gray-600">
              Manage and view all HOA properties ({properties.length} total)
            </p>
          </div>
        </div>
        {/* Property Actions - handled by client component */}
        <PropertiesPageClient />
      </div>
      
      {/* Properties Table */}
      <div className="bg-white rounded-lg shadow-card border border-gray-200">
        <PropertiesTable properties={properties} />
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <AdminGate>
      <Suspense fallback={<LoadingSpinner />}>
        <PropertiesContent />
      </Suspense>
    </AdminGate>
  );
}