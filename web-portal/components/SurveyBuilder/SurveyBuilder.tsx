'use client';

import { useState, useCallback, useEffect } from 'react';
import { 
  Plus, 
  Save, 
  Eye, 
  Settings, 
  FileText, 
  ArrowLeft,
  Loader2
} from 'lucide-react';
// Using direct Tailwind styling like the rest of the codebase
import { 
  SurveyDefinition, 
  SurveySchema, 
  SurveySection,
  SurveyBuilderState,
  SurveyDisplayConfig,
  SurveyTargetingConfig,
  ValidationError
} from '@/types/survey-builder';
import { SurveyBuilderSidebar } from './SurveyBuilderSidebar';
import { SurveyBuilderCanvas } from './SurveyBuilderCanvas';
import { SurveyBuilderPreview } from './SurveyBuilderPreview';
import { SurveySettings } from './SurveySettings';

interface SurveyBuilderProps {
  editingSurvey?: Partial<SurveyDefinition>;
  onSave: (surveyDefinition: Omit<SurveyDefinition, 'survey_definition_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onCancel: () => void;
  isTemplate?: boolean;
}

export function SurveyBuilder({ 
  editingSurvey, 
  onSave, 
  onCancel,
  isTemplate = false 
}: SurveyBuilderProps) {
  const [currentView, setCurrentView] = useState<'builder' | 'preview' | 'settings'>('builder');
  const [isSaving, setIsSaving] = useState(false);
  
  // Initialize survey state
  const [surveyState, setSurveyState] = useState<SurveyBuilderState>(() => {
    const defaultSchema: SurveySchema = {
      sections: [
        {
          id: 'section_1',
          title: 'Section 1',
          questions: []
        }
      ]
    };

    const defaultDisplayConfig: SurveyDisplayConfig = {
      theme: 'default',
      layout: 'sections',
      showProgress: true,
      allowSave: true,
      allowBack: true,
      showQuestionNumbers: true,
      submitButtonText: 'Submit Survey',
      thankYouMessage: 'Thank you for your response!'
    };

    const defaultTargetingConfig: SurveyTargetingConfig = {
      type: 'all_properties'
    };

    return {
      definition: {
        survey_name: editingSurvey?.survey_name || 'Untitled Survey',
        survey_type: editingSurvey?.survey_type || 'property_specific',
        description: editingSurvey?.description || '',
        response_schema: editingSurvey?.response_schema || defaultSchema,
        display_config: editingSurvey?.display_config || defaultDisplayConfig,
        targeting_config: editingSurvey?.targeting_config || defaultTargetingConfig,
        is_active: editingSurvey?.is_active ?? false,
        is_template: isTemplate,
        template_category: editingSurvey?.template_category || (isTemplate ? 'general' : null),
        auto_recurring: editingSurvey?.auto_recurring ?? false,
        recurrence_config: editingSurvey?.recurrence_config || null,
        ...editingSurvey
      },
      currentSection: 0,
      currentQuestion: -1,
      isDirty: false,
      errors: []
    };
  });

  // Mark as dirty when survey changes
  const updateSurvey = useCallback((updates: Partial<SurveyDefinition>) => {
    setSurveyState(prev => ({
      ...prev,
      definition: { ...prev.definition, ...updates },
      isDirty: true
    }));
  }, []);

  // Update survey schema
  const updateSchema = useCallback((schema: SurveySchema) => {
    updateSurvey({ response_schema: schema });
  }, [updateSurvey]);

  // Add new section
  const addSection = useCallback(() => {
    const currentSchema = surveyState.definition.response_schema as SurveySchema;
    const newSection: SurveySection = {
      id: `section_${Date.now()}`,
      title: `Section ${currentSchema.sections.length + 1}`,
      questions: []
    };

    const updatedSchema: SurveySchema = {
      ...currentSchema,
      sections: [...currentSchema.sections, newSection]
    };

    updateSchema(updatedSchema);
    setSurveyState(prev => ({
      ...prev,
      currentSection: currentSchema.sections.length
    }));
  }, [surveyState.definition.response_schema, updateSchema]);

  // Validate survey before saving
  const validateSurvey = useCallback(() => {
    const errors: ValidationError[] = [];
    const definition = surveyState.definition;

    if (!definition.survey_name?.trim()) {
      errors.push({ field: 'survey_name', message: 'Survey name is required' });
    }

    if (!definition.response_schema) {
      errors.push({ field: 'response_schema', message: 'Survey must have at least one section' });
    } else {
      const schema = definition.response_schema as SurveySchema;
      if (schema.sections.length === 0) {
        errors.push({ field: 'sections', message: 'Survey must have at least one section' });
      }

      schema.sections.forEach((section, sectionIndex) => {
        if (!section.title?.trim()) {
          errors.push({ 
            field: 'section_title', 
            message: `Section ${sectionIndex + 1} must have a title`,
            section: section.id
          });
        }

        if (section.questions.length === 0) {
          errors.push({ 
            field: 'section_questions', 
            message: `Section "${section.title}" must have at least one question`,
            section: section.id
          });
        }

        section.questions.forEach((question, questionIndex) => {
          if (!question.text?.trim()) {
            errors.push({ 
              field: 'question_text', 
              message: `Question ${questionIndex + 1} in "${section.title}" must have text`,
              section: section.id,
              question: question.id
            });
          }
        });
      });
    }

    setSurveyState(prev => ({ ...prev, errors }));
    return errors.length === 0;
  }, [surveyState.definition]);

  // Save survey
  const handleSave = useCallback(async () => {
    if (!validateSurvey()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(surveyState.definition as Omit<SurveyDefinition, 'survey_definition_id' | 'created_at' | 'updated_at'>);
      setSurveyState(prev => ({ ...prev, isDirty: false }));
    } catch (error) {
      console.error('Error saving survey:', error);
      // Handle error - could add toast notification here
    } finally {
      setIsSaving(false);
    }
  }, [surveyState.definition, validateSurvey, onSave]);

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (surveyState.isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [surveyState.isDirty]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={onCancel}
              className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <input
                  type="text"
                  value={surveyState.definition.survey_name || ''}
                  onChange={(e) => updateSurvey({ survey_name: e.target.value })}
                  className="text-lg font-semibold border-none p-0 h-auto focus:outline-none w-full"
                  placeholder="Untitled Survey"
                />
                <textarea
                  value={surveyState.definition.description || ''}
                  onChange={(e) => updateSurvey({ description: e.target.value })}
                  placeholder="Add a description for your survey..."
                  className="text-sm text-gray-600 border-none p-0 h-auto resize-none focus:outline-none mt-1 w-full"
                  rows={1}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('builder')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  currentView === 'builder' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Build
              </button>
              <button
                onClick={() => setCurrentView('preview')}
                className={`inline-flex items-center px-3 py-1 text-xs rounded-md transition-colors ${
                  currentView === 'preview' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className={`inline-flex items-center px-3 py-1 text-xs rounded-md transition-colors ${
                  currentView === 'settings' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || !surveyState.isDirty}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        {currentView === 'builder' && (
          <div className="flex">
            {/* Sidebar */}
            <SurveyBuilderSidebar
              onAddSection={addSection}
              currentSection={surveyState.currentSection}
              schema={surveyState.definition.response_schema as SurveySchema}
              onSectionSelect={(index) => setSurveyState(prev => ({ ...prev, currentSection: index }))}
            />

            {/* Main Canvas */}
            <SurveyBuilderCanvas
              schema={surveyState.definition.response_schema as SurveySchema}
              onSchemaChange={updateSchema}
              currentSection={surveyState.currentSection}
              currentQuestion={surveyState.currentQuestion}
              onQuestionSelect={(questionIndex) => setSurveyState(prev => ({ ...prev, currentQuestion: questionIndex }))}
              errors={surveyState.errors}
            />
          </div>
        )}

        {currentView === 'preview' && (
          <SurveyBuilderPreview
            definition={surveyState.definition as SurveyDefinition}
            onBackToBuilder={() => setCurrentView('builder')}
          />
        )}

        {currentView === 'settings' && (
          <SurveySettings
            definition={surveyState.definition as SurveyDefinition}
            onUpdate={updateSurvey}
            isTemplate={isTemplate}
          />
        )}
      </div>

      {/* Status Bar */}
      {surveyState.errors.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-50 border-t border-red-200 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <div className="text-sm text-red-800">
              {surveyState.errors.length} error{surveyState.errors.length !== 1 ? 's' : ''} found. 
              Please fix them before saving.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}