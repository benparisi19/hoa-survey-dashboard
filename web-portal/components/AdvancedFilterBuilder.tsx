'use client';

import { useState, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ChevronDown, 
  ChevronRight, 
  Filter,
  Save,
  Settings,
  AlertCircle,
  X
} from 'lucide-react';
import {
  AdvancedFilterSet,
  FilterGroup,
  FilterCondition,
  FilterField,
  FilterOperator,
  FILTER_FIELDS,
  createEmptyCondition,
  createEmptyGroup,
  createEmptyFilterSet,
  generateFilterId,
  validateFilterSet,
  validateGroup,
  validateCondition
} from '@/lib/advanced-filters';
import { ResponseData } from '@/app/responses/page';

interface AdvancedFilterBuilderProps {
  filterSet: AdvancedFilterSet;
  onChange: (filterSet: AdvancedFilterSet) => void;
  onApply: () => void;
  onSave?: (filterSet: AdvancedFilterSet) => void;
  onLoad?: () => void;
  className?: string;
}

interface ConditionEditorProps {
  condition: FilterCondition;
  onChange: (condition: FilterCondition) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isFirst: boolean;
  groupOperator: 'AND' | 'OR';
}

interface GroupEditorProps {
  group: FilterGroup;
  onChange: (group: FilterGroup) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isFirst: boolean;
  filterSetOperator: 'AND' | 'OR';
}

// ============================================================================
// Condition Editor Component
// ============================================================================

