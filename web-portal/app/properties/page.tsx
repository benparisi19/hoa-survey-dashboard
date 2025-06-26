import { Suspense } from 'react';
import { Building2, Download } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase';
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
    const supabase = createServiceClient();
    
    // Use the property_directory view which provides aggregated data
    const { data: propertiesData, error: propertiesError } = await supabase
      .from('property_directory')
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
        current_resident_count,
        total_surveys,
        owner_name,
        owner_email,
        owner_phone
      `)
      .order('address');
    
    if (propertiesError) throw propertiesError;
    
    // Transform the data to match our interface
    const transformedData: PropertyData[] = (propertiesData || []).map(property => ({
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
      
      // Aggregated data
      current_residents: property.current_resident_count || 0,
      total_surveys: property.total_surveys || 0,
      owner_name: property.owner_name,
      owner_email: property.owner_email,
      owner_phone: property.owner_phone,
      primary_contact_name: property.owner_name, // For now, owner is primary contact
      primary_contact_email: property.owner_email,
      primary_contact_phone: property.owner_phone,
      last_survey_date: null, // Will be calculated
      issues_count: 0, // Will be calculated when we have issues system
      status: property.current_resident_count > 0 ? 'active' : 'vacant'
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