'use client';

import { useState } from 'react';
import ResidentManager from './ResidentManager';

interface Resident {
  resident_id: string;
  relationship_type: 'owner' | 'renter' | 'family_member' | 'unknown';
  is_primary_contact: boolean;
  is_hoa_responsible: boolean;
  start_date: string;
  end_date: string | null;
  notes: string;
  people: {
    person_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    preferred_contact_method: 'email' | 'phone' | 'text' | 'mail';
  };
}

interface PropertyDetailClientProps {
  propertyId: string;
  initialResidents: Resident[];
}

export default function PropertyDetailClient({ propertyId, initialResidents }: PropertyDetailClientProps) {
  const [residents, setResidents] = useState<Resident[]>(initialResidents);

  return (
    <ResidentManager
      propertyId={propertyId}
      residents={residents}
      onResidentsChange={setResidents}
    />
  );
}