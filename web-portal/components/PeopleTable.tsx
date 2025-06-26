'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, User, Mail, Phone, Building2, Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { applyPeopleFilters, PeopleFilterGroup } from '@/lib/people-filters';

export interface PersonData {
  person_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  preferred_contact_method: 'email' | 'phone' | 'text' | 'mail';
  is_official_owner: boolean;
  property_count: number;
  primary_property_address?: string | null;
  survey_count?: number;
  created_at: string | null;
  updated_at: string | null;
}

interface PeopleTableProps {
  people: PersonData[];
  filterGroups?: PeopleFilterGroup[];
}

type SortField = 'name' | 'email' | 'phone' | 'property_count' | 'contact_method' | 'owner_status';
type SortDirection = 'asc' | 'desc';

export default function PeopleTable({ people, filterGroups = [] }: PeopleTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Apply filters
  const filteredPeople = useMemo(() => {
    return applyPeopleFilters(people, filterGroups);
  }, [people, filterGroups]);

  // Apply search
  const searchedPeople = useMemo(() => {
    if (!searchTerm) return filteredPeople;
    
    const lowerSearch = searchTerm.toLowerCase();
    return filteredPeople.filter(person => {
      const fullName = `${person.first_name} ${person.last_name}`.toLowerCase();
      return fullName.includes(lowerSearch) ||
        person.email?.toLowerCase().includes(lowerSearch) ||
        person.phone?.includes(searchTerm) ||
        person.primary_property_address?.toLowerCase().includes(lowerSearch);
    });
  }, [filteredPeople, searchTerm]);

  // Apply sorting
  const sortedPeople = useMemo(() => {
    const sorted = [...searchedPeople].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'phone':
          aValue = a.phone || '';
          bValue = b.phone || '';
          break;
        case 'property_count':
          aValue = a.property_count;
          bValue = b.property_count;
          break;
        case 'contact_method':
          aValue = a.preferred_contact_method;
          bValue = b.preferred_contact_method;
          break;
        case 'owner_status':
          aValue = a.is_official_owner ? 1 : 0;
          bValue = b.is_official_owner ? 1 : 0;
          break;
        default:
          aValue = a[sortField as keyof PersonData];
          bValue = b[sortField as keyof PersonData];
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [searchedPeople, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getContactIcon = (method: string) => {
    switch (method) {
      case 'email':
        return <Mail className="h-3 w-3" />;
      case 'phone':
        return <Phone className="h-3 w-3" />;
      case 'text':
        return <MessageSquare className="h-3 w-3" />;
      default:
        return <Mail className="h-3 w-3" />;
    }
  };

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <input
          type="text"
          placeholder="Search by name, email, phone, or property..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('name')}
                  className="group inline-flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Name
                  {sortField === 'name' && (
                    sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                  )}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('email')}
                  className="group inline-flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Email
                  {sortField === 'email' && (
                    sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                  )}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('phone')}
                  className="group inline-flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Phone
                  {sortField === 'phone' && (
                    sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                  )}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('property_count')}
                  className="group inline-flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Properties
                  {sortField === 'property_count' && (
                    sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                  )}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('contact_method')}
                  className="group inline-flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Contact Method
                  {sortField === 'contact_method' && (
                    sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                  )}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('owner_status')}
                  className="group inline-flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  Status
                  {sortField === 'owner_status' && (
                    sortDirection === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />
                  )}
                </button>
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPeople.map((person) => (
              <tr key={person.person_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {person.first_name} {person.last_name}
                      </div>
                      {person.primary_property_address && (
                        <div className="text-sm text-gray-500">{person.primary_property_address}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {person.email ? (
                    <a href={`mailto:${person.email}`} className="text-sm text-primary-600 hover:text-primary-700">
                      {person.email}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {person.phone ? (
                    <a href={`tel:${person.phone}`} className="text-sm text-primary-600 hover:text-primary-700">
                      {person.phone}
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">{person.property_count}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    {getContactIcon(person.preferred_contact_method)}
                    <span className="ml-1 capitalize">{person.preferred_contact_method}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {person.is_official_owner ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <Star className="h-3 w-3 mr-1" />
                      Owner
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Resident
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    href={`/people/${person.person_id}`}
                    className="text-primary-600 hover:text-primary-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        Showing {sortedPeople.length} of {people.length} people
        {filterGroups.length > 0 && ' (filtered)'}
      </div>
    </div>
  );
}