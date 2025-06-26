import { NextResponse, NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Parse query parameters for searching
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    
    // Use actual people table
    let query = supabase
      .from('people')
      .select(`
        person_id,
        first_name,
        last_name,
        email,
        phone,
        preferred_contact_method,
        is_official_owner
      `);
    
    // Apply search filter if provided
    if (search && search.length >= 2) {
      const searchLower = search.toLowerCase();
      query = query.or(`first_name.ilike.%${searchLower}%,last_name.ilike.%${searchLower}%,email.ilike.%${searchLower}%`);
    }
    
    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum);
      }
    }
    
    query = query.order('first_name');
    
    const { data: people, error } = await query;
    
    if (error) {
      console.error('Error fetching survey responses for people data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch people data' },
        { status: 500 }
      );
    }
    
    // Transform data to include full_name and match expected interface
    const transformedPeople = people?.map(person => ({
      ...person,
      full_name: `${person.first_name} ${person.last_name}`.trim()
    })) || [];
    
    return NextResponse.json(transformedPeople);
  } catch (error) {
    console.error('Unexpected error fetching people:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}