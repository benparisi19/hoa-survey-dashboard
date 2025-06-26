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

    // Handle primary_contact logic (only one per property)
    if (body.is_primary_contact) {
      await supabase
        .from('property_residents')
        .update({ is_primary_contact: false })
        .eq('property_id', propertyId)
        .neq('resident_id', residentId)
        .is('end_date', null);
    }

    // Update resident record
    const { data: updatedResident, error: residentError } = await supabase
      .from('property_residents')
      .update({
        relationship_type: body.relationship_type,
        is_primary_contact: body.is_primary_contact || false,
        is_hoa_responsible: body.is_hoa_responsible || true,
        start_date: body.start_date,
        move_in_reason: body.move_in_reason || null,
        notes: body.notes || null
      })
      .eq('resident_id', residentId)
      .select(`
        resident_id,
        relationship_type,
        is_primary_contact,
        is_hoa_responsible,
        start_date,
        end_date,
        move_in_reason,
        move_out_reason,
        notes,
        people (
          person_id,
          first_name,
          last_name,
          email,
          phone,
          emergency_contact_name,
          emergency_contact_phone,
          preferred_contact_method
        )
      `)
      .single();

    if (residentError) {
      console.error('Error updating resident:', residentError);
      return NextResponse.json(
        { error: 'Failed to update resident record' },
        { status: 500 }
      );
    }

    // Update person info if provided
    if (body.first_name || body.last_name || body.email !== undefined || body.phone !== undefined) {
      const personUpdates: any = {};
      if (body.first_name) personUpdates.first_name = body.first_name;
      if (body.last_name) personUpdates.last_name = body.last_name;
      if (body.email !== undefined) personUpdates.email = body.email || null;
      if (body.phone !== undefined) personUpdates.phone = body.phone || null;
      if (body.emergency_contact_name !== undefined) personUpdates.emergency_contact_name = body.emergency_contact_name || null;
      if (body.emergency_contact_phone !== undefined) personUpdates.emergency_contact_phone = body.emergency_contact_phone || null;
      if (body.preferred_contact_method) personUpdates.preferred_contact_method = body.preferred_contact_method;
      if (body.relationship_type === 'owner') personUpdates.is_official_owner = true;

      const personId = (updatedResident.people as any)?.person_id;
      if (personId) {
        await supabase
          .from('people')
          .update(personUpdates)
          .eq('person_id', personId);
      }
    }

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

    // Set end_date instead of actually deleting (soft delete)
    const { error } = await supabase
      .from('property_residents')
      .update({ 
        end_date: new Date().toISOString().split('T')[0],
        move_out_reason: 'Removed by admin'
      })
      .eq('resident_id', residentId)
      .eq('property_id', propertyId);

    if (error) {
      console.error('Error removing resident:', error);
      return NextResponse.json(
        { error: 'Failed to remove resident' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error removing resident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}