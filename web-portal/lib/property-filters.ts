/**
 * Property-specific Advanced Filter System
 * 
 * This implements the same filtering patterns as responses but for PropertyData
 */

import { PropertyData } from '@/app/properties/page';

// ============================================================================
// Core Data Structures
// ============================================================================

export interface PropertyFilterCondition {
  id: string;
  field: keyof typeof PROPERTY_FILTER_FIELDS;
  operator: PropertyFilterOperator;
  value: any;
  dataType: PropertyFilterDataType;
}

export interface PropertyFilterGroup {
  id: string;
  name?: string;
  conditions: PropertyFilterCondition[];
  internalOperator: 'AND' | 'OR';
}

export interface PropertyAdvancedFilterSet {
  id: string;
  name?: string;
  groups: PropertyFilterGroup[];
  groupOperator: 'AND' | 'OR';
  createdAt?: Date;
  updatedAt?: Date;
}

export type PropertyFilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'in'
  | 'not_in'
  | 'exists'
  | 'not_exists'
  | 'is_empty'
  | 'is_not_empty'
  | 'greater_than'
  | 'less_than'
  | 'greater_equal'
  | 'less_equal';

export type PropertyFilterDataType = 'text' | 'number' | 'boolean' | 'date' | 'select';

// ============================================================================
// Property Field Definitions
// ============================================================================

export const PROPERTY_FILTER_FIELDS = {
  // Basic property info
  address: { label: 'Address', dataType: 'text' as PropertyFilterDataType },
  lot_number: { label: 'Lot Number', dataType: 'text' as PropertyFilterDataType },
  hoa_zone: { label: 'HOA Zone', dataType: 'select' as PropertyFilterDataType, options: ['1', '2', '3'] },
  street_group: { 
    label: 'Street Group', 
    dataType: 'select' as PropertyFilterDataType, 
    options: ['Hills', 'Goldstone', 'Vacheron', 'Esperanto', 'Blueberry', 'Faceto', 'Matisse', 'Sportivo', 'Defio'] 
  },
  property_type: { 
    label: 'Property Type', 
    dataType: 'select' as PropertyFilterDataType, 
    options: ['single_family', 'townhouse', 'condo'] 
  },
  
  // Property details
  square_footage: { label: 'Square Footage', dataType: 'number' as PropertyFilterDataType },
  lot_size_sqft: { label: 'Lot Size (sq ft)', dataType: 'number' as PropertyFilterDataType },
  year_built: { label: 'Year Built', dataType: 'number' as PropertyFilterDataType },
  
  // Aggregated data (when available)
  current_residents: { label: 'Current Residents', dataType: 'number' as PropertyFilterDataType },
  total_surveys: { label: 'Total Surveys', dataType: 'number' as PropertyFilterDataType },
  status: { 
    label: 'Status', 
    dataType: 'select' as PropertyFilterDataType, 
    options: ['active', 'vacant', 'issue', 'compliant'] 
  },
  
  // Contact info (when available)
  owner_name: { label: 'Owner Name', dataType: 'text' as PropertyFilterDataType },
  owner_email: { label: 'Owner Email', dataType: 'text' as PropertyFilterDataType },
  owner_phone: { label: 'Owner Phone', dataType: 'text' as PropertyFilterDataType },
  primary_contact_name: { label: 'Primary Contact', dataType: 'text' as PropertyFilterDataType },
  primary_contact_email: { label: 'Primary Contact Email', dataType: 'text' as PropertyFilterDataType },
  primary_contact_phone: { label: 'Primary Contact Phone', dataType: 'text' as PropertyFilterDataType },
  
  // Additional fields
  notes: { label: 'Notes', dataType: 'text' as PropertyFilterDataType },
  issues_count: { label: 'Issues Count', dataType: 'number' as PropertyFilterDataType },
};

// ============================================================================
// Helper Functions
// ============================================================================

