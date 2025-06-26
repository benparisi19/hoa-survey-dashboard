'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Download, ChevronUp, ChevronDown, User, UserX, Mail, MailX, Phone, ExternalLink, MessageSquare, AlertTriangle, Clock, Settings2 } from 'lucide-react';
import Link from 'next/link';
import { ResponseData } from '@/app/responses/page';
import { parseContactInfo } from '@/lib/utils';
import AdvancedFilterBuilder from './AdvancedFilterBuilder';
import {
  AdvancedFilterSet,
  createEmptyFilterSet,
  applyAdvancedFilters,
  convertLegacyFilters
} from '@/lib/advanced-filters';

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
  reviewStatus: string;
  hasNotes: string;
}

const SERVICE_RATINGS = ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor', 'Not Specified'];
const ISSUES = [
  { key: 'irrigation', label: 'Irrigation' },
  { key: 'poor_mowing', label: 'Poor Mowing' },
  { key: 'property_damage', label: 'Property Damage' },
  { key: 'missed_service', label: 'Missed Service' },
  { key: 'inadequate_weeds', label: 'Inadequate Weeds' },
];

type SortField = 'response_id' | 'address' | 'name' | 'q2_service_rating' | 'q1_preference' | 'review_status' | 'total_notes';
type SortDirection = 'asc' | 'desc';

