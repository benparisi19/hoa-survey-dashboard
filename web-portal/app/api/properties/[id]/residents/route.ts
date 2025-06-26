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
    const { data: residents, error } = await supabase
      .from('property_residents')
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
      .eq('property_id', propertyId)
      .is('end_date', null) // Only current residents
      .order('is_primary_contact', { ascending: false });

    if (error) {
      console.error('Error fetching residents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch residents' },
        { status: 500 }
      );
    }

    return NextResponse.json(residents || []);
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

    // 1. Check if person already exists (by email or name)
    let personId = null;
    if (body.email || (body.first_name && body.last_name)) {
      const { data: existingPeople } = await supabase
        .from('people')
        .select('person_id')
        .or(
          body.email 
            ? `email.eq.${body.email},and(first_name.eq.${body.first_name},last_name.eq.${body.last_name})`
            : `first_name.eq.${body.first_name},last_name.eq.${body.last_name}`
        )
        .limit(1);
      
      if (existingPeople && existingPeople.length > 0) {
        personId = existingPeople[0].person_id;
      }
    }

    // 2. Create new person record if needed
    if (!personId) {
      const { data: newPerson, error: personError } = await supabase
        .from('people')
        .insert({
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email || null,
          phone: body.phone || null,
          emergency_contact_name: body.emergency_contact_name || null,
          emergency_contact_phone: body.emergency_contact_phone || null,
          preferred_contact_method: body.preferred_contact_method || 'email',
          is_official_owner: body.relationship_type === 'owner'
        })
        .select('person_id')
        .single();

      if (personError) {
        console.error('Error creating person:', personError);
        return NextResponse.json(
          { error: 'Failed to create person record' },
          { status: 500 }
        );
      }
      personId = newPerson.person_id;
    }

    // 3. Handle primary_contact logic (only one per property)
    if (body.is_primary_contact) {
      await supabase
        .from('property_residents')
        .update({ is_primary_contact: false })
        .eq('property_id', propertyId)
        .is('end_date', null);
    }

    // 4. Create property_residents relationship
    const { data: newResident, error: residentError } = await supabase
      .from('property_residents')
      .insert({
        property_id: propertyId,
        person_id: personId,
        relationship_type: body.relationship_type,
        is_primary_contact: body.is_primary_contact || false,
        is_hoa_responsible: body.is_hoa_responsible || true,
        start_date: body.start_date || new Date().toISOString().split('T')[0],
        move_in_reason: body.move_in_reason || null,
        notes: body.notes || null
      })
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
      console.error('Error creating resident:', residentError);
      return NextResponse.json(
        { error: 'Failed to create resident record' },
        { status: 500 }
      );
    }

    return NextResponse.json(newResident);
  } catch (error) {
    console.error('Unexpected error adding resident:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    const propertyId = params.id;
    const body = await request.json();
    const residentId = body.resident_id;

    if (!residentId) {
      return NextResponse.json(
        { error: 'Resident ID is required' },
        { status: 400 }
      );
    }

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
    if (body.first_name || body.last_name || body.email || body.phone) {
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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    const propertyId = params.id;
    const { searchParams } = new URL(request.url);
    const residentId = searchParams.get('resident_id');

    if (!residentId) {
      return NextResponse.json(
        { error: 'Resident ID is required' },
        { status: 400 }
      );
    }

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