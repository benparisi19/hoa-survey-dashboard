import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getServiceRatingColor(rating: string | null): string {
  switch (rating?.toLowerCase()) {
    case 'excellent':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'good':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'fair':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'poor':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'very poor':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'not specified':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getPreferenceColor(preference: string | null): string {
  if (preference?.toLowerCase().includes('keep current')) {
    return 'text-green-600 bg-green-50 border-green-200';
  } else if (preference?.toLowerCase().includes('opt out')) {
    return 'text-blue-600 bg-blue-50 border-blue-200';
  } else if (preference?.toLowerCase().includes('hire own')) {
    return 'text-purple-600 bg-purple-50 border-purple-200';
  }
  return 'text-gray-600 bg-gray-50 border-gray-200';
}

export function getBadgeClass(type: 'success' | 'warning' | 'error' | 'info' | 'default'): string {
  switch (type) {
    case 'success':
      return 'badge-green';
    case 'warning':
      return 'badge-yellow';
    case 'error':
      return 'badge-red';
    case 'info':
      return 'badge-blue';
    default:
      return 'badge-gray';
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export interface ContactInfo {
  hasEmail: boolean;
  hasPhone: boolean;
  isValid: boolean;
  type: 'none' | 'email' | 'phone' | 'both' | 'other';
  emails: string[];
  phones: string[];
  preferences: string[];
  displayText: string;
  original: string;
}

export function parseContactInfo(contact: string | null): ContactInfo {
  if (!contact || contact === 'Not provided' || contact.trim() === '') {
    return { 
      hasEmail: false, 
      hasPhone: false, 
      isValid: false,
      type: 'none',
      emails: [],
      phones: [],
      preferences: [],
      displayText: 'No contact provided',
      original: contact || ''
    };
  }

  const text = contact.toLowerCase();
  
  // Extract emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = contact.match(emailRegex) || [];
  
  // Extract phone numbers (various formats)
  const phoneRegex = /(\(\d{3}\)|\d{3})[-.\/\s]*\d{3}[-.\/\s]*\d{4}|\b\d{10}\b/g;
  const phones = contact.match(phoneRegex) || [];
  
  // Extract communication preferences
  const preferences: string[] = [];
  if (text.includes('text')) preferences.push('Text');
  if (text.includes('call') && !text.includes('recall')) preferences.push('Call');
  if (text.includes('phone')) preferences.push('Phone');
  if (text.includes('cell')) preferences.push('Cell');
  if (text.includes('email') && emails.length === 0) preferences.push('Email');
  if (text.includes('mail') && !text.includes('email')) preferences.push('Mail');
  if (text.includes('person')) preferences.push('In-person');
  
  // Determine type
  let type: ContactInfo['type'] = 'none';
  if (emails.length > 0 && phones.length > 0) type = 'both';
  else if (emails.length > 0) type = 'email';
  else if (phones.length > 0) type = 'phone';
  else if (preferences.length > 0) type = 'other';
  
  // Create display text
  let displayText = 'No contact';
  if (type === 'both' && emails[0] && phones[0]) {
    displayText = `${emails[0]} & ${phones[0]}`;
    if (preferences.length > 0) displayText += ` (${preferences.join(', ')})`;
  } else if (type === 'email' && emails[0]) {
    displayText = emails[0];
  } else if (type === 'phone' && phones[0]) {
    displayText = phones[0];
    if (preferences.length > 0) displayText += ` (${preferences.join(', ')})`;
  } else if (type === 'other') {
    displayText = preferences.join(', ');
  }
  
  return {
    hasEmail: emails.length > 0,
    hasPhone: phones.length > 0,
    isValid: emails.length > 0 || phones.length > 0 || preferences.length > 0,
    type,
    emails,
    phones,
    preferences: Array.from(new Set(preferences)), // Remove duplicates
    displayText,
    original: contact
  };
}

export const CHART_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red  
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export const SERVICE_RATING_ORDER = ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor', 'Not Specified'];

/**
 * Normalizes service ratings by applying conservative approach:
 * - When multiple ratings are marked, uses the worst (lowest) rating
 * - Handles edge cases like "Not marked", contextual ratings, etc.
 */
export function normalizeServiceRating(rating: string | null): string | null {
  if (!rating || rating.trim() === '') {
    return null;
  }

  const ratingLower = rating.toLowerCase();

  // Handle "Not marked" cases
  if (ratingLower.includes('not marked')) {
    return 'Not Specified';
  }

  // Rating hierarchy (lower number = worse rating)
  const ratingHierarchy: { [key: string]: number } = {
    'very poor': 1,
    'poor': 2,
    'fair': 3,
    'good': 4,
    'excellent': 5,
  };

  // Find all standard ratings mentioned in the text
  const mentionedRatings: Array<{ rating: string; value: number }> = [];
  
  Object.entries(ratingHierarchy).forEach(([ratingName, value]) => {
    if (ratingLower.includes(ratingName)) {
      mentionedRatings.push({ rating: ratingName, value });
    }
  });

  // If we found standard ratings, return the worst one (lowest value)
  if (mentionedRatings.length > 0) {
    const worstRating = mentionedRatings.reduce((worst, current) => 
      current.value < worst.value ? current : worst
    );
    
    // Convert back to proper case
    switch (worstRating.rating) {
      case 'very poor': return 'Very Poor';
      case 'poor': return 'Poor';
      case 'fair': return 'Fair';
      case 'good': return 'Good';
      case 'excellent': return 'Excellent';
      default: return 'Not Specified';
    }
  }

  // If no standard ratings found, mark as not specified
  return 'Not Specified';
}

export const PREFERENCE_ORDER = [
  'Keep current HOA landscaping',
  'Opt out and maintain it myself',
  'Opt out and hire my own landscaper',
  'Find replacement or reduce service',
];

export function sortByOrder<T>(
  items: T[],
  getValue: (item: T) => string | null,
  order: string[]
): T[] {
  return items.sort((a, b) => {
    const aValue = getValue(a);
    const bValue = getValue(b);
    
    const aIndex = aValue ? order.indexOf(aValue) : -1;
    const bIndex = bValue ? order.indexOf(bValue) : -1;
    
    // If both are in the order array, sort by order
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // If only one is in the order array, prioritize it
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // If neither is in the order array, sort alphabetically
    return (aValue || '').localeCompare(bValue || '');
  });
}