import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.trim().length < 3) {
      return NextResponse.json({
        error: 'Search query must be at least 3 characters long'
      }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Search properties by address
    const { data: properties, error } = await supabase
      .from('properties')
      .select('property_id, address, hoa_zone')
      .ilike('address', `%${query.trim()}%`)
      .order('address')
      .limit(20);

    if (error) {
      console.error('Error searching properties:', error);
      return NextResponse.json({
        error: 'Failed to search properties'
      }, { status: 500 });
    }

    return NextResponse.json({
      properties: properties || [],
      total: properties?.length || 0
    });

  } catch (error) {
    console.error('Unexpected error in property search:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}