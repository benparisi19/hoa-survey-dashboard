import { NextResponse, NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin status first
    const authSupabase = createClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await authSupabase
      .from('people')
      .select('account_type')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || profile?.account_type !== 'hoa_admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const supabase = createServiceClient();
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const includePropertyCount = searchParams.get('includePropertyCount') === 'true';
    
    // Base query
    let query = supabase
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
        updated_at
        ${includePropertyCount ? ', property_residents(property_id, end_date, properties(address))' : ''}
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
      console.error('Error fetching people data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch people data' },
        { status: 500 }
      );
    }
    
    // Transform data
    const transformedPeople = people?.map(person => {
      if (!person || typeof person !== 'object' || Array.isArray(person)) return null;
      
      const transformed: any = {
        ...(person as any),
        full_name: `${(person as any).first_name || ''} ${(person as any).last_name || ''}`.trim()
      };
      
      // Calculate property count and primary address if requested
      if (includePropertyCount && (person as any).property_residents) {
        const currentProperties = (person as any).property_residents.filter((r: any) => !r.end_date);
        transformed.property_count = currentProperties.length;
        transformed.primary_property_address = currentProperties[0]?.properties?.address || null;
        delete transformed.property_residents; // Remove nested data
      }
      
      return transformed;
    }).filter(Boolean) || [];
    
    return NextResponse.json(transformedPeople);
  } catch (error) {
    console.error('Unexpected error fetching people:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}