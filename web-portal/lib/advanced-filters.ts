/**
 * Advanced Filter System - Core Data Structures and Logic Engine
 * 
 * Implements ActiveCampaign-style nested filter groups where:
 * - Each group has consistent internal operator (all AND or all OR)
 * - Groups themselves are combined with consistent operator (all AND or all OR)
 * - Example: (X AND Y AND Z) OR (A AND B) OR (C OR D OR E)
 */

import { ResponseData } from '@/app/responses/page';

// ============================================================================
// Core Data Structures
// ============================================================================

export interface FilterCondition {
  id: string;
  field: keyof ResponseData;
  operator: FilterOperator;
  value: any;
  dataType: FilterDataType;
}

export interface FilterGroup {
  id: string;
  name?: string; // Optional name for saved filters
  conditions: FilterCondition[];
  internalOperator: 'AND' | 'OR'; // How conditions within this group are combined
}

export interface AdvancedFilterSet {
  id: string;
  name?: string; // Optional name for saved filter sets
  groups: FilterGroup[];
  groupOperator: 'AND' | 'OR'; // How groups are combined with each other
  createdAt?: Date;
  updatedAt?: Date;
}

export type FilterOperator = 
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
  | 'greater_than'
  | 'less_than'
  | 'greater_than_equal'
  | 'less_than_equal'
  | 'between'
  | 'is_empty'
  | 'is_not_empty';

export type FilterDataType = 'string' | 'number' | 'boolean' | 'array' | 'date';

// ============================================================================
// Field Definitions
// ============================================================================

export interface FilterField {
  key: keyof ResponseData;
  label: string;
  dataType: FilterDataType;
  availableOperators: FilterOperator[];
  options?: { value: string; label: string }[]; // For dropdown fields
  description?: string;
}

