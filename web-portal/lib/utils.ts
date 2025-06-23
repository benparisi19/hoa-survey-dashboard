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
      return 'text-green-600 bg-green-50 border-green-200';
    case 'fair':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'poor':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'very poor':
      return 'text-red-600 bg-red-50 border-red-200';
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

export function parseContactInfo(contact: string | null): {
  hasEmail: boolean;
  hasPhone: boolean;
  isValid: boolean;
} {
  if (!contact || contact === 'Not provided' || contact.trim() === '') {
    return { hasEmail: false, hasPhone: false, isValid: false };
  }
  
  const hasEmail = contact.includes('@');
  const hasPhone = /\d{3}[-.]\d{3}[-.]\d{4}|\(\d{3}\)\s*\d{3}[-.]\d{4}|\d{10}/.test(contact);
  
  return {
    hasEmail,
    hasPhone,
    isValid: hasEmail || hasPhone,
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

export const SERVICE_RATING_ORDER = ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor'];

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