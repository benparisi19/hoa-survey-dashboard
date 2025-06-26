import { NextResponse, NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; residentId: string } }
) {
  try {
    const supabase = createServiceClient();
    const { id: propertyId, residentId } = params;
    const body = await request.json();

    // TODO: Implement when people and property_residents tables are available
    // This would:
    // 1. Update person information
    // 2. Update property_residents relationship
    // 3. Handle primary_contact logic changes

    console.log('Update resident request:', { propertyId, residentId, ...body });

    // For now, return success with updated placeholder data
    const updatedResident = {
      resident_id: residentId,
      relationship_type: body.relationship_type,
      is_primary_contact: body.is_primary_contact,
      is_hoa_responsible: body.is_hoa_responsible,
      start_date: body.start_date,
      end_date: body.end_date,
      notes: body.notes,
      people: {
        person_id: body.people?.person_id || `person-${residentId}`,
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        phone: body.phone,
        emergency_contact_name: body.emergency_contact_name,
        emergency_contact_phone: body.emergency_contact_phone,
        preferred_contact_method: body.preferred_contact_method
      }
    };

    return NextResponse.json(updatedResident);
  } catch (error) {
    console.error('Unexpected error updating resident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; residentId: string } }
) {
  try {
    const supabase = createServiceClient();
    const { id: propertyId, residentId } = params;

    // TODO: Implement when property_residents table is available
    // This would:
    // 1. Set end_date to current date (soft delete)
    // 2. Handle primary_contact reassignment if needed
    // 3. Optionally remove person record if no other relationships exist

    console.log('Remove resident request:', { propertyId, residentId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error removing resident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}