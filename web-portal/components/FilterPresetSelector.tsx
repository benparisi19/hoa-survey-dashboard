'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Filter, Star, Users, User, Trash2, Edit2, Clock } from 'lucide-react';
import { AdvancedFilterSet } from '@/lib/advanced-filters';
import { getFilterPresets, deleteFilterPreset, incrementPresetUsage } from '@/app/actions/filterPresets';
import type { FilterPresetWithUser } from '@/app/actions/filterPresets';
import { useAuth } from '@/lib/auth-context-v2';

interface FilterPresetSelectorProps {
  onLoad: (filterSet: AdvancedFilterSet) => void;
  onEdit?: (preset: FilterPresetWithUser) => void;
  currentPresetId?: string | null;
  className?: string;
}

export default function FilterPresetSelector({
  onLoad,
  onEdit,
  currentPresetId,
  className = ''
}: FilterPresetSelectorProps) {
  const { user } = useAuth();
  const [presets, setPresets] = useState<FilterPresetWithUser[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    setLoading(true);
    try {
      const { data, error } = await getFilterPresets();
      if (data && !error) {
        setPresets(data);
      }
    } catch (error) {
      console.error('Error loading presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (preset: FilterPresetWithUser) => {
    onLoad(preset.filter_data as AdvancedFilterSet);
    setIsOpen(false);
    
    // Increment usage count in the background
    incrementPresetUsage(preset.preset_id);
  };

  const handleDelete = async (presetId: string) => {
    if (deleteConfirm !== presetId) {
      setDeleteConfirm(presetId);
      // Auto-cancel delete confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      const { success, error } = await deleteFilterPreset(presetId);
      if (success) {
        await loadPresets();
      } else {
        console.error('Error deleting preset:', error);
      }
    } catch (error) {
      console.error('Error deleting preset:', error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Group presets by ownership
  const myPresets = presets.filter(p => p.user_id === user?.id);
  const sharedPresets = presets.filter(p => p.user_id !== user?.id && p.is_shared);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>Load Preset</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-hidden">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading presets...
              </div>
            ) : presets.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No saved presets yet</p>
                <p className="text-xs mt-1">Save your current filters to reuse them later</p>
              </div>
            ) : (
              <div className="overflow-y-auto max-h-96">
                {/* My Presets */}
                {myPresets.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center space-x-1 text-xs font-medium text-gray-600">
                        <User className="w-3 h-3" />
                        <span>My Presets</span>
                      </div>
                    </div>
                    {myPresets.map(preset => (
                      <PresetItem
                        key={preset.preset_id}
                        preset={preset}
                        isOwner={true}
                        isCurrent={currentPresetId === preset.preset_id}
                        onLoad={() => handleLoad(preset)}
                        onEdit={() => onEdit?.(preset)}
                        onDelete={() => handleDelete(preset.preset_id)}
                        deleteConfirm={deleteConfirm === preset.preset_id}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}

                {/* Shared Presets */}
                {sharedPresets.length > 0 && (
                  <div>
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center space-x-1 text-xs font-medium text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>Shared by Others</span>
                      </div>
                    </div>
                    {sharedPresets.map(preset => (
                      <PresetItem
                        key={preset.preset_id}
                        preset={preset}
                        isOwner={false}
                        isCurrent={currentPresetId === preset.preset_id}
                        onLoad={() => handleLoad(preset)}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface PresetItemProps {
  preset: FilterPresetWithUser;
  isOwner: boolean;
  isCurrent: boolean;
  onLoad: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleteConfirm?: boolean;
  formatDate: (date: string) => string;
}

function PresetItem({
  preset,
  isOwner,
  isCurrent,
  onLoad,
  onEdit,
  onDelete,
  deleteConfirm,
  formatDate
}: PresetItemProps) {
  return (
    <div
      className={`px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
        isCurrent ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <button
          onClick={onLoad}
          className="flex-1 text-left"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              {preset.preset_name}
            </span>
            {preset.is_default && (
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            )}
            {isCurrent && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                Active
              </span>
            )}
          </div>
          {preset.preset_description && (
            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
              {preset.preset_description}
            </p>
          )}
          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
            {!isOwner && preset.people && (
              <span>
                By {`${preset.people.first_name} ${preset.people.last_name}` || preset.people.email}
              </span>
            )}
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(preset.updated_at)}</span>
            </div>
            {preset.usage_count > 0 && (
              <span>Used {preset.usage_count}x</span>
            )}
          </div>
        </button>
        
        {isOwner && (
          <div className="flex items-center space-x-1 ml-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                title="Edit preset"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className={`p-1 rounded transition-colors ${
                  deleteConfirm
                    ? 'text-red-600 hover:text-red-700 hover:bg-red-100'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title={deleteConfirm ? 'Click again to confirm' : 'Delete preset'}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}