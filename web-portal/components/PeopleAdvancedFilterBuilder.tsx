'use client';

import { useState } from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  PeopleFilterCondition, 
  PeopleFilterGroup, 
  PEOPLE_FILTER_FIELDS, 
  PEOPLE_FILTER_OPERATORS,
  PeopleFilterOperator
} from '@/lib/people-filters';

interface PeopleAdvancedFilterBuilderProps {
  filterGroups: PeopleFilterGroup[];
  onFilterChange: (groups: PeopleFilterGroup[]) => void;
}

export default function PeopleAdvancedFilterBuilder({ 
  filterGroups, 
  onFilterChange 
}: PeopleAdvancedFilterBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const addGroup = () => {
    const newGroup: PeopleFilterGroup = {
      id: crypto.randomUUID(),
      conditions: [],
      operator: 'AND'
    };
    onFilterChange([...filterGroups, newGroup]);
  };

  const removeGroup = (groupId: string) => {
    onFilterChange(filterGroups.filter(g => g.id !== groupId));
  };

  const updateGroup = (groupId: string, updates: Partial<PeopleFilterGroup>) => {
    onFilterChange(filterGroups.map(g => 
      g.id === groupId ? { ...g, ...updates } : g
    ));
  };

  const addCondition = (groupId: string) => {
    const group = filterGroups.find(g => g.id === groupId);
    if (!group) return;

    const firstField = Object.keys(PEOPLE_FILTER_FIELDS)[0] as keyof typeof PEOPLE_FILTER_FIELDS;
    const newCondition: PeopleFilterCondition = {
      id: crypto.randomUUID(),
      field: firstField,
      operator: PEOPLE_FILTER_FIELDS[firstField].operators[0] as PeopleFilterOperator,
      value: '',
      dataType: PEOPLE_FILTER_FIELDS[firstField].dataType
    };

    updateGroup(groupId, {
      conditions: [...group.conditions, newCondition]
    });
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    const group = filterGroups.find(g => g.id === groupId);
    if (!group) return;

    updateGroup(groupId, {
      conditions: group.conditions.filter(c => c.id !== conditionId)
    });
  };

  const updateCondition = (
    groupId: string, 
    conditionId: string, 
    updates: Partial<PeopleFilterCondition>
  ) => {
    const group = filterGroups.find(g => g.id === groupId);
    if (!group) return;

    updateGroup(groupId, {
      conditions: group.conditions.map(c => 
        c.id === conditionId ? { ...c, ...updates } : c
      )
    });
  };

  const clearAllFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span>Advanced Filters</span>
            {filterGroups.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                {filterGroups.reduce((acc, g) => acc + g.conditions.length, 0)} active
              </span>
            )}
          </button>
          
          {isExpanded && filterGroups.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {filterGroups.map((group, groupIndex) => (
            <div key={group.id} className="space-y-3">
              {groupIndex > 0 && (
                <div className="flex items-center justify-center text-xs text-gray-500 uppercase">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-3">OR</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <select
                    value={group.operator}
                    onChange={(e) => updateGroup(group.id, { operator: e.target.value as 'AND' | 'OR' })}
                    className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="AND">All conditions must match</option>
                    <option value="OR">Any condition must match</option>
                  </select>
                  
                  <button
                    onClick={() => removeGroup(group.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {group.conditions.map((condition, conditionIndex) => (
                  <div key={condition.id} className="flex items-start space-x-2">
                    {conditionIndex > 0 && (
                      <span className="text-xs text-gray-500 mt-2">
                        {group.operator}
                      </span>
                    )}

                    <select
                      value={condition.field}
                      onChange={(e) => {
                        const field = e.target.value as keyof typeof PEOPLE_FILTER_FIELDS;
                        const fieldInfo = PEOPLE_FILTER_FIELDS[field];
                        updateCondition(group.id, condition.id, {
                          field,
                          dataType: fieldInfo.dataType,
                          operator: fieldInfo.operators[0] as PeopleFilterOperator,
                          value: ''
                        });
                      }}
                      className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      {Object.entries(PEOPLE_FILTER_FIELDS).map(([field, info]) => (
                        <option key={field} value={field}>{info.label}</option>
                      ))}
                    </select>

                    <select
                      value={condition.operator}
                      onChange={(e) => updateCondition(group.id, condition.id, {
                        operator: e.target.value as PeopleFilterOperator
                      })}
                      className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      {PEOPLE_FILTER_FIELDS[condition.field].operators.map(op => (
                        <option key={op} value={op}>
                          {PEOPLE_FILTER_OPERATORS[op as PeopleFilterOperator].label}
                        </option>
                      ))}
                    </select>

                    {PEOPLE_FILTER_OPERATORS[condition.operator].requiresValue && (
                      <>
                        {condition.dataType === 'select' && 'options' in PEOPLE_FILTER_FIELDS[condition.field] ? (
                          <select
                            value={condition.value || ''}
                            onChange={(e) => updateCondition(group.id, condition.id, {
                              value: e.target.value
                            })}
                            className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          >
                            <option value="">Select...</option>
                            {(PEOPLE_FILTER_FIELDS[condition.field] as any).options?.map((option: any) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : condition.dataType === 'number' ? (
                          <input
                            type="number"
                            value={condition.value || ''}
                            onChange={(e) => updateCondition(group.id, condition.id, {
                              value: e.target.value
                            })}
                            placeholder="Value"
                            className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          />
                        ) : (
                          <input
                            type="text"
                            value={condition.value || ''}
                            onChange={(e) => updateCondition(group.id, condition.id, {
                              value: e.target.value
                            })}
                            placeholder="Value"
                            className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          />
                        )}
                      </>
                    )}

                    <button
                      onClick={() => removeCondition(group.id, condition.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addCondition(group.id)}
                  className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add condition
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={addGroup}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add filter group
          </button>
        </div>
      )}
    </div>
  );
}