function ConditionEditor({ 
  condition, 
  onChange, 
  onDelete, 
  onDuplicate, 
  isFirst, 
  groupOperator 
}: ConditionEditorProps) {
  const field = FILTER_FIELDS.find(f => f.key === condition.field);
  const errors = validateCondition(condition);
  const hasErrors = errors.length > 0;

  const handleFieldChange = (fieldKey: string) => {
    const newField = FILTER_FIELDS.find(f => f.key === fieldKey);
    if (!newField) return;

    // Reset operator and value when field changes
    const defaultOperator = newField.availableOperators[0];
    onChange({
      ...condition,
      field: fieldKey as keyof ResponseData,
      operator: defaultOperator,
      dataType: newField.dataType,
      value: newField.dataType === 'boolean' ? false : ''
    });
  };

  const handleOperatorChange = (operator: FilterOperator) => {
    let newValue = condition.value;
    
    // Reset value for operators that don't need values
    if (['exists', 'not_exists', 'is_empty', 'is_not_empty'].includes(operator)) {
      newValue = null;
    }
    // Initialize array for 'in' operators
    else if (['in', 'not_in'].includes(operator) && !Array.isArray(condition.value)) {
      newValue = [];
    }
    // Initialize array for 'between' operator
    else if (operator === 'between' && !Array.isArray(condition.value)) {
      newValue = ['', ''];
    }

    onChange({
      ...condition,
      operator,
      value: newValue
    });
  };

  const renderValueInput = () => {
    const { operator, dataType } = condition;
    
    // No value needed for these operators
    if (['exists', 'not_exists', 'is_empty', 'is_not_empty'].includes(operator)) {
      return <div className="text-sm text-gray-500 italic">No value required</div>;
    }

    // Dropdown for fields with options
    if (field?.options && ['equals', 'not_equals'].includes(operator)) {
      return (
        <select
          value={condition.value || ''}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select value...</option>
          {field.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    // Multi-select for 'in' operators
    if (['in', 'not_in'].includes(operator) && field?.options) {
      const selectedValues = Array.isArray(condition.value) ? condition.value : [];
      
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">Select multiple values:</div>
          <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
            {field.options.map(option => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option.value]
                      : selectedValues.filter(v => v !== option.value);
                    onChange({ ...condition, value: newValues });
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }

    // Range input for 'between' operator
    if (operator === 'between') {
      const values = Array.isArray(condition.value) ? condition.value : ['', ''];
      return (
        <div className="flex items-center space-x-2">
          <input
            type={dataType === 'number' ? 'number' : 'text'}
            value={values[0] || ''}
            onChange={(e) => onChange({ 
              ...condition, 
              value: [e.target.value, values[1] || ''] 
            })}
            placeholder="Min"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="text-gray-500">to</span>
          <input
            type={dataType === 'number' ? 'number' : 'text'}
            value={values[1] || ''}
            onChange={(e) => onChange({ 
              ...condition, 
              value: [values[0] || '', e.target.value] 
            })}
            placeholder="Max"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      );
    }

    // Boolean dropdown
    if (dataType === 'boolean') {
      return (
        <select
          value={String(condition.value)}
          onChange={(e) => onChange({ ...condition, value: e.target.value === 'true' })}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      );
    }

    // Default text/number input
    return (
      <input
        type={dataType === 'number' ? 'number' : 'text'}
        value={condition.value || ''}
        onChange={(e) => onChange({ ...condition, value: e.target.value })}
        placeholder={`Enter ${field?.label.toLowerCase() || 'value'}...`}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    );
  };

  return (
    <div className={`p-4 border rounded-lg ${hasErrors ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
      {/* Condition Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {!isFirst && (
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              groupOperator === 'AND' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {groupOperator}
            </span>
          )}
          <span className="text-sm font-medium text-gray-700">Condition</span>
          {hasErrors && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onDuplicate}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            title="Duplicate condition"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded"
            title="Delete condition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Condition Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Field Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
          <select
            value={condition.field}
            onChange={(e) => handleFieldChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {FILTER_FIELDS.map(field => (
              <option key={field.key} value={field.key}>
                {field.label}
              </option>
            ))}
          </select>
          {field?.description && (
            <p className="mt-1 text-xs text-gray-500">{field.description}</p>
          )}
        </div>

        {/* Operator Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
          <select
            value={condition.operator}
            onChange={(e) => handleOperatorChange(e.target.value as FilterOperator)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {field?.availableOperators.map(op => (
              <option key={op} value={op}>
                {op.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Value Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
          {renderValueInput()}
        </div>
      </div>

      {/* Error Messages */}
      {hasErrors && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Group Editor Component
// ============================================================================

function GroupEditor({ 
  group, 
  onChange, 
  onDelete, 
  onDuplicate, 
  isFirst, 
  filterSetOperator 
}: GroupEditorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const errors = validateGroup(group);
  const hasErrors = errors.length > 0;

  const addCondition = () => {
    onChange({
      ...group,
      conditions: [...group.conditions, createEmptyCondition()]
    });
  };

  const updateCondition = (index: number, condition: FilterCondition) => {
    const newConditions = [...group.conditions];
    newConditions[index] = condition;
    onChange({ ...group, conditions: newConditions });
  };

  const deleteCondition = (index: number) => {
    if (group.conditions.length > 1) {
      const newConditions = group.conditions.filter((_, i) => i !== index);
      onChange({ ...group, conditions: newConditions });
    }
  };

  const duplicateCondition = (index: number) => {
    const originalCondition = group.conditions[index];
    const duplicatedCondition = {
      ...originalCondition,
      id: generateFilterId()
    };
    const newConditions = [...group.conditions];
    newConditions.splice(index + 1, 0, duplicatedCondition);
    onChange({ ...group, conditions: newConditions });
  };

  return (
    <div className={`border rounded-xl ${hasErrors ? 'border-red-300' : 'border-gray-300'} bg-gray-50`}>
      {/* Group Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {!isFirst && (
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                filterSetOperator === 'AND' 
                  ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                  : 'bg-green-100 text-green-800 border border-green-200'
              }`}>
                {filterSetOperator}
              </span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
              <span className="font-medium">
                Filter Group ({group.conditions.length} condition{group.conditions.length !== 1 ? 's' : ''})
              </span>
            </button>
            {hasErrors && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Internal Operator Toggle */}
            <div className="flex bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => onChange({ ...group, internalOperator: 'AND' })}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  group.internalOperator === 'AND'
                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                AND
              </button>
              <button
                onClick={() => onChange({ ...group, internalOperator: 'OR' })}
                className={`px-3 py-1 text-sm font-medium rounded ${
                  group.internalOperator === 'OR'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                OR
              </button>
            </div>
            {/* Group Actions */}
            <button
              onClick={onDuplicate}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg"
              title="Duplicate group"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg"
              title="Delete group"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Group Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {/* Conditions */}
          {group.conditions.map((condition, index) => (
            <ConditionEditor
              key={condition.id}
              condition={condition}
              onChange={(updatedCondition) => updateCondition(index, updatedCondition)}
              onDelete={() => deleteCondition(index)}
              onDuplicate={() => duplicateCondition(index)}
              isFirst={index === 0}
              groupOperator={group.internalOperator}
            />
          ))}

          {/* Add Condition Button */}
          <button
            onClick={addCondition}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-800 hover:border-gray-400 hover:bg-white transition-colors"
          >
            <Plus className="w-5 h-5 inline mr-2" />
            Add Condition
          </button>

          {/* Group Errors */}
          {hasErrors && (
            <div className="p-3 bg-red-100 border border-red-200 rounded-lg text-sm text-red-700">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Advanced Filter Builder Component
// ============================================================================

export default function AdvancedFilterBuilder({
  filterSet,
  onChange,
  onApply,
  onSave,
  onLoad,
  className = ''
}: AdvancedFilterBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const errors = validateFilterSet(filterSet);
  const hasErrors = errors.length > 0;

  const addGroup = useCallback(() => {
    onChange({
      ...filterSet,
      groups: [...filterSet.groups, createEmptyGroup()]
    });
  }, [filterSet, onChange]);

  const updateGroup = useCallback((index: number, group: FilterGroup) => {
    const newGroups = [...filterSet.groups];
    newGroups[index] = group;
    onChange({ ...filterSet, groups: newGroups });
  }, [filterSet, onChange]);

  const deleteGroup = useCallback((index: number) => {
    if (filterSet.groups.length > 1) {
      const newGroups = filterSet.groups.filter((_, i) => i !== index);
      onChange({ ...filterSet, groups: newGroups });
    }
  }, [filterSet, onChange]);

  const duplicateGroup = useCallback((index: number) => {
    const originalGroup = filterSet.groups[index];
    const duplicatedGroup = {
      ...originalGroup,
      id: generateFilterId(),
      conditions: originalGroup.conditions.map(condition => ({
        ...condition,
        id: generateFilterId()
      }))
    };
    const newGroups = [...filterSet.groups];
    newGroups.splice(index + 1, 0, duplicatedGroup);
    onChange({ ...filterSet, groups: newGroups });
  }, [filterSet, onChange]);

  const clearAll = useCallback(() => {
    onChange(createEmptyFilterSet());
  }, [onChange]);

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
            <Filter className="w-5 h-5" />
            <span className="font-medium">Advanced Filters</span>
            {hasErrors && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
          </button>
          <div className="flex items-center space-x-2">
            {/* Group Operator Toggle */}
            {filterSet.groups.length > 1 && (
              <div className="flex bg-gray-100 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => onChange({ ...filterSet, groupOperator: 'AND' })}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    filterSet.groupOperator === 'AND'
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  AND Groups
                </button>
                <button
                  onClick={() => onChange({ ...filterSet, groupOperator: 'OR' })}
                  className={`px-3 py-1 text-sm font-medium rounded ${
                    filterSet.groupOperator === 'OR'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  OR Groups
                </button>
              </div>
            )}
            {/* Action Buttons */}
            {onLoad && (
              <button
                onClick={onLoad}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-300"
              >
                <Settings className="w-4 h-4 inline mr-1" />
                Load
              </button>
            )}
            {onSave && (
              <button
                onClick={() => onSave(filterSet)}
                disabled={hasErrors}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg border border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 inline mr-1" />
                Save
              </button>
            )}
            <button
              onClick={clearAll}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-red-300"
            >
              <X className="w-4 h-4 inline mr-1" />
              Clear
            </button>
            <button
              onClick={onApply}
              disabled={hasErrors}
              className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Refresh View
            </button>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Filter Groups */}
          {filterSet.groups.map((group, index) => (
            <GroupEditor
              key={group.id}
              group={group}
              onChange={(updatedGroup) => updateGroup(index, updatedGroup)}
              onDelete={() => deleteGroup(index)}
              onDuplicate={() => duplicateGroup(index)}
              isFirst={index === 0}
              filterSetOperator={filterSet.groupOperator}
            />
          ))}

          {/* Add Group Button */}
          <button
            onClick={addGroup}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:text-gray-800 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-6 h-6 inline mr-2" />
            Add Filter Group
          </button>

          {/* Global Errors */}
          {hasErrors && (
            <div className="p-4 bg-red-100 border border-red-200 rounded-lg text-sm text-red-700">
              <div className="font-medium mb-2">Filter validation errors:</div>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}