export const FILTER_FIELDS: FilterField[] = [
  // Basic Response Info
  {
    key: 'response_id',
    label: 'Response ID',
    dataType: 'string',
    availableOperators: ['equals', 'not_equals', 'contains', 'starts_with', 'ends_with', 'in', 'not_in'],
    description: 'Unique response identifier (e.g., "001", "002")'
  },
  {
    key: 'address',
    label: 'Address',
    dataType: 'string',
    availableOperators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty'],
    description: 'Property address'
  },
  {
    key: 'name',
    label: 'Name',
    dataType: 'string',
    availableOperators: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty'],
    description: 'Respondent name'
  },
  {
    key: 'email_contact',
    label: 'Contact Info',
    dataType: 'string',
    availableOperators: ['contains', 'not_contains', 'is_empty', 'is_not_empty'],
    description: 'Email, phone, or other contact information'
  },

  // Service Ratings & Preferences
  {
    key: 'q2_service_rating',
    label: 'Service Rating',
    dataType: 'string',
    availableOperators: ['equals', 'not_equals', 'in', 'not_in', 'exists', 'not_exists'],
    options: [
      { value: 'Excellent', label: 'Excellent' },
      { value: 'Good', label: 'Good' },
      { value: 'Fair', label: 'Fair' },
      { value: 'Poor', label: 'Poor' },
      { value: 'Very Poor', label: 'Very Poor' },
      { value: 'Not Specified', label: 'Not Specified' }
    ],
    description: 'Rating of current landscaping service'
  },
  {
    key: 'q1_preference',
    label: 'Landscaping Preference',
    dataType: 'string',
    availableOperators: ['equals', 'not_equals', 'contains', 'not_contains', 'in', 'not_in'],
    description: 'Preference for landscaping management'
  },

  // Issues & Problems
  {
    key: 'irrigation',
    label: 'Irrigation Issues',
    dataType: 'string',
    availableOperators: ['equals', 'not_equals'],
    options: [
      { value: 'Yes', label: 'Has irrigation issues' },
      { value: 'No', label: 'No irrigation issues' }
    ]
  },
  {
    key: 'poor_mowing',
    label: 'Poor Mowing Issues',
    dataType: 'string',
    availableOperators: ['equals', 'not_equals'],
    options: [
      { value: 'Yes', label: 'Has poor mowing issues' },
      { value: 'No', label: 'No poor mowing issues' }
    ]
  },
  {
    key: 'property_damage',
    label: 'Property Damage Issues',
    dataType: 'string',
    availableOperators: ['equals', 'not_equals'],
    options: [
      { value: 'Yes', label: 'Has property damage issues' },
      { value: 'No', label: 'No property damage issues' }
    ]
  },
  {
    key: 'missed_service',
    label: 'Missed Service Issues',
    dataType: 'string',
    availableOperators: ['equals', 'not_equals'],
    options: [
      { value: 'Yes', label: 'Has missed service issues' },
      { value: 'No', label: 'No missed service issues' }
    ]
  },
  {
    key: 'inadequate_weeds',
    label: 'Inadequate Weed Control',
    dataType: 'string',
    availableOperators: ['equals', 'not_equals'],
    options: [
      { value: 'Yes', label: 'Has weed control issues' },
      { value: 'No', label: 'No weed control issues' }
    ]
  },

  // Review System
  {
    key: 'review_status',
    label: 'Review Status',
    dataType: 'string',
    availableOperators: ['equals', 'not_equals', 'in', 'not_in'],
    options: [
      { value: 'unreviewed', label: 'Unreviewed' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'reviewed', label: 'Reviewed' },
      { value: 'flagged', label: 'Flagged' }
    ],
    description: 'Current review status of the response'
  },
  {
    key: 'reviewed_by',
    label: 'Reviewed By',
    dataType: 'string',
    availableOperators: ['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty'],
    description: 'Person who reviewed the response'
  },

  // Notes System
  {
    key: 'total_notes',
    label: 'Total Notes Count',
    dataType: 'number',
    availableOperators: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_equal', 'less_than_equal', 'between'],
    description: 'Number of notes attached to this response'
  },
  {
    key: 'critical_notes',
    label: 'Critical Notes Count',
    dataType: 'number',
    availableOperators: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_equal', 'less_than_equal'],
    description: 'Number of critical priority notes'
  },
  {
    key: 'follow_up_notes',
    label: 'Follow-up Notes Count',
    dataType: 'number',
    availableOperators: ['equals', 'not_equals', 'greater_than', 'less_than', 'greater_than_equal', 'less_than_equal'],
    description: 'Number of notes requiring follow-up'
  },

  // Anonymous & Opt-out
  {
    key: 'anonymous',
    label: 'Anonymous Response',
    dataType: 'string',
    availableOperators: ['equals', 'not_equals'],
    options: [
      { value: 'Yes', label: 'Anonymous' },
      { value: 'No', label: 'Not Anonymous' }
    ]
  },
  {
    key: 'q1_preference',
    label: 'Landscaping Preference (Opt-out)',
    dataType: 'string',
    availableOperators: ['equals', 'not_equals', 'contains', 'not_contains'],
    description: 'Check if preference contains opt-out language'
  }
];

// ============================================================================
// Filter Logic Engine
// ============================================================================

/**
 * Evaluates a single condition against a response
 */
