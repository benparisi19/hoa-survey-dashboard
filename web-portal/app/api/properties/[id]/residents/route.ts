import { NextResponse, NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    const propertyId = params.id;

    // Get current residents for this property
    // Note: This assumes the property_residents and people tables exist
    // For now, we'll return placeholder data since these tables aren't created yet
    
    // TODO: Replace with actual query when tables are available:
    // const { data: residents, error } = await supabase
    //   .from('property_residents')
    //   .select(`
    //     resident_id,
    //     relationship_type,
    //     is_primary_contact,
    //     is_hoa_responsible,
    //     start_date,
    //     end_date,
    //     move_in_reason,
    //     move_out_reason,
    //     notes,
    //     people (
    //       person_id,
    //       first_name,
    //       last_name,
    //       email,
    //       phone,
    //       emergency_contact_name,
    //       emergency_contact_phone,
    //       preferred_contact_method
    //     )
    //   `)
    //   .eq('property_id', propertyId)
    //   .is('end_date', null) // Only current residents
    //   .order('is_primary_contact', { ascending: false });

    // Placeholder data for development
    const residents = [
      {
        resident_id: 'placeholder-1',
        relationship_type: 'unknown',
        is_primary_contact: true,
        is_hoa_responsible: true,
        start_date: new Date().toISOString().split('T')[0],
        end_date: null,
        notes: 'Contact information to be determined',
        people: {
          person_id: 'person-1',
          first_name: 'Contact',
          last_name: 'TBD',
          email: '',
          phone: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
          preferred_contact_method: 'email'
        }
      }
    ];

    return NextResponse.json(residents);
  } catch (error) {
    console.error('Unexpected error fetching residents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    const propertyId = params.id;
    const body = await request.json();

    // TODO: Implement when people and property_residents tables are available
    // This would:
    // 1. Check if person already exists (by email or name)
    // 2. Create new person record if needed
    // 3. Create property_residents relationship
    // 4. Handle primary_contact logic (only one per property)

    console.log('Add resident request:', { propertyId, ...body });

    // For now, return success with placeholder data
    const newResident = {
      resident_id: `temp-${Date.now()}`,
      relationship_type: body.relationship_type,
      is_primary_contact: body.is_primary_contact || false,
      is_hoa_responsible: body.is_hoa_responsible || true,
      start_date: body.start_date || new Date().toISOString().split('T')[0],
      end_date: null,
      notes: body.notes || '',
      people: {
        person_id: `person-${Date.now()}`,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email || '',
        phone: body.phone || '',
        emergency_contact_name: body.emergency_contact_name || '',
        emergency_contact_phone: body.emergency_contact_phone || '',
        preferred_contact_method: body.preferred_contact_method || 'email'
      }
    };

    return NextResponse.json(newResident);
  } catch (error) {
    console.error('Unexpected error adding resident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}