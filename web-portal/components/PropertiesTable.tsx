'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Download, ChevronUp, ChevronDown, Building2, Users, MapPin, Phone, Mail, ExternalLink, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { PropertyData } from '@/app/properties/page';

interface PropertiesTableProps {
  properties: PropertyData[];
}

interface FilterState {
  search: string;
  zone: string;
  streetGroup: string;
  propertyType: string;
  residencyStatus: string;
  surveyParticipation: string;
  status: string;
}

const ZONES = ['1', '2', '3'];
const STREET_GROUPS = ['Hills', 'Goldstone', 'Vacheron', 'Esperanto', 'Blueberry', 'Faceto', 'Matisse', 'Sportivo', 'Defio'];
const PROPERTY_TYPES = ['single_family', 'townhouse', 'condo'];
const RESIDENCY_STATUS = ['owner_occupied', 'rental', 'vacant', 'unknown'];
const SURVEY_PARTICIPATION = ['complete', 'partial', 'none'];
const STATUS_OPTIONS = ['active', 'vacant', 'issue', 'compliant'];

type SortField = 'address' | 'lot_number' | 'hoa_zone' | 'street_group' | 'current_residents' | 'total_surveys' | 'status';
type SortDirection = 'asc' | 'desc';

export default function PropertiesTable({ properties }: PropertiesTableProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    zone: '',
    streetGroup: '',
    propertyType: '',
    residencyStatus: '',
    surveyParticipation: '',
    status: '',
  });
  
  const [sortField, setSortField] = useState<SortField>('address');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Helper functions
  const getResidencyStatus = (property: PropertyData): 'owner_occupied' | 'rental' | 'vacant' | 'unknown' => {
    if (property.current_residents === 0) return 'vacant';
    if (property.owner_name && property.current_residents > 0) return 'owner_occupied';
    // TODO: Determine rental properties when we have resident relationship data
    return 'unknown';
  };

  const getSurveyParticipation = (property: PropertyData) => {
    if (property.total_surveys === 0) return 'none';
    // For now, assume complete if has any surveys
    // This will be enhanced when we have survey definitions
    return 'complete';
  };

  const getPrimaryContact = (property: PropertyData) => {
    return {
      name: property.primary_contact_name || property.owner_name || 'No contact',
      email: property.primary_contact_email || property.owner_email || '',
      phone: property.primary_contact_phone || property.owner_phone || ''
    };
  };

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let filtered = properties.filter(property => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          property.address.toLowerCase().includes(searchLower) ||
          property.lot_number?.toLowerCase().includes(searchLower) ||
          property.owner_name?.toLowerCase().includes(searchLower) ||
          property.primary_contact_name?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Zone filter
      if (filters.zone && property.hoa_zone !== filters.zone) return false;

      // Street group filter
      if (filters.streetGroup && property.street_group !== filters.streetGroup) return false;

      // Property type filter
      if (filters.propertyType && property.property_type !== filters.propertyType) return false;

      // Residency status filter
      if (filters.residencyStatus && getResidencyStatus(property) !== filters.residencyStatus) return false;

      // Survey participation filter
      if (filters.surveyParticipation && getSurveyParticipation(property) !== filters.surveyParticipation) return false;

      // Status filter
      if (filters.status && property.status !== filters.status) return false;

      return true;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle null values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [properties, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      zone: '',
      streetGroup: '',
      propertyType: '',
      residencyStatus: '',
      surveyParticipation: '',
      status: '',
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left font-medium text-gray-900 hover:text-primary-600"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? 
          <ChevronUp className="h-4 w-4" /> : 
          <ChevronDown className="h-4 w-4" />
      )}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by address, lot number, or resident name..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? 'border-primary-300 bg-primary-50 text-primary-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Active
                </span>
              )}
            </button>

            <button
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Zone Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
              <select
                value={filters.zone}
                onChange={(e) => updateFilter('zone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="">All Zones</option>
                {ZONES.map(zone => (
                  <option key={zone} value={zone}>Zone {zone}</option>
                ))}
              </select>
            </div>

            {/* Street Group Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
              <select
                value={filters.streetGroup}
                onChange={(e) => updateFilter('streetGroup', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="">All Streets</option>
                {STREET_GROUPS.map(street => (
                  <option key={street} value={street}>{street}</option>
                ))}
              </select>
            </div>

            {/* Residency Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Residency</label>
              <select
                value={filters.residencyStatus}
                onChange={(e) => updateFilter('residencyStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="">All Types</option>
                <option value="owner_occupied">Owner Occupied</option>
                <option value="rental">Rental</option>
                <option value="vacant">Vacant</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="vacant">Vacant</option>
                <option value="issue">Has Issues</option>
                <option value="compliant">Compliant</option>
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {filteredData.length} of {properties.length} properties
          {hasActiveFilters && (
            <span className="ml-2 text-primary-600">
              (filtered)
            </span>
          )}
        </p>
      </div>

      {/* Properties Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="address">Address</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="lot_number">Lot</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="hoa_zone">Zone</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="current_residents">Residents</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Primary Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="total_surveys">Surveys</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <SortButton field="status">Status</SortButton>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((property) => {
              const contact = getPrimaryContact(property);
              const residencyStatus = getResidencyStatus(property);
              
              return (
                <tr key={property.property_id} className="hover:bg-gray-50">
                  {/* Address */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {property.address}
                        </div>
                        {property.street_group && (
                          <div className="text-xs text-gray-500">
                            {property.street_group}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Lot Number */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {property.lot_number || '-'}
                  </td>

                  {/* Zone */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Zone {property.hoa_zone}
                    </span>
                  </td>

                  {/* Residents */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{property.current_residents}</span>
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        residencyStatus === 'owner_occupied' ? 'bg-green-100 text-green-800' :
                        residencyStatus === 'rental' ? 'bg-yellow-100 text-yellow-800' :
                        residencyStatus === 'vacant' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {residencyStatus === 'owner_occupied' ? 'Owner' :
                         residencyStatus === 'rental' ? 'Rental' :
                         residencyStatus === 'vacant' ? 'Vacant' : 'Unknown'}
                      </span>
                    </div>
                  </td>

                  {/* Primary Contact */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contact.name}</div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      {contact.email && (
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[120px]">{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Surveys */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <span className="font-medium">{property.total_surveys}</span>
                      {property.total_surveys > 0 && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Complete
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      property.status === 'active' ? 'bg-green-100 text-green-800' :
                      property.status === 'vacant' ? 'bg-gray-100 text-gray-800' :
                      property.status === 'issue' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {property.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/properties/${property.property_id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View
                      </Link>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500">
            {hasActiveFilters 
              ? "Try adjusting your filters or search terms."
              : "No properties are available."
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}