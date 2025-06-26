'use client';

import { useState } from 'react';
import { Map, Grid3X3, Eye } from 'lucide-react';
import PropertyMap from './PropertyMap';

interface ZoneData {
  zone: string;
  propertyCount: number;
  residentCount: number;
  surveyCount: number;
  completionRate: number;
  occupancyRate: number;
  ownerOccupiedCount: number;
  streetGroups: string[];
  issuesCount: number;
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    title: string;
    description: string;
  }>;
}

interface PropertyMapData {
  property_id: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  hoa_zone: string;
  current_residents: number;
  status?: 'occupied' | 'vacant' | 'owner_occupied';
  survey_count?: number;
}

interface ZonesPageClientProps {
  zones: ZoneData[];
  properties: PropertyMapData[];
}

type ViewMode = 'cards' | 'map';

export default function ZonesPageClient({ zones, properties }: ZonesPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [selectedZone, setSelectedZone] = useState<string>('');

  const handlePropertyClick = (propertyId: string) => {
    // Navigate to property detail page
    window.location.href = `/properties/${propertyId}`;
  };

  const ZoneCard = ({ zone }: { zone: ZoneData }) => {
    const getStatusColor = () => {
      if (zone.alerts.some(a => a.type === 'error')) return 'border-red-300 bg-red-50';
      if (zone.alerts.some(a => a.type === 'warning')) return 'border-yellow-300 bg-yellow-50';
      return 'border-green-300 bg-green-50';
    };

    return (
      <div className={`p-6 rounded-lg border-2 hover:shadow-lg transition-all cursor-pointer ${getStatusColor()}`}
           onClick={() => window.location.href = `/zones/${zone.zone}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Eye className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Zone {zone.zone}</h3>
              <p className="text-sm text-gray-600">
                {zone.streetGroups.length} street groups
              </p>
            </div>
          </div>
          {zone.alerts.length > 0 && (
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium text-orange-600">
                {zone.alerts.length} alert{zone.alerts.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-sm text-gray-600">
            {zone.propertyCount} Properties
          </div>
          <div className="text-sm text-gray-600">
            {zone.residentCount} Residents
          </div>
          <div className="text-sm text-gray-600">
            {zone.surveyCount} Surveys
          </div>
          <div className="text-sm text-gray-600">
            {zone.occupancyRate.toFixed(1)}% Occupied
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Survey Completion</span>
            <span className={`font-medium ${
              zone.completionRate >= 70 ? 'text-green-600' : 
              zone.completionRate >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {zone.completionRate.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                zone.completionRate >= 70 ? 'bg-green-500' : 
                zone.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(zone.completionRate, 100)}%` }}
            />
          </div>
        </div>

        {zone.streetGroups.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Street Groups:</p>
            <div className="flex flex-wrap gap-1">
              {zone.streetGroups.slice(0, 3).map(group => (
                <span key={group} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                  {group}
                </span>
              ))}
              {zone.streetGroups.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                  +{zone.streetGroups.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const hasValidCoordinates = properties.some(p => p.latitude !== null && p.longitude !== null);

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              disabled={!hasValidCoordinates}
            >
              <Map className="h-4 w-4" />
              <span>Map</span>
            </button>
          </div>
          
          {viewMode === 'map' && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter by zone:</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All zones</option>
                {zones.map(zone => (
                  <option key={zone.zone} value={zone.zone}>Zone {zone.zone}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {!hasValidCoordinates && (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            ⚠️ Map view requires geocoded properties
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map(zone => (
            <ZoneCard key={zone.zone} zone={zone} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <PropertyMap
            properties={properties}
            selectedZone={selectedZone || undefined}
            onPropertyClick={handlePropertyClick}
            className="h-[600px]"
          />
          
          {/* Map Statistics */}
          <div className="bg-white rounded-lg shadow-card border border-gray-200 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {selectedZone ? 
                    properties.filter(p => p.hoa_zone === selectedZone).length :
                    properties.length
                  }
                </div>
                <div className="text-sm text-gray-600">Properties Shown</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {selectedZone ? 
                    properties.filter(p => p.hoa_zone === selectedZone && p.latitude && p.longitude).length :
                    properties.filter(p => p.latitude && p.longitude).length
                  }
                </div>
                <div className="text-sm text-gray-600">Geocoded</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {selectedZone ? 
                    properties.filter(p => p.hoa_zone === selectedZone && p.status === 'vacant').length :
                    properties.filter(p => p.status === 'vacant').length
                  }
                </div>
                <div className="text-sm text-gray-600">Vacant</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {selectedZone ? 
                    properties.filter(p => p.hoa_zone === selectedZone && p.current_residents > 0).length :
                    properties.filter(p => p.current_residents > 0).length
                  }
                </div>
                <div className="text-sm text-gray-600">Occupied</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No zones message */}
      {zones.length === 0 && (
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No zones found</h3>
          <p className="text-gray-600">
            Properties need to be assigned to zones to appear here.
          </p>
        </div>
      )}
    </div>
  );
}