export default function ResponsesTable({ responses }: ResponsesTableProps) {
  // Simple filters state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    serviceRating: '',
    hasContact: '',
    anonymous: '',
    optOut: '',
    issues: [],
    reviewStatus: '',
    hasNotes: '',
  });
  
  // Advanced filters state
  const [advancedFilterSet, setAdvancedFilterSet] = useState<AdvancedFilterSet>(createEmptyFilterSet());
  const [useAdvancedFilters, setUseAdvancedFilters] = useState(false);
  
  const [sortField, setSortField] = useState<SortField>('response_id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Helper functions
  const getContactInfo = (response: ResponseData) => {
    return parseContactInfo(response.email_contact);
  };

  const hasContactInfo = (response: ResponseData) => {
    return getContactInfo(response).isValid;
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
    let filtered: ResponseData[];
    
    // Choose filtering method
    console.log('Filter mode:', { useAdvancedFilters, advancedFilterSet });
    
    if (useAdvancedFilters) {
      // Check if there are any actual filter conditions
      const hasActiveConditions = advancedFilterSet.groups.some(group => 
        group.conditions.some(condition => {
          // Some operators don't require values
          const noValueOperators = ['exists', 'not_exists', 'is_empty', 'is_not_empty'];
          const isActive = noValueOperators.includes(condition.operator) || 
            (condition.value !== null && condition.value !== undefined && condition.value !== '');
          
          console.log('Checking condition:', {
            field: condition.field,
            operator: condition.operator,
            value: condition.value,
            isActive
          });
          
          return isActive;
        })
      );
      
      console.log('Has active conditions:', hasActiveConditions);
      
      if (hasActiveConditions) {
        // Use advanced filters
        console.log('Applying advanced filters:', advancedFilterSet);
        filtered = applyAdvancedFilters(responses, advancedFilterSet);
        console.log(`Advanced filtering: ${responses.length} -> ${filtered.length} responses`);
      } else {
        // No active conditions, show all responses
        filtered = responses;
        console.log('Advanced filters active but no conditions set, showing all responses');
      }
    } else {
      // Use simple filters
      filtered = responses.filter(response => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          response.response_id,
          response.address,
          response.name,
          response.q2_service_rating,
          response.q1_preference,
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
        const contactInfo = getContactInfo(response);
        if (filters.hasContact !== contactInfo.type) return false;
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

      // Review status filter
      if (filters.reviewStatus) {
        const reviewStatus = response.review_status || 'unreviewed';
        if (reviewStatus !== filters.reviewStatus) return false;
      }

      // Notes filter
      if (filters.hasNotes) {
        const totalNotes = response.total_notes || 0;
        const criticalNotes = response.critical_notes || 0;
        const followUpNotes = response.follow_up_notes || 0;
        
        if (filters.hasNotes === 'any' && totalNotes === 0) return false;
        if (filters.hasNotes === 'critical' && criticalNotes === 0) return false;
        if (filters.hasNotes === 'follow_up' && followUpNotes === 0) return false;
        if (filters.hasNotes === 'none' && totalNotes > 0) return false;
      }

        return true;
      });
    }

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Special handling for service ratings
      if (sortField === 'q2_service_rating') {
        const ratingOrder = ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent', 'Not Specified'];
        aValue = ratingOrder.indexOf(aValue) !== -1 ? ratingOrder.indexOf(aValue) : 999;
        bValue = ratingOrder.indexOf(bValue) !== -1 ? ratingOrder.indexOf(bValue) : 999;
      }

      // Special handling for review status
      if (sortField === 'review_status') {
        const statusOrder = ['flagged', 'unreviewed', 'in_progress', 'reviewed'];
        aValue = statusOrder.indexOf(aValue || 'unreviewed');
        bValue = statusOrder.indexOf(bValue || 'unreviewed');
      }

      // Special handling for preferences
      if (sortField === 'q1_preference') {
        const prefOrder = ['Keep current', 'Opt out', 'hire my own'];
        const aPref = (aValue || '').toLowerCase();
        const bPref = (bValue || '').toLowerCase();
        
        let aIndex = 999;
        let bIndex = 999;
        
        if (aPref.includes('keep current') || aPref.includes('keep hoa')) aIndex = 0;
        else if (aPref.includes('opt out') || aPref.includes('maintain it myself')) aIndex = 1;
        else if (aPref.includes('hire my own') || aPref.includes('hire own')) aIndex = 2;
        
        if (bPref.includes('keep current') || bPref.includes('keep hoa')) bIndex = 0;
        else if (bPref.includes('opt out') || bPref.includes('maintain it myself')) bIndex = 1;
        else if (bPref.includes('hire my own') || bPref.includes('hire own')) bIndex = 2;
        
        aValue = aIndex;
        bValue = bIndex;
      }

      // Numeric sorting for notes
      if (sortField === 'total_notes') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [responses, filters, advancedFilterSet, useAdvancedFilters, sortField, sortDirection]);

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
      'Address',
      'Name',
      'Anonymous',
      'Contact Type',
      'Contact Methods',
      'Contact Preferences',
      'Service Rating',
      'Preference',
      'Issues Count',
      'Issues',
      'Total Notes',
      'Critical Notes',
      'Follow-up Notes',
      'Review Status',
      'Reviewed By',
      'Reviewed At'
    ];

    const csvData = filteredData.map(response => {
      const contactInfo = getContactInfo(response);
      return [
        response.response_id,
        response.address || '',
        response.name || '',
        response.anonymous,
        contactInfo.type,
        [...contactInfo.emails, ...contactInfo.phones].join('; '),
        contactInfo.preferences.join('; '),
        response.q2_service_rating || '',
        response.q1_preference || '',
        getIssueCount(response),
        getIssues(response).join('; '),
        response.total_notes || 0,
        response.critical_notes || 0,
        response.follow_up_notes || 0,
        response.review_status || 'unreviewed',
        response.reviewed_by || '',
        response.reviewed_at || ''
      ];
    });

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
      reviewStatus: '',
      hasNotes: '',
    });
    setAdvancedFilterSet(createEmptyFilterSet());
    setUseAdvancedFilters(false);
  };

  const switchToAdvancedFilters = () => {
    // Convert current simple filters to advanced format
    const convertedFilters = convertLegacyFilters(filters);
    setAdvancedFilterSet(convertedFilters);
    setUseAdvancedFilters(true);
    setShowAdvancedFilters(true);
    setShowFilters(false);
  };

  const switchToSimpleFilters = () => {
    setUseAdvancedFilters(false);
    setShowAdvancedFilters(false);
    setShowFilters(true);
  };

  const handleAdvancedFilterChange = (newFilterSet: AdvancedFilterSet) => {
    setAdvancedFilterSet(newFilterSet);
    // Ensure we're in advanced filter mode when filters are being built
    if (!useAdvancedFilters) {
      setUseAdvancedFilters(true);
    }
  };

  const applyAdvancedFilterSet = () => {
    // Filters are applied automatically via useMemo
    // This function provides user feedback that filters have been applied
    const hasActiveConditions = advancedFilterSet.groups.some(group => 
      group.conditions.some(condition => {
        // Some operators don't require values
        const noValueOperators = ['exists', 'not_exists', 'is_empty', 'is_not_empty'];
        if (noValueOperators.includes(condition.operator)) {
          return true; // These operators are always active when set
        }
        // For other operators, check if value is provided
        return condition.value !== null && condition.value !== undefined && condition.value !== '';
      })
    );
    
    if (hasActiveConditions) {
      const activeGroups = advancedFilterSet.groups.filter(group => 
        group.conditions.some(condition => {
          const noValueOperators = ['exists', 'not_exists', 'is_empty', 'is_not_empty'];
          if (noValueOperators.includes(condition.operator)) {
            return true;
          }
          return condition.value !== null && condition.value !== undefined && condition.value !== '';
        })
      );
      const totalConditions = activeGroups.reduce((sum, group) => 
        sum + group.conditions.filter(condition => {
          const noValueOperators = ['exists', 'not_exists', 'is_empty', 'is_not_empty'];
          if (noValueOperators.includes(condition.operator)) {
            return true;
          }
          return condition.value !== null && condition.value !== undefined && condition.value !== '';
        }).length, 0
      );
      
      console.log(`✓ Applied ${totalConditions} filter conditions across ${activeGroups.length} groups`);
      console.log(`Showing ${filteredData.length} of ${responses.length} responses`);
    } else {
      console.log('No active filter conditions - showing all responses');
    }
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters && !useAdvancedFilters
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
            Simple Filters
          </button>
          <button
            onClick={() => {
              if (!showAdvancedFilters) {
                // When opening advanced filters, switch to advanced mode
                setShowAdvancedFilters(true);
                setUseAdvancedFilters(true);
                setShowFilters(false);
              } else {
                // When closing, just hide the panel but keep the mode
                setShowAdvancedFilters(false);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showAdvancedFilters && useAdvancedFilters
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Settings2 className="h-4 w-4" />
            Advanced Filters
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

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="mb-6">
          <AdvancedFilterBuilder
            filterSet={advancedFilterSet}
            onChange={handleAdvancedFilterChange}
            onApply={applyAdvancedFilterSet}
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Using advanced filters • Filters apply automatically as you build them
              </span>
              <button
                onClick={switchToSimpleFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Switch to simple filters
              </button>
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Simple Filters Panel */}
      {showFilters && !useAdvancedFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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
                Contact Type
              </label>
              <select
                value={filters.hasContact}
                onChange={(e) => setFilters(prev => ({ ...prev, hasContact: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Types</option>
                <option value="email">Email Only</option>
                <option value="phone">Phone Only</option>
                <option value="both">Email & Phone</option>
                <option value="other">Other Method</option>
                <option value="none">No Contact</option>
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

            {/* Review Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Status
              </label>
              <select
                value={filters.reviewStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, reviewStatus: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All Statuses</option>
                <option value="unreviewed">Unreviewed</option>
                <option value="in_progress">In Progress</option>
                <option value="reviewed">Reviewed</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>

            {/* Notes Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <select
                value={filters.hasNotes}
                onChange={(e) => setFilters(prev => ({ ...prev, hasNotes: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All</option>
                <option value="any">Has Notes</option>
                <option value="critical">Has Critical</option>
                <option value="follow_up">Has Follow-up</option>
                <option value="none">No Notes</option>
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

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Showing {filteredData.length} of {responses.length} responses
              </span>
              <button
                onClick={switchToAdvancedFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Upgrade to Advanced Filters
              </button>
            </div>
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Priority Legend */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Priority Indicators</h3>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Critical Notes or Flagged</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Very Poor Service Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Has Follow-up Notes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded"></div>
            <span>Normal</span>
          </div>
        </div>
      </div>

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
                onClick={() => handleSort('address')}
                className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Address <SortIcon field="address" />
                </div>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Name <SortIcon field="name" />
                </div>
              </th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-900 cursor-help" title="Contact information availability">
                Contact
              </th>
              <th
                onClick={() => handleSort('q2_service_rating')}
                className="border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                title="Service quality rating"
              >
                <div className="flex items-center justify-center gap-1">
                  Rating <SortIcon field="q2_service_rating" />
                </div>
              </th>
              <th
                onClick={() => handleSort('q1_preference')}
                className="border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                title="Landscaping service preference"
              >
                <div className="flex items-center justify-center gap-1">
                  Preference <SortIcon field="q1_preference" />
                </div>
              </th>
              <th className="border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-900 cursor-help" title="Landscaping issues experienced">
                Issues
              </th>
              <th
                onClick={() => handleSort('total_notes')}
                className="border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                title="Notes and follow-up items"
              >
                <div className="flex items-center justify-center gap-1">
                  Notes <SortIcon field="total_notes" />
                </div>
              </th>
              <th
                onClick={() => handleSort('review_status')}
                className="border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                title="Review workflow status"
              >
                <div className="flex items-center justify-center gap-1">
                  Review Status <SortIcon field="review_status" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((response) => {
              const issues = getIssues(response);
              const hasContact = hasContactInfo(response);
              const criticalNotes = response.critical_notes || 0;
              const isFlagged = response.review_status === 'flagged';
              const isVeryPoor = response.q2_service_rating === 'Very Poor';
              const hasFollowUp = (response.follow_up_notes || 0) > 0;
              
              // Determine priority styling
              let rowClasses = "hover:bg-gray-50";
              let leftBorder = "";
              
              if (criticalNotes > 0 || isFlagged) {
                rowClasses = "bg-red-50 hover:bg-red-100";
                leftBorder = "border-l-4 border-red-500";
              } else if (isVeryPoor) {
                rowClasses = "bg-orange-50 hover:bg-orange-100"; 
                leftBorder = "border-l-4 border-orange-500";
              } else if (hasFollowUp) {
                rowClasses = "bg-yellow-50 hover:bg-yellow-100";
                leftBorder = "border-l-4 border-yellow-500";
              }
              
              return (
                <tr key={response.response_id} className={`${rowClasses} ${leftBorder}`}>
                  <td className="border border-gray-200 px-4 py-3 text-sm">
                    <Link
                      href={`/responses/${response.response_id}`}
                      className="flex items-center space-x-2 font-mono font-medium text-primary-600 hover:text-primary-800 transition-colors"
                    >
                      <span>{response.response_id}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm max-w-xs">
                    <div className="truncate" title={response.address || ''}>
                      {response.address || <span className="text-gray-400 italic">No address</span>}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm max-w-xs">
                    <div className="truncate" title={response.name || ''}>
                      {response.name || <span className="text-gray-400 italic">No name</span>}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                    {(() => {
                      const contactInfo = getContactInfo(response);
                      const isAnonymous = response.anonymous === 'Yes';
                      
                      if (isAnonymous) {
                        return (
                          <div title="Anonymous" className="flex justify-center cursor-help">
                            <UserX className="h-4 w-4 text-orange-600" />
                          </div>
                        );
                      }
                      
                      return (
                        <div className="flex items-center justify-center gap-1">
                          {contactInfo.type === 'both' ? (
                            <>
                              <div title="Email" className="cursor-help"><Mail className="h-4 w-4 text-green-600" /></div>
                              <div title="Phone" className="cursor-help"><Phone className="h-4 w-4 text-green-600" /></div>
                            </>
                          ) : contactInfo.type === 'email' ? (
                            <div title="Email" className="cursor-help"><Mail className="h-4 w-4 text-blue-600" /></div>
                          ) : contactInfo.type === 'phone' ? (
                            <div title="Phone" className="cursor-help"><Phone className="h-4 w-4 text-purple-600" /></div>
                          ) : contactInfo.type === 'other' ? (
                            <div title="Other contact method" className="cursor-help"><Mail className="h-4 w-4 text-orange-600" /></div>
                          ) : (
                            <div title="No contact info" className="cursor-help"><MailX className="h-4 w-4 text-gray-400" /></div>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                    <div className="flex justify-center">
                      {response.q2_service_rating && (
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          response.q2_service_rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                          response.q2_service_rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                          response.q2_service_rating === 'Fair' ? 'bg-yellow-100 text-yellow-800' :
                          response.q2_service_rating === 'Poor' ? 'bg-orange-100 text-orange-800' :
                          response.q2_service_rating === 'Very Poor' ? 'bg-red-100 text-red-800' :
                          response.q2_service_rating === 'Not Specified' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {response.q2_service_rating}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                    <div className="flex justify-center">
                      {(() => {
                        if (!response.q1_preference) return null;
                        
                        const pref = response.q1_preference.toLowerCase();
                        if (pref.includes('keep current') || pref.includes('keep hoa')) {
                          return (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                              Keep HOA
                            </span>
                          );
                        } else if (pref.includes('hire my own') || pref.includes('hire own')) {
                          return (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                              Hire Own
                            </span>
                          );
                        } else if (pref.includes('maintain it myself') || pref.includes('opt out')) {
                          return (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 whitespace-nowrap">
                              Opt Out
                            </span>
                          );
                        } else {
                          return (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">
                              Other
                            </span>
                          );
                        }
                      })()}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                    <div className="flex justify-center items-center gap-1 whitespace-nowrap">
                      {response.irrigation === 'Yes' && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full cursor-help" title="Irrigation/sprinkler problems">
                          💧
                        </span>
                      )}
                      {response.poor_mowing === 'Yes' && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full cursor-help" title="Poor mowing quality">
                          🌱
                        </span>
                      )}
                      {response.property_damage === 'Yes' && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full cursor-help" title="Property damage">
                          🏠
                        </span>
                      )}
                      {response.missed_service === 'Yes' && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full cursor-help" title="Missed service dates">
                          📅
                        </span>
                      )}
                      {response.inadequate_weeds === 'Yes' && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full cursor-help" title="Inadequate weed control">
                          🌿
                        </span>
                      )}
                      {issues.length === 0 && (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                    <div className="flex justify-center">
                      {(() => {
                        const totalNotes = response.total_notes || 0;
                        const criticalNotes = response.critical_notes || 0;
                        const followUpNotes = response.follow_up_notes || 0;
                        
                        if (totalNotes === 0) {
                          return <span className="text-gray-400 text-xs">None</span>;
                        }
                        
                        return (
                          <div className="flex items-center gap-1">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3 text-blue-600" />
                              <span className="text-xs font-medium">{totalNotes}</span>
                            </div>
                            {criticalNotes > 0 && (
                              <span className="bg-red-100 text-red-800 text-xs px-1 py-0.5 rounded flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {criticalNotes}
                              </span>
                            )}
                            {followUpNotes > 0 && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-1 py-0.5 rounded flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {followUpNotes}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm text-center">
                    <div className="flex justify-center">
                      {(() => {
                        const status = response.review_status || 'unreviewed';
                        const isFlagged = status === 'flagged';
                        
                        return (
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              status === 'reviewed' ? 'bg-green-100 text-green-800' :
                              status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              status === 'flagged' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {status === 'unreviewed' ? 'Unreviewed' :
                               status === 'in_progress' ? 'In Progress' :
                               status === 'reviewed' ? 'Reviewed' :
                               status === 'flagged' ? 'Flagged' : status}
                            </span>
                            {isFlagged && (
                              <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 cursor-help" title="Flagged for attention">
                                🚩
                              </span>
                            )}
                          </div>
                        );
                      })()} 
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