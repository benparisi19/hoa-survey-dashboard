'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Property {
  property_id: string;
  address: string;
  lot_number: string;
  hoa_zone: string;
  street_group: string;
}

interface PropertyAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function PropertyAddressInput({ 
  value, 
  onChange, 
  placeholder = "Start typing an address...",
  className = "w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
}: PropertyAddressInputProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load all properties on component mount
  useEffect(() => {
    async function loadProperties() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('property_id, address, lot_number, hoa_zone, street_group')
          .order('address');

        if (error) {
          console.error('Error loading properties:', error);
        } else {
          setProperties(data || []);
        }
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProperties();
  }, []);

  // Filter properties based on input value
  useEffect(() => {
    if (!value || value.length < 2) {
      setFilteredProperties([]);
      setShowSuggestions(false);
      return;
    }

    const searchTerm = value.toLowerCase().trim();
    const matches = properties.filter(property => 
      property.address.toLowerCase().includes(searchTerm)
    ).slice(0, 10); // Limit to 10 suggestions

    setFilteredProperties(matches);
    setShowSuggestions(matches.length > 0);
    setSelectedIndex(-1);
  }, [value, properties]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredProperties.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredProperties.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredProperties.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectProperty(filteredProperties[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle property selection
  const selectProperty = (property: Property) => {
    onChange(property.address);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Check if current value matches a property exactly
  const matchedProperty = properties.find(p => 
    p.address.toLowerCase() === value.toLowerCase()
  );

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (filteredProperties.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={(e) => {
            // Delay hiding suggestions to allow clicks
            setTimeout(() => {
              if (!dropdownRef.current?.contains(document.activeElement)) {
                setShowSuggestions(false);
              }
            }, 150);
          }}
          placeholder={placeholder}
          className={`${className} ${matchedProperty ? 'pr-8' : ''}`}
          autoComplete="off"
        />
        
        {/* Checkmark for valid address */}
        {matchedProperty && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Property suggestions dropdown */}
      {showSuggestions && filteredProperties.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredProperties.map((property, index) => (
            <div
              key={property.property_id}
              className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => selectProperty(property)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {property.address}
                  </div>
                  <div className="text-xs text-gray-500">
                    Lot {property.lot_number} • Zone {property.hoa_zone} • {property.street_group}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Property info for matched address */}
      {matchedProperty && (
        <div className="mt-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
          ✓ Linked to Lot {matchedProperty.lot_number}, Zone {matchedProperty.hoa_zone} ({matchedProperty.street_group})
        </div>
      )}

      {/* No properties found message */}
      {value && value.length >= 2 && !isLoading && filteredProperties.length === 0 && !matchedProperty && (
        <div className="mt-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
          ⚠️ Address not found in property directory. Double-check spelling or contact admin.
        </div>
      )}
    </div>
  );
}