export function createEmptyPropertyFilterSet(): PropertyAdvancedFilterSet {
  return {
    id: crypto.randomUUID(),
    groups: [],
    groupOperator: 'AND',
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export function createEmptyPropertyFilterGroup(): PropertyFilterGroup {
  return {
    id: crypto.randomUUID(),
    conditions: [],
    internalOperator: 'AND'
  };
}

export function createEmptyPropertyFilterCondition(): PropertyFilterCondition {
  return {
    id: crypto.randomUUID(),
    field: 'address',
    operator: 'contains',
    value: '',
    dataType: 'text'
  };
}

// ============================================================================
// Filter Application Logic
// ============================================================================

export function applyPropertyAdvancedFilters(
  properties: PropertyData[], 
  filterSet: PropertyAdvancedFilterSet
): PropertyData[] {
  if (!filterSet.groups.length) {
    return properties;
  }

  return properties.filter(property => {
    const groupResults = filterSet.groups.map(group => {
      if (!group.conditions.length) {
        return true;
      }

      const conditionResults = group.conditions.map(condition => 
        evaluatePropertyCondition(property, condition)
      );

      // Apply internal group operator (AND/OR)
      return group.internalOperator === 'AND' 
        ? conditionResults.every(result => result)
        : conditionResults.some(result => result);
    });

    // Apply group operator (AND/OR)
    return filterSet.groupOperator === 'AND'
      ? groupResults.every(result => result)
      : groupResults.some(result => result);
  });
}

function evaluatePropertyCondition(property: PropertyData, condition: PropertyFilterCondition): boolean {
  const fieldValue = property[condition.field as keyof PropertyData];
  const filterValue = condition.value;

  // Handle null/undefined values
  if (fieldValue === null || fieldValue === undefined) {
    switch (condition.operator) {
      case 'exists':
        return false;
      case 'not_exists':
        return true;
      case 'is_empty':
        return true;
      case 'is_not_empty':
        return false;
      default:
        return false;
    }
  }

  // Convert to string for text operations
  const fieldStr = String(fieldValue).toLowerCase();
  const filterStr = String(filterValue).toLowerCase();

  switch (condition.operator) {
    case 'equals':
      return fieldValue === filterValue;
    case 'not_equals':
      return fieldValue !== filterValue;
    case 'contains':
      return fieldStr.includes(filterStr);
    case 'not_contains':
      return !fieldStr.includes(filterStr);
    case 'starts_with':
      return fieldStr.startsWith(filterStr);
    case 'ends_with':
      return fieldStr.endsWith(filterStr);
    case 'in':
      return Array.isArray(filterValue) && filterValue.includes(fieldValue);
    case 'not_in':
      return Array.isArray(filterValue) && !filterValue.includes(fieldValue);
    case 'exists':
      return fieldValue !== null && fieldValue !== undefined;
    case 'not_exists':
      return fieldValue === null || fieldValue === undefined;
    case 'is_empty':
      return fieldStr === '';
    case 'is_not_empty':
      return fieldStr !== '';
    case 'greater_than':
      return Number(fieldValue) > Number(filterValue);
    case 'less_than':
      return Number(fieldValue) < Number(filterValue);
    case 'greater_equal':
      return Number(fieldValue) >= Number(filterValue);
    case 'less_equal':
      return Number(fieldValue) <= Number(filterValue);
    default:
      return false;
  }
}

// ============================================================================
// Validation and Utilities
// ============================================================================

export function getOperatorsForDataType(dataType: PropertyFilterDataType): PropertyFilterOperator[] {
  switch (dataType) {
    case 'text':
      return ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'exists', 'not_exists', 'is_empty', 'is_not_empty'];
    case 'number':
      return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'exists', 'not_exists'];
    case 'select':
      return ['equals', 'not_equals', 'in', 'not_in', 'exists', 'not_exists'];
    case 'boolean':
      return ['equals', 'not_equals', 'exists', 'not_exists'];
    case 'date':
      return ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'exists', 'not_exists'];
    default:
      return ['equals', 'not_equals'];
  }
}

export function getOperatorLabel(operator: PropertyFilterOperator): string {
  const labels: Record<PropertyFilterOperator, string> = {
    equals: 'Equals',
    not_equals: 'Does not equal',
    contains: 'Contains',
    not_contains: 'Does not contain',
    starts_with: 'Starts with',
    ends_with: 'Ends with',
    in: 'Is one of',
    not_in: 'Is not one of',
    exists: 'Exists',
    not_exists: 'Does not exist',
    is_empty: 'Is empty',
    is_not_empty: 'Is not empty',
    greater_than: 'Greater than',
    less_than: 'Less than',
    greater_equal: 'Greater than or equal',
    less_equal: 'Less than or equal'
  };
  
  return labels[operator] || operator;
}