// People-specific filter definitions
export interface PeopleFilterCondition {
  id: string;
  field: keyof typeof PEOPLE_FILTER_FIELDS;
  operator: PeopleFilterOperator;
  value: any;
  dataType: PeopleFilterDataType;
}

export interface PeopleFilterGroup {
  id: string;
  conditions: PeopleFilterCondition[];
  operator: 'AND' | 'OR';
}

export type PeopleFilterOperator = 
  | 'equals' 
  | 'not_equals' 
  | 'contains' 
  | 'starts_with' 
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'is_true'
  | 'is_false'
  | 'is_empty'
  | 'is_not_empty';

export type PeopleFilterDataType = 'text' | 'number' | 'boolean' | 'select';

export const PEOPLE_FILTER_FIELDS = {
  first_name: {
    label: 'First Name',
    dataType: 'text' as PeopleFilterDataType,
    operators: ['equals', 'not_equals', 'contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  last_name: {
    label: 'Last Name',
    dataType: 'text' as PeopleFilterDataType,
    operators: ['equals', 'not_equals', 'contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  email: {
    label: 'Email',
    dataType: 'text' as PeopleFilterDataType,
    operators: ['equals', 'not_equals', 'contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  phone: {
    label: 'Phone',
    dataType: 'text' as PeopleFilterDataType,
    operators: ['equals', 'not_equals', 'contains', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty']
  },
  preferred_contact_method: {
    label: 'Contact Method',
    dataType: 'select' as PeopleFilterDataType,
    operators: ['equals', 'not_equals'],
    options: [
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'text', label: 'Text' },
      { value: 'mail', label: 'Mail' }
    ]
  },
  is_official_owner: {
    label: 'Official Owner',
    dataType: 'boolean' as PeopleFilterDataType,
    operators: ['is_true', 'is_false']
  },
  property_count: {
    label: 'Property Count',
    dataType: 'number' as PeopleFilterDataType,
    operators: ['equals', 'not_equals', 'greater_than', 'less_than']
  }
} as const;

export const PEOPLE_FILTER_OPERATORS: Record<PeopleFilterOperator, { label: string; requiresValue: boolean }> = {
  equals: { label: 'equals', requiresValue: true },
  not_equals: { label: 'does not equal', requiresValue: true },
  contains: { label: 'contains', requiresValue: true },
  starts_with: { label: 'starts with', requiresValue: true },
  ends_with: { label: 'ends with', requiresValue: true },
  greater_than: { label: 'is greater than', requiresValue: true },
  less_than: { label: 'is less than', requiresValue: true },
  is_true: { label: 'is true', requiresValue: false },
  is_false: { label: 'is false', requiresValue: false },
  is_empty: { label: 'is empty', requiresValue: false },
  is_not_empty: { label: 'is not empty', requiresValue: false }
};

// Apply filters to people data
export function applyPeopleFilters(
  people: any[],
  groups: PeopleFilterGroup[]
): any[] {
  if (!groups || groups.length === 0) return people;

  return people.filter(person => {
    // Each group is OR'd together
    return groups.some(group => {
      if (!group.conditions || group.conditions.length === 0) return true;
      
      // Within a group, conditions are AND'd or OR'd based on group operator
      const groupResults = group.conditions.map(condition => {
        return evaluatePeopleCondition(person, condition);
      });

      return group.operator === 'AND' 
        ? groupResults.every(result => result)
        : groupResults.some(result => result);
    });
  });
}

function evaluatePeopleCondition(person: any, condition: PeopleFilterCondition): boolean {
  const fieldValue = person[condition.field];
  const conditionValue = condition.value;
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === conditionValue;
    
    case 'not_equals':
      return fieldValue !== conditionValue;
    
    case 'contains':
      return fieldValue?.toString().toLowerCase().includes(conditionValue?.toString().toLowerCase());
    
    case 'starts_with':
      return fieldValue?.toString().toLowerCase().startsWith(conditionValue?.toString().toLowerCase());
    
    case 'ends_with':
      return fieldValue?.toString().toLowerCase().endsWith(conditionValue?.toString().toLowerCase());
    
    case 'greater_than':
      return Number(fieldValue) > Number(conditionValue);
    
    case 'less_than':
      return Number(fieldValue) < Number(conditionValue);
    
    case 'is_true':
      return fieldValue === true;
    
    case 'is_false':
      return fieldValue === false;
    
    case 'is_empty':
      return !fieldValue || fieldValue.toString().trim() === '';
    
    case 'is_not_empty':
      return fieldValue && fieldValue.toString().trim() !== '';
    
    default:
      return true;
  }
}