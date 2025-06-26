'use client';

import { useState } from 'react';
import { Download, Filter, Plus } from 'lucide-react';
import PeopleAdvancedFilterBuilder from './PeopleAdvancedFilterBuilder';
import { PeopleFilterGroup } from '@/lib/people-filters';

export default function PeoplePageClient() {
  const [filterGroups, setFilterGroups] = useState<PeopleFilterGroup[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const handleExport = () => {
    // TODO: Implement people export functionality
    console.log('Export people data');
  };

  const handleAddPerson = () => {
    // TODO: Navigate to add person page or modal
    console.log('Add new person');
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
          filterGroups.length > 0 ? 'ring-2 ring-primary-500 border-primary-500' : ''
        }`}
      >
        <Filter className="h-4 w-4 mr-1" />
        Filters
        {filterGroups.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
            {filterGroups.reduce((acc, g) => acc + g.conditions.length, 0)}
          </span>
        )}
      </button>

      <button
        onClick={handleExport}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Download className="h-4 w-4 mr-1" />
        Export
      </button>

      <button
        onClick={handleAddPerson}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Person
      </button>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <PeopleAdvancedFilterBuilder
                filterGroups={filterGroups}
                onFilterChange={setFilterGroups}
              />
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}