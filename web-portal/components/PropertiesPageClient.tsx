'use client';

import { useState } from 'react';
import { Download, Plus } from 'lucide-react';

export default function PropertiesPageClient() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // TODO: Implement property export functionality
      console.log('Exporting properties...');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddProperty = () => {
    // TODO: Implement add property functionality
    console.log('Adding new property...');
  };

  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? 'Exporting...' : 'Export CSV'}
      </button>
      
      <button
        onClick={handleAddProperty}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Property
      </button>
    </div>
  );
}