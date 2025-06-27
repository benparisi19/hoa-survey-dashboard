import { NextResponse, NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const zone = searchParams.get('zone');
    const streetGroup = searchParams.get('street_group');
    const propertyType = searchParams.get('property_type');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    
    // Base query with residents
    let query = supabase
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
      `);
    
    // Apply filters
    if (zone) {
      query = query.eq('hoa_zone', zone);
    }
    
    if (streetGroup) {
      query = query.eq('street_group', streetGroup);
    }
    
    if (propertyType) {
      query = query.eq('property_type', propertyType);
    }
    
    // Apply pagination
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum);
      }
    }
    
    if (offset) {
      const offsetNum = parseInt(offset, 10);
      if (!isNaN(offsetNum) && offsetNum >= 0) {
        query = query.range(offsetNum, offsetNum + (parseInt(limit || '100', 10) - 1));
      }
    }
    
    // Always order by address for consistent results
    query = query.order('address');
    
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      return NextResponse.json(
        { error: 'Failed to fetch properties' },
        { status: 500 }
      );
    }

    // Transform data to include current_residents count
    const transformedData = (data || []).map(property => {
      
      // Count current residents (those without end_date)
      const currentResidents = property.property_residents
        ? property.property_residents.filter((r: any) => r.end_date === null || r.end_date === undefined).length
        : 0;


      // Remove the property_residents array and add the count
      const { property_residents, ...propertyData } = property;
      return {
        ...propertyData,
        current_residents: currentResidents
      };
    });


    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Unexpected error fetching properties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}