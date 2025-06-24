'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Download, ChevronUp, ChevronDown, User, UserX, Mail, MailX } from 'lucide-react';
import { ResponseData } from '@/app/responses/page';

interface ResponsesTableProps {
  responses: ResponseData[];
}

interface FilterState {
  search: string;
  serviceRating: string;
  hasContact: string;
  anonymous: string;
  optOut: string;
  issues: string[];
}

const SERVICE_RATINGS = ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'];
const ISSUES = [
  { key: 'irrigation', label: 'Irrigation' },
  { key: 'poor_mowing', label: 'Poor Mowing' },
  { key: 'property_damage', label: 'Property Damage' },
  { key: 'missed_service', label: 'Missed Service' },
  { key: 'inadequate_weeds', label: 'Inadequate Weeds' },
];

type SortField = 'response_id' | 'q2_service_rating' | 'q1_preference' | 'anonymous';
type SortDirection = 'asc' | 'desc';

export default function ResponsesTable({ responses }: ResponsesTableProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    serviceRating: '',
    hasContact: '',
    anonymous: '',
    optOut: '',
    issues: [],
  });
  
  const [sortField, setSortField] = useState<SortField>('response_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Helper functions
  const hasContactInfo = (response: ResponseData) => {
    return response.email_contact && 
           response.email_contact.trim() !== '' && 
           response.email_contact !== 'Not provided';
  };

  const wantsOptOut = (response: ResponseData) => {
    return response.q1_preference?.toLowerCase().includes('opt out') || false;
  };

  const getIssues = (response: ResponseData) => {
    const issues = [];
    if (response.irrigation === 'Yes') issues.push('Irrigation');
    if (response.poor_mowing === 'Yes') issues.push('Poor Mowing');
    if (response.property_damage === 'Yes') issues.push('Property Damage');
    if (response.missed_service === 'Yes') issues.push('Missed Service');
    if (response.inadequate_weeds === 'Yes') issues.push('Inadequate Weeds');
    return issues;
  };

  const getIssueCount = (response: ResponseData) => {
    return getIssues(response).length;
  };

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let filtered = responses.filter(response => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          response.response_id,
          response.address,
          response.name,
          response.q2_service_rating,
          response.q1_preference,
          response.biggest_concern,
          ...getIssues(response)
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) return false;
      }

      // Service rating filter
      if (filters.serviceRating && response.q2_service_rating !== filters.serviceRating) {
        return false;
      }

      // Contact info filter
      if (filters.hasContact) {
        const hasContact = hasContactInfo(response);
        if (filters.hasContact === 'yes' && !hasContact) return false;
        if (filters.hasContact === 'no' && hasContact) return false;
      }

      // Anonymous filter
      if (filters.anonymous && response.anonymous !== filters.anonymous) {
        return false;
      }

      // Opt-out filter
      if (filters.optOut) {
        const wantsOut = wantsOptOut(response);
        if (filters.optOut === 'yes' && !wantsOut) return false;
        if (filters.optOut === 'no' && wantsOut) return false;
      }

      // Issues filter
      if (filters.issues.length > 0) {
        const responseIssues = getIssues(response).map(i => i.toLowerCase());
        const hasSelectedIssue = filters.issues.some(issue => 
          responseIssues.includes(issue.toLowerCase())
        );
        if (!hasSelectedIssue) return false;
      }

      return true;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Special handling for service ratings
      if (sortField === 'q2_service_rating') {
        const ratingOrder = ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'];
        aValue = ratingOrder.indexOf(aValue) !== -1 ? ratingOrder.indexOf(aValue) : 999;
        bValue = ratingOrder.indexOf(bValue) !== -1 ? ratingOrder.indexOf(bValue) : 999;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [responses, filters, sortField, sortDirection]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleIssueFilter = (issue: string) => {
    setFilters(prev => ({
      ...prev,
      issues: prev.issues.includes(issue)
        ? prev.issues.filter(i => i !== issue)
        : [...prev.issues, issue]
    }));
  };

  const exportToCSV = () => {
    const headers = [
      'Response ID',
      'Service Rating',
      'Preference',
      'Anonymous',
      'Has Contact',
      'Issues Count',
      'Issues',
      'Biggest Concern'
    ];

    const csvData = filteredData.map(response => [
      response.response_id,
      response.q2_service_rating || '',
      response.q1_preference || '',
      response.anonymous,
      hasContactInfo(response) ? 'Yes' : 'No',
      getIssueCount(response),
      getIssues(response).join('; '),
      response.biggest_concern || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hoa-survey-responses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      serviceRating: '',
      hasContact: '',
      anonymous: '',
      optOut: '',
      issues: [],
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className="p-6">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search responses..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Service Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Rating
              </label>
              <select
                value={filters.serviceRating}
                onChange={(e) => setFilters(prev => ({ ...prev, serviceRating: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Ratings</option>
                {SERVICE_RATINGS.map(rating => (
                  <option key={rating} value={rating}>{rating}</option>
                ))}
              </select>
            </div>

            {/* Contact Info Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Available
              </label>
              <select
                value={filters.hasContact}
                onChange={(e) => setFilters(prev => ({ ...prev, hasContact: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All</option>
                <option value="yes">Has Contact</option>
                <option value="no">No Contact</option>
              </select>
            </div>

            {/* Anonymous Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anonymous
              </label>
              <select
                value={filters.anonymous}
                onChange={(e) => setFilters(prev => ({ ...prev, anonymous: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All</option>
                <option value="Yes">Anonymous</option>
                <option value="No">Not Anonymous</option>
              </select>
            </div>

            {/* Opt-out Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wants Opt-out
              </label>
              <select
                value={filters.optOut}
                onChange={(e) => setFilters(prev => ({ ...prev, optOut: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All</option>
                <option value="yes">Wants Opt-out</option>
                <option value="no">Keep HOA Service</option>
              </select>
            </div>
          </div>

          {/* Issues Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issues (select multiple)
            </label>
            <div className="flex flex-wrap gap-2">
              {ISSUES.map(issue => (
                <button
                  key={issue.key}
                  onClick={() => handleIssueFilter(issue.label)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.issues.includes(issue.label)
                      ? 'bg-primary-100 text-primary-800 border border-primary-300'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {issue.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-gray-600">
              Showing {filteredData.length} of {responses.length} responses
            </span>
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th
                onClick={() => handleSort('response_id')}
                className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  ID <SortIcon field="response_id" />
                </div>
              </th>
              <th
                onClick={() => handleSort('q2_service_rating')}
                className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Service Rating <SortIcon field="q2_service_rating" />
                </div>
              </th>
              <th
                onClick={() => handleSort('q1_preference')}
                className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Preference <SortIcon field="q1_preference" />
                </div>
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                Contact
              </th>
              <th
                onClick={() => handleSort('anonymous')}
                className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Anonymous <SortIcon field="anonymous" />
                </div>
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                Issues
              </th>
              <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900">
                Biggest Concern
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((response) => {
              const issues = getIssues(response);
              const hasContact = hasContactInfo(response);
              
              return (
                <tr key={response.response_id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-3 text-sm">
                    <span className="font-mono font-medium">
                      {response.response_id}
                    </span>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">
                    {response.q2_service_rating && (
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        response.q2_service_rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                        response.q2_service_rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                        response.q2_service_rating === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                        response.q2_service_rating === 'Poor' ? 'bg-orange-100 text-orange-800' :
                        response.q2_service_rating === 'Very Poor' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {response.q2_service_rating}
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm max-w-xs">
                    <div className="truncate" title={response.q1_preference || ''}>
                      {response.q1_preference}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      {hasContact ? (
                        <>
                          <Mail className="h-4 w-4 text-green-600" />
                          <span className="text-green-700 text-xs">Available</span>
                        </>
                      ) : (
                        <>
                          <MailX className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-500 text-xs">None</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      {response.anonymous === 'Yes' ? (
                        <>
                          <UserX className="h-4 w-4 text-orange-600" />
                          <span className="text-orange-700 text-xs">Yes</span>
                        </>
                      ) : (
                        <>
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="text-blue-700 text-xs">No</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">
                    {issues.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          {issues.length} issue{issues.length > 1 ? 's' : ''}
                        </span>
                        <div className="text-xs text-gray-600 mt-1">
                          {issues.slice(0, 2).join(', ')}
                          {issues.length > 2 && ` +${issues.length - 2} more`}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">None</span>
                    )}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm max-w-xs">
                    <div className="truncate" title={response.biggest_concern || ''}>
                      {response.biggest_concern || (
                        <span className="text-gray-400">Not provided</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No responses match the current filters.
        </div>
      )}
    </div>
  );
}