'use client';

import { SurveyDefinition } from '@/types/survey-builder';

interface SurveySettingsProps {
  definition: SurveyDefinition;
  onUpdate: (updates: Partial<SurveyDefinition>) => void;
  isTemplate?: boolean;
}

export function SurveySettings({ definition, onUpdate, isTemplate }: SurveySettingsProps) {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        {/* General Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Survey Type
              </label>
              <select
                value={definition.survey_type || 'property_specific'}
                onChange={(e) => onUpdate({ survey_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="property_specific">Property-Specific Survey</option>
                <option value="community_wide">Community-Wide Survey</option>
                <option value="demographic">Demographic Survey</option>
                <option value="feedback">Feedback Survey</option>
              </select>
            </div>

            {isTemplate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Category
                </label>
                <select
                  value={definition.template_category || 'general'}
                  onChange={(e) => onUpdate({ template_category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="satisfaction">Satisfaction</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="emergency">Emergency Preparedness</option>
                  <option value="amenities">Amenities</option>
                  <option value="community">Community Engagement</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Display Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout
              </label>
              <select
                value={definition.display_config?.layout || 'sections'}
                onChange={(e) => onUpdate({ 
                  display_config: { 
                    ...definition.display_config, 
                    layout: e.target.value as any 
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sections">Sections (Show all sections on one page)</option>
                <option value="single_page">Single Page (All questions visible)</option>
                <option value="question_by_question">Question by Question</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={definition.display_config?.theme || 'default'}
                onChange={(e) => onUpdate({ 
                  display_config: { 
                    ...definition.display_config, 
                    theme: e.target.value as any 
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="default">Default</option>
                <option value="community">Community</option>
                <option value="professional">Professional</option>
                <option value="modern">Modern</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={definition.display_config?.showProgress ?? true}
                  onChange={(e) => onUpdate({ 
                    display_config: { 
                      ...definition.display_config, 
                      showProgress: e.target.checked 
                    }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show progress bar</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={definition.display_config?.allowSave ?? true}
                  onChange={(e) => onUpdate({ 
                    display_config: { 
                      ...definition.display_config, 
                      allowSave: e.target.checked 
                    }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Allow save as draft</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={definition.display_config?.allowBack ?? true}
                  onChange={(e) => onUpdate({ 
                    display_config: { 
                      ...definition.display_config, 
                      allowBack: e.target.checked 
                    }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Allow back navigation</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={definition.display_config?.showQuestionNumbers ?? true}
                  onChange={(e) => onUpdate({ 
                    display_config: { 
                      ...definition.display_config, 
                      showQuestionNumbers: e.target.checked 
                    }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Show question numbers</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Submit Button Text
              </label>
              <input
                type="text"
                value={definition.display_config?.submitButtonText || 'Submit Survey'}
                onChange={(e) => onUpdate({ 
                  display_config: { 
                    ...definition.display_config, 
                    submitButtonText: e.target.value 
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thank You Message
              </label>
              <textarea
                value={definition.display_config?.thankYouMessage || 'Thank you for your response!'}
                onChange={(e) => onUpdate({ 
                  display_config: { 
                    ...definition.display_config, 
                    thankYouMessage: e.target.value 
                  }
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Targeting Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Survey Targeting</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <select
                value={definition.targeting_config?.type || 'all_properties'}
                onChange={(e) => onUpdate({ 
                  targeting_config: { 
                    ...definition.targeting_config, 
                    type: e.target.value as any 
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all_properties">All Properties</option>
                <option value="property_filter">Filtered Properties</option>
                <option value="manual_selection">Manual Selection</option>
              </select>
            </div>

            {definition.targeting_config?.type === 'property_filter' && (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600 mb-3">Property Filter Settings</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      HOA Zones (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Zone A, Zone B, Zone C"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Property Types (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Single Family, Townhouse, Condo"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule & Status</h3>
          <div className="space-y-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={definition.is_active ?? false}
                onChange={(e) => onUpdate({ is_active: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Survey is active and accepting responses</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={definition.active_period_start?.split('T')[0] || ''}
                  onChange={(e) => onUpdate({ 
                    active_period_start: e.target.value ? `${e.target.value}T00:00:00Z` : null 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={definition.active_period_end?.split('T')[0] || ''}
                  onChange={(e) => onUpdate({ 
                    active_period_end: e.target.value ? `${e.target.value}T23:59:59Z` : null 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {!isTemplate && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={definition.auto_recurring ?? false}
                  onChange={(e) => onUpdate({ auto_recurring: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Auto-recurring survey</span>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}