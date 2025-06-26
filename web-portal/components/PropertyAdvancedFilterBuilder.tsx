'use client';

import { useState } from 'react';
import { Plus, Trash2, Settings2, X } from 'lucide-react';
import {
  PropertyAdvancedFilterSet,
  PropertyFilterGroup,
  PropertyFilterCondition,
  PropertyFilterOperator,
  PropertyFilterDataType,
  createEmptyPropertyFilterGroup,
  createEmptyPropertyFilterCondition,
  PROPERTY_FILTER_FIELDS,
  getOperatorsForDataType,
  getOperatorLabel
} from '@/lib/property-filters';

interface PropertyAdvancedFilterBuilderProps {
  filterSet: PropertyAdvancedFilterSet;
  onChange: (filterSet: PropertyAdvancedFilterSet) => void;
  onApply: () => void;
  className?: string;
}

interface PropertyConditionEditorProps {
  condition: PropertyFilterCondition;
  onChange: (condition: PropertyFilterCondition) => void;
  onRemove: () => void;
}

function PropertyConditionEditor({ condition, onChange, onRemove }: PropertyConditionEditorProps) {
  const fieldInfo = PROPERTY_FILTER_FIELDS[condition.field];
  const availableOperators = getOperatorsForDataType(fieldInfo.dataType);
  
  const handleFieldChange = (field: keyof typeof PROPERTY_FILTER_FIELDS) => {
    const newFieldInfo = PROPERTY_FILTER_FIELDS[field];
    const newOperators = getOperatorsForDataType(newFieldInfo.dataType);
    
    onChange({
      ...condition,
      field,
      dataType: newFieldInfo.dataType,
      operator: newOperators.includes(condition.operator) ? condition.operator : newOperators[0],
      value: ''
    });
  };

  const handleOperatorChange = (operator: PropertyFilterOperator) => {
    onChange({
      ...condition,
      operator,
      value: ['exists', 'not_exists', 'is_empty', 'is_not_empty'].includes(operator) ? null : condition.value
    });
  };

  const handleValueChange = (value: any) => {
    onChange({
      ...condition,
      value
    });
  };

  const needsValue = !['exists', 'not_exists', 'is_empty', 'is_not_empty'].includes(condition.operator);

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg">
      {/* Field Selection */}
      <select
        value={condition.field}
        onChange={(e) => handleFieldChange(e.target.value as keyof typeof PROPERTY_FILTER_FIELDS)}
        className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {Object.entries(PROPERTY_FILTER_FIELDS).map(([key, info]) => (
          <option key={key} value={key}>
            {info.label}
          </option>
        ))}
      </select>

      {/* Operator Selection */}
      <select
        value={condition.operator}
        onChange={(e) => handleOperatorChange(e.target.value as PropertyFilterOperator)}
        className="px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {availableOperators.map(operator => (
          <option key={operator} value={operator}>
            {getOperatorLabel(operator)}
          </option>
        ))}
      </select>

      {/* Value Input */}
      {needsValue && (
        <div className="flex-1 min-w-[200px]">
          {fieldInfo.dataType === 'select' && 'options' in fieldInfo ? (
            <select
              value={condition.value || ''}
              onChange={(e) => handleValueChange(e.target.value)}
              className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select value...</option>
              {'options' in fieldInfo && fieldInfo.options.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : fieldInfo.dataType === 'number' ? (
            <input
              type="number"
              value={condition.value || ''}
              onChange={(e) => handleValueChange(e.target.value ? Number(e.target.value) : '')}
              placeholder="Enter number..."
              className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <input
              type="text"
              value={condition.value || ''}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Enter value..."
              className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          )}
        </div>
      )}

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
        title="Remove condition"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function PropertyAdvancedFilterBuilder({ 
  filterSet, 
  onChange, 
  onApply,
  className = ''
}: PropertyAdvancedFilterBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const addGroup = () => {
    const newGroup = createEmptyPropertyFilterGroup();
    newGroup.conditions = [createEmptyPropertyFilterCondition()];
    
    onChange({
      ...filterSet,
      groups: [...filterSet.groups, newGroup]
    });
  };

  const updateGroup = (groupIndex: number, updatedGroup: PropertyFilterGroup) => {
    const newGroups = [...filterSet.groups];
    newGroups[groupIndex] = updatedGroup;
    
    onChange({
      ...filterSet,
      groups: newGroups
    });
  };

  const removeGroup = (groupIndex: number) => {
    onChange({
      ...filterSet,
      groups: filterSet.groups.filter((_, index) => index !== groupIndex)
    });
  };

  const addCondition = (groupIndex: number) => {
    const newCondition = createEmptyPropertyFilterCondition();
    const updatedGroup = {
      ...filterSet.groups[groupIndex],
      conditions: [...filterSet.groups[groupIndex].conditions, newCondition]
    };
    updateGroup(groupIndex, updatedGroup);
  };

  const updateCondition = (groupIndex: number, conditionIndex: number, updatedCondition: PropertyFilterCondition) => {
    const updatedGroup = {
      ...filterSet.groups[groupIndex],
      conditions: filterSet.groups[groupIndex].conditions.map((condition, index) =>
        index === conditionIndex ? updatedCondition : condition
      )
    };
    updateGroup(groupIndex, updatedGroup);
  };

  const removeCondition = (groupIndex: number, conditionIndex: number) => {
    const updatedGroup = {
      ...filterSet.groups[groupIndex],
      conditions: filterSet.groups[groupIndex].conditions.filter((_, index) => index !== conditionIndex)
    };
    
    // Remove the group if it has no conditions left
    if (updatedGroup.conditions.length === 0) {
      removeGroup(groupIndex);
    } else {
      updateGroup(groupIndex, updatedGroup);
    }
  };

  const toggleGroupOperator = (groupIndex: number) => {
    const updatedGroup = {
      ...filterSet.groups[groupIndex],
      internalOperator: filterSet.groups[groupIndex].internalOperator === 'AND' ? 'OR' as const : 'AND' as const
    };
    updateGroup(groupIndex, updatedGroup);
  };

  const toggleSetOperator = () => {
    onChange({
      ...filterSet,
      groupOperator: filterSet.groupOperator === 'AND' ? 'OR' : 'AND'
    });
  };

  if (!isExpanded) {
    return (
      <div className={`border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-100"
        >
          <span className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="font-medium">Property Advanced Filters</span>
            {filterSet.groups.length > 0 && (
              <span className="text-sm text-gray-600">
                ({filterSet.groups.length} group{filterSet.groups.length !== 1 ? 's' : ''})
              </span>
            )}
          </span>
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">Property Advanced Filters</h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {filterSet.groups.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">No filter groups created yet</div>
            <button
              onClick={addGroup}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Filter Group
            </button>
          </div>
        ) : (
          <>
            {/* Groups */}
            {filterSet.groups.map((group, groupIndex) => (
              <div key={group.id}>
                {/* Group Operator (between groups) */}
                {groupIndex > 0 && (
                  <div className="flex justify-center py-2">
                    <button
                      onClick={toggleSetOperator}
                      className="px-3 py-1 text-sm font-medium bg-white border border-gray-300 rounded hover:bg-gray-50"
                    >
                      {filterSet.groupOperator}
                    </button>
                  </div>
                )}

                {/* Group */}
                <div className="bg-white border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        Group {groupIndex + 1}
                      </span>
                      {group.conditions.length > 1 && (
                        <button
                          onClick={() => toggleGroupOperator(groupIndex)}
                          className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          {group.internalOperator}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => removeGroup(groupIndex)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      title="Remove group"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Conditions */}
                  <div className="space-y-2">
                    {group.conditions.map((condition, conditionIndex) => (
                      <div key={condition.id}>
                        {/* Condition Operator (between conditions) */}
                        {conditionIndex > 0 && (
                          <div className="flex justify-center py-1">
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                              {group.internalOperator}
                            </span>
                          </div>
                        )}
                        
                        <PropertyConditionEditor
                          condition={condition}
                          onChange={(updatedCondition) => updateCondition(groupIndex, conditionIndex, updatedCondition)}
                          onRemove={() => removeCondition(groupIndex, conditionIndex)}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Add Condition Button */}
                  <button
                    onClick={() => addCondition(groupIndex)}
                    className="mt-3 inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                  >
                    <Plus className="h-3 w-3" />
                    Add Condition
                  </button>
                </div>
              </div>
            ))}

            {/* Add Group Button */}
            <div className="flex justify-center">
              <button
                onClick={addGroup}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Group
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}