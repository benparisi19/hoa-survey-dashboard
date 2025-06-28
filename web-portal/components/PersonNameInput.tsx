'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Check, Mail, Phone } from 'lucide-react';

interface Person {
  person_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  preferred_contact_method: 'email' | 'phone' | 'text' | 'mail';
  is_official_owner: boolean;
  source?: string;
}

interface PersonNameInputProps {
  value: string;
  onChange: (value: string) => void;
  onPersonSelect?: (person: Person) => void;
  placeholder?: string;
  className?: string;
}

export default function PersonNameInput({ 
  value, 
  onChange, 
  onPersonSelect,
  placeholder = "Start typing a name...",
  className = "w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
}: PersonNameInputProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load all people on component mount
  useEffect(() => {
    async function loadPeople() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/people');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setPeople(data || []);
      } catch (error) {
        console.error('Error loading people:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPeople();
  }, []);

  // Filter people based on input value
  useEffect(() => {
    if (!value || value.length < 2) {
      setFilteredPeople([]);
      setShowSuggestions(false);
      return;
    }

    const searchTerm = value.toLowerCase().trim();
    const matches = people.filter(person => 
      (person.full_name || '').toLowerCase().includes(searchTerm) ||
      (person.first_name || '').toLowerCase().includes(searchTerm) ||
      (person.last_name || '').toLowerCase().includes(searchTerm) ||
      (person.email || '').toLowerCase().includes(searchTerm)
    ).slice(0, 10); // Limit to 10 suggestions

    setFilteredPeople(matches);
    setShowSuggestions(matches.length > 0);
    setSelectedIndex(-1);
  }, [value, people]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredPeople.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredPeople.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredPeople.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectPerson(filteredPeople[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle person selection
  const selectPerson = (person: Person) => {
    onChange(person.full_name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
    
    // Notify parent component of person selection
    if (onPersonSelect) {
      onPersonSelect(person);
    }
  };

  // Check if current value matches a person exactly
  const matchedPerson = people.find(p => 
    (p.full_name || '').toLowerCase() === value.toLowerCase()
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
            if (filteredPeople.length > 0) {
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
          className={`${className} ${matchedPerson ? 'pr-8' : ''}`}
          autoComplete="off"
        />
        
        {/* Checkmark for exact match */}
        {matchedPerson && (
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

      {/* Person suggestions dropdown */}
      {showSuggestions && filteredPeople.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredPeople.map((person, index) => (
            <div
              key={person.person_id}
              className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => selectPerson(person)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-start space-x-2">
                <User className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {person.full_name}
                    {person.is_official_owner && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Owner
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                    {person.email && (
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        <span className="truncate max-w-[120px]">{person.email}</span>
                      </div>
                    )}
                    {person.phone && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        <span>{person.phone}</span>
                      </div>
                    )}
                    {person.source === 'survey_response' && (
                      <span className="text-amber-600">Survey</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Person info for matched name */}
      {matchedPerson && (
        <div className="mt-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
          ✓ Found: {matchedPerson.email || matchedPerson.phone || 'Contact info available'}
          {matchedPerson.is_official_owner && ' • Property Owner'}
        </div>
      )}

      {/* No people found message */}
      {value && value.length >= 2 && !isLoading && filteredPeople.length === 0 && !matchedPerson && (
        <div className="mt-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
          ⚠️ Person not found. This will create a new person record.
        </div>
      )}
    </div>
  );
}