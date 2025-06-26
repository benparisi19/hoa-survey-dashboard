import { NextResponse, NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Parse query parameters for searching
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    
    // TODO: Replace with actual people table when it exists
    // For now, return placeholder data based on survey responses
    
    // Base query - would use people table when available:
    // let query = supabase
    //   .from('people')
    //   .select(`
    //     person_id,
    //     first_name,
    //     last_name,
    //     email,
    //     phone,
    //     preferred_contact_method,
    //     is_official_owner
    //   `);
    
    // For now, extract unique names from survey responses
    const { data: responses, error } = await supabase
      .from('responses')
      .select('response_id, name, email_contact, address')
      .order('name');
    
    if (error) {
      console.error('Error fetching survey responses for people data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch people data' },
        { status: 500 }
      );
    }
    
    // Process responses into people-like structure
    const peopleMap = new Map();
    
    responses?.forEach(response => {
      if (!response.name || !response.name.trim() || response.name.toLowerCase() === 'anonymous') {
        return;
      }
      
      const key = response.name.toLowerCase().trim();
      if (!peopleMap.has(key)) {
        // Parse name into first/last
        const nameParts = response.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Parse contact info
        const emailMatch = response.email_contact?.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        const phoneMatch = response.email_contact?.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10})/);
        
        peopleMap.set(key, {
          person_id: response.response_id, // Temporary ID
          first_name: firstName,
          last_name: lastName,
          full_name: response.name.trim(),
          email: emailMatch ? emailMatch[0] : '',
          phone: phoneMatch ? phoneMatch[0] : '',
          preferred_contact_method: emailMatch ? 'email' : 'phone',
          is_official_owner: false,
          source: 'survey_response'
        });
      }
    });
    
    let people = Array.from(peopleMap.values());
    
    // Apply search filter if provided
    if (search && search.length >= 2) {
      const searchLower = search.toLowerCase();
      people = people.filter(person => 
        person.full_name.toLowerCase().includes(searchLower) ||
        person.first_name.toLowerCase().includes(searchLower) ||
        person.last_name.toLowerCase().includes(searchLower) ||
        person.email.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        people = people.slice(0, limitNum);
      }
    }
    
    // Sort by name
    people.sort((a, b) => a.full_name.localeCompare(b.full_name));
    
    return NextResponse.json(people);
  } catch (error) {
    console.error('Unexpected error fetching people:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}