export function evaluateCondition(condition: FilterCondition, response: ResponseData): boolean {
  const fieldValue = response[condition.field];
  const { operator, value } = condition;
  
  console.log(`Evaluating condition: ${condition.field} ${operator} ${value}`, {
    fieldValue,
    operator,
    value,
    responseId: response.response_id
  });

  // Handle null/undefined field values
  if (fieldValue === null || fieldValue === undefined) {
    switch (operator) {
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

  // Convert values for comparison
  const fieldStr = String(fieldValue).toLowerCase();
  const valueStr = String(value).toLowerCase();

  switch (operator) {
    case 'equals':
      return fieldValue === value;
    
    case 'not_equals':
      return fieldValue !== value;
    
    case 'contains':
      return fieldStr.includes(valueStr);
    
    case 'not_contains':
      return !fieldStr.includes(valueStr);
    
    case 'starts_with':
      return fieldStr.startsWith(valueStr);
    
    case 'ends_with':
      return fieldStr.endsWith(valueStr);
    
    case 'in':
      return Array.isArray(value) && value.includes(fieldValue);
    
    case 'not_in':
      return Array.isArray(value) && !value.includes(fieldValue);
    
    case 'exists':
      return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
    
    case 'not_exists':
      return fieldValue === null || fieldValue === undefined || fieldValue === '';
    
    case 'is_empty':
      return fieldValue === '' || fieldValue === null || fieldValue === undefined;
    
    case 'is_not_empty':
      return fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;
    
    case 'greater_than':
      return Number(fieldValue) > Number(value);
    
    case 'less_than':
      return Number(fieldValue) < Number(value);
    
    case 'greater_than_equal':
      return Number(fieldValue) >= Number(value);
    
    case 'less_than_equal':
      return Number(fieldValue) <= Number(value);
    
    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        const numField = Number(fieldValue);
        return numField >= Number(value[0]) && numField <= Number(value[1]);
      }
      return false;
    
    default:
      return false;
  }
}

/**
 * Evaluates a filter group against a response
 */
export function evaluateGroup(group: FilterGroup, response: ResponseData): boolean {
  if (group.conditions.length === 0) {
    console.log('Empty group - returning true');
    return true; // Empty group matches everything
  }

  const results = group.conditions.map(condition => evaluateCondition(condition, response));
  const finalResult = group.internalOperator === 'AND' 
    ? results.every(result => result)
    : results.some(result => result);
    
  console.log(`Group evaluation (${group.internalOperator}):`, {
    conditions: group.conditions.length,
    results,
    finalResult,
    responseId: response.response_id
  });

  return finalResult;
}

/**
 * Evaluates an entire filter set against a response
 */
export function evaluateFilterSet(filterSet: AdvancedFilterSet, response: ResponseData): boolean {
  if (filterSet.groups.length === 0) {
    console.log('Empty filter set - returning true');
    return true; // Empty filter set matches everything
  }

  const results = filterSet.groups.map(group => evaluateGroup(group, response));
  const finalResult = filterSet.groupOperator === 'AND'
    ? results.every(result => result)
    : results.some(result => result);
    
  console.log(`Filter set evaluation (${filterSet.groupOperator}):`, {
    groups: filterSet.groups.length,
    results,
    finalResult,
    responseId: response.response_id
  });

  return finalResult;
}

/**
 * Applies advanced filters to a list of responses
 */
export function applyAdvancedFilters(responses: ResponseData[], filterSet: AdvancedFilterSet): ResponseData[] {
  return responses.filter(response => evaluateFilterSet(filterSet, response));
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generates a unique ID for filter components
 */
export function generateFilterId(): string {
  return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Creates an empty filter condition
 */
export function createEmptyCondition(): FilterCondition {
  return {
    id: generateFilterId(),
    field: 'response_id',
    operator: 'contains',
    value: '',
    dataType: 'string'
  };
}

/**
 * Creates an empty filter group
 */
export function createEmptyGroup(): FilterGroup {
  return {
    id: generateFilterId(),
    conditions: [createEmptyCondition()],
    internalOperator: 'AND'
  };
}

/**
 * Creates an empty filter set
 */
export function createEmptyFilterSet(): AdvancedFilterSet {
  return {
    id: generateFilterId(),
    groups: [createEmptyGroup()],
    groupOperator: 'AND'
  };
}

/**
 * Validates a filter condition
 */
export function validateCondition(condition: FilterCondition): string[] {
  const errors: string[] = [];
  
  if (!condition.field) {
    errors.push('Field is required');
  }
  
  if (!condition.operator) {
    errors.push('Operator is required');
  }
  
  if (condition.value === null || condition.value === undefined || condition.value === '') {
    if (!['exists', 'not_exists', 'is_empty', 'is_not_empty'].includes(condition.operator)) {
      errors.push('Value is required for this operator');
    }
  }
  
  return errors;
}

/**
 * Validates a filter group
 */
export function validateGroup(group: FilterGroup): string[] {
  const errors: string[] = [];
  
  if (group.conditions.length === 0) {
    errors.push('Group must have at least one condition');
  }
  
  group.conditions.forEach((condition, index) => {
    const conditionErrors = validateCondition(condition);
    conditionErrors.forEach(error => {
      errors.push(`Condition ${index + 1}: ${error}`);
    });
  });
  
  return errors;
}

/**
 * Validates an entire filter set
 */
export function validateFilterSet(filterSet: AdvancedFilterSet): string[] {
  const errors: string[] = [];
  
  if (filterSet.groups.length === 0) {
    errors.push('Filter set must have at least one group');
  }
  
  filterSet.groups.forEach((group, index) => {
    const groupErrors = validateGroup(group);
    groupErrors.forEach(error => {
      errors.push(`Group ${index + 1}: ${error}`);
    });
  });
  
  return errors;
}

/**
 * Converts current simple filters to advanced filter format
 */
export function convertLegacyFilters(filters: {
  search: string;
  serviceRating: string;
  hasContact: string;
  anonymous: string;
  optOut: string;
  issues: string[];
  reviewStatus: string;
  hasNotes: string;
}): AdvancedFilterSet {
  const conditions: FilterCondition[] = [];
  
  // Search filter (searches multiple fields)
  if (filters.search.trim()) {
    // Create a group that searches across multiple fields with OR logic
    const searchGroup: FilterGroup = {
      id: generateFilterId(),
      internalOperator: 'OR',
      conditions: [
        {
          id: generateFilterId(),
          field: 'response_id',
          operator: 'contains',
          value: filters.search,
          dataType: 'string'
        },
        {
          id: generateFilterId(),
          field: 'address',
          operator: 'contains',
          value: filters.search,
          dataType: 'string'
        },
        {
          id: generateFilterId(),
          field: 'name',
          operator: 'contains',
          value: filters.search,
          dataType: 'string'
        }
      ]
    };
    
    // For now, we'll add search conditions to the main group
    conditions.push(...searchGroup.conditions);
  }
  
  // Service Rating
  if (filters.serviceRating) {
    conditions.push({
      id: generateFilterId(),
      field: 'q2_service_rating',
      operator: 'equals',
      value: filters.serviceRating,
      dataType: 'string'
    });
  }
  
  // Review Status
  if (filters.reviewStatus) {
    conditions.push({
      id: generateFilterId(),
      field: 'review_status',
      operator: 'equals',
      value: filters.reviewStatus,
      dataType: 'string'
    });
  }
  
  // Anonymous
  if (filters.anonymous) {
    conditions.push({
      id: generateFilterId(),
      field: 'anonymous',
      operator: 'equals',
      value: filters.anonymous === 'yes' ? 'Yes' : 'No',
      dataType: 'string'
    });
  }
  
  // Opt Out
  if (filters.optOut) {
    conditions.push({
      id: generateFilterId(),
      field: 'q1_preference',
      operator: filters.optOut === 'yes' ? 'contains' : 'not_contains',
      value: 'opt out',
      dataType: 'string'
    });
  }
  
  // Issues (convert to individual string conditions)
  if (filters.issues.length > 0) {
    filters.issues.forEach(issue => {
      let field: keyof ResponseData;
      switch (issue) {
        case 'Irrigation':
          field = 'irrigation';
          break;
        case 'Poor Mowing':
          field = 'poor_mowing';
          break;
        case 'Property Damage':
          field = 'property_damage';
          break;
        case 'Missed Service':
          field = 'missed_service';
          break;
        case 'Inadequate Weeds':
          field = 'inadequate_weeds';
          break;
        default:
          return;
      }
      
      conditions.push({
        id: generateFilterId(),
        field,
        operator: 'equals',
        value: 'Yes',
        dataType: 'string'
      });
    });
  }
  
  return {
    id: generateFilterId(),
    groups: conditions.length > 0 ? [{
      id: generateFilterId(),
      conditions,
      internalOperator: 'AND'
    }] : [],
    groupOperator: 'AND'
  };
}