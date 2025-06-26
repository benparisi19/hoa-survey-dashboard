'use client';

import { useState } from 'react';
import { X, Save, Info } from 'lucide-react';
import { AdvancedFilterSet } from '@/lib/advanced-filters';
import { saveFilterPreset, updateFilterPreset } from '@/app/actions/filterPresets';

interface FilterPresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterSet: AdvancedFilterSet;
  existingPreset?: {
    preset_id: string;
    preset_name: string;
    preset_description: string | null;
    is_shared: boolean;
    is_default: boolean;
  } | null;
  onSuccess?: () => void;
}

export default function FilterPresetModal({
  isOpen,
  onClose,
  filterSet,
  existingPreset,
  onSuccess
}: FilterPresetModalProps) {
  const [name, setName] = useState(existingPreset?.preset_name || '');
  const [description, setDescription] = useState(existingPreset?.preset_description || '');
  const [isShared, setIsShared] = useState(existingPreset?.is_shared || false);
  const [isDefault, setIsDefault] = useState(existingPreset?.is_default || false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for this filter preset');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (existingPreset) {
        // Update existing preset
        const { error } = await updateFilterPreset(existingPreset.preset_id, {
          preset_name: name.trim(),
          preset_description: description.trim() || null,
          filter_data: filterSet,
          is_shared: isShared,
          is_default: isDefault
        });

        if (error) {
          setError(error);
        } else {
          onSuccess?.();
          onClose();
        }
      } else {
        // Create new preset
        const { error } = await saveFilterPreset(
          name.trim(),
          description.trim() || null,
          filterSet,
          isShared,
          isDefault
        );

        if (error) {
          setError(error);
        } else {
          onSuccess?.();
          onClose();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {existingPreset ? 'Update Filter Preset' : 'Save Filter Preset'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Name Input */}
          <div>
            <label htmlFor="preset-name" className="block text-sm font-medium text-gray-700 mb-1">
              Preset Name <span className="text-red-500">*</span>
            </label>
            <input
              id="preset-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Active Issues, Recent Responses"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="preset-description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="preset-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this filter shows..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={500}
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            {/* Share with other admins */}
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Share with other admins
                </div>
                <div className="text-xs text-gray-500">
                  Other administrators will be able to use this filter preset
                </div>
              </div>
            </label>

            {/* Set as default */}
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="text-sm font-medium text-gray-700">
                  Set as my default filter
                </div>
                <div className="text-xs text-gray-500">
                  This filter will be applied automatically when you visit the responses page
                </div>
              </div>
            </label>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">
              Filter presets save your exact filter configuration including all groups, 
              conditions, and operators. They're private by default unless you choose to share them.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : (existingPreset ? 'Update' : 'Save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}