'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Import the CSS for Mapbox
if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
}

interface PropertyMapProps {
  properties: Array<{
    property_id: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    hoa_zone: string;
    current_residents: number;
    status?: 'occupied' | 'vacant' | 'owner_occupied';
    survey_count?: number;
  }>;
  selectedZone?: string;
  onPropertyClick?: (propertyId: string) => void;
  className?: string;
}

const ZONE_COLORS = {
  '1': '#3B82F6', // Blue
  '2': '#10B981', // Green
  '3': '#F59E0B', // Amber
} as const;

export default function PropertyMap({ 
  properties, 
  selectedZone, 
  onPropertyClick,
  className = "h-96"
}: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter properties with valid coordinates
  const validProperties = properties.filter(p => {
    const lat = typeof p.latitude === 'string' ? parseFloat(p.latitude) : p.latitude;
    const lng = typeof p.longitude === 'string' ? parseFloat(p.longitude) : p.longitude;
    return lat !== null && 
           lng !== null && 
           !isNaN(lat) && 
           !isNaN(lng) &&
           lat !== 0 && 
           lng !== 0;
  });

  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) return;

    // Initialize map
    const firstProperty = validProperties[0];
    const defaultCenter = firstProperty ? [
      typeof firstProperty.longitude === 'string' ? parseFloat(firstProperty.longitude) : firstProperty.longitude!,
      typeof firstProperty.latitude === 'string' ? parseFloat(firstProperty.latitude) : firstProperty.latitude!
    ] : [-122.4194, 37.7749];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: defaultCenter,
      zoom: 15
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update markers when properties change
  useEffect(() => {
    if (!map.current || !mapLoaded || validProperties.length === 0) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.property-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Calculate bounds to fit all properties
    const bounds = new mapboxgl.LngLatBounds();
    const markers: mapboxgl.Marker[] = [];

    validProperties.forEach(property => {
      if (selectedZone && property.hoa_zone !== selectedZone) return;

      const longitude = typeof property.longitude === 'string' ? parseFloat(property.longitude) : property.longitude!;
      const latitude = typeof property.latitude === 'string' ? parseFloat(property.latitude) : property.latitude!;

      bounds.extend([longitude, latitude]);

      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'property-marker';
      markerElement.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        background-color: ${ZONE_COLORS[property.hoa_zone as keyof typeof ZONE_COLORS] || '#6B7280'};
        opacity: ${property.status === 'vacant' ? 0.6 : 1};
      `;

      // Add status indicator
      if (property.status === 'vacant') {
        markerElement.style.borderColor = '#EF4444'; // Red border for vacant
      } else if (property.current_residents === 0) {
        markerElement.style.borderColor = '#F59E0B'; // Orange border for unknown occupancy
      }

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([longitude, latitude])
        .addTo(map.current!);

      // Create popup
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: false,
        closeOnClick: false 
      }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <div class="font-semibold text-gray-900 mb-2">${property.address}</div>
          <div class="space-y-1 text-sm text-gray-600">
            <div class="flex justify-between">
              <span>Zone:</span>
              <span class="font-medium">${property.hoa_zone}</span>
            </div>
            <div class="flex justify-between">
              <span>Residents:</span>
              <span class="font-medium">${property.current_residents}</span>
            </div>
            <div class="flex justify-between">
              <span>Status:</span>
              <span class="font-medium capitalize">
                ${property.status?.replace('_', ' ') || 'Unknown'}
              </span>
            </div>
            ${property.survey_count !== undefined ? `
              <div class="flex justify-between">
                <span>Surveys:</span>
                <span class="font-medium">${property.survey_count}</span>
              </div>
            ` : ''}
          </div>
          <div class="mt-2 pt-2 border-t border-gray-200">
            <button 
              onclick="window.location.href='/properties/${property.property_id}'"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Details →
            </button>
          </div>
        </div>
      `);

      // Show popup on hover
      markerElement.addEventListener('mouseenter', () => {
        popup.addTo(map.current!);
        marker.setPopup(popup);
      });

      markerElement.addEventListener('mouseleave', () => {
        popup.remove();
      });

      // Handle click
      markerElement.addEventListener('click', () => {
        if (onPropertyClick) {
          onPropertyClick(property.property_id);
        }
      });

      markers.push(marker);
    });

    // Fit map to show all markers
    if (bounds.isEmpty() === false) {
      map.current.fitBounds(bounds, { 
        padding: 50,
        maxZoom: 17
      });
    }

    // Cleanup function
    return () => {
      markers.forEach(marker => marker.remove());
    };
  }, [mapLoaded, validProperties, selectedZone, onPropertyClick]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return (
      <div className={`${className} bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <p className="font-medium mb-2">Map requires Mapbox API token</p>
          <p className="text-sm">Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your .env file</p>
        </div>
      </div>
    );
  }

  if (validProperties.length === 0) {
    return (
      <div className={`${className} bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center`}>
        <div className="text-center text-gray-500">
          <p className="font-medium mb-2">No properties with coordinates found</p>
          <p className="text-sm">Properties need to be geocoded first</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden border border-gray-200`}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm">
        <div className="font-medium text-gray-900 mb-2">Zone Legend</div>
        <div className="space-y-1">
          {Object.entries(ZONE_COLORS).map(([zone, color]) => (
            <div key={zone} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-700">Zone {zone}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
          <div>• Red border = Vacant</div>
          <div>• Orange border = Unknown occupancy</div>
        </div>
      </div>
    </div>
  );
}