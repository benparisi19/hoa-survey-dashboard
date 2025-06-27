'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SurveyBuilder } from '@/components/SurveyBuilder/SurveyBuilder';
import { SurveyDefinition } from '@/types/survey-builder';
import { createServiceClient } from '@/lib/supabase';
import AdminGate from '@/components/AdminGate';

export default function SurveyBuilderPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async (surveyDefinition: Omit<SurveyDefinition, 'survey_definition_id' | 'created_at' | 'updated_at'>) => {
    setIsCreating(true);
    setError(null);
    setSuccess(null);
    
    try {
      const supabase = createServiceClient();
      
      const { data, error } = await supabase
        .from('survey_definitions')
        .insert({
          survey_name: surveyDefinition.survey_name,
          survey_type: surveyDefinition.survey_type,
          description: surveyDefinition.description,
          response_schema: surveyDefinition.response_schema,
          display_config: surveyDefinition.display_config,
          targeting_config: surveyDefinition.targeting_config,
          is_active: surveyDefinition.is_active,
          is_template: surveyDefinition.is_template,
          template_category: surveyDefinition.template_category,
          auto_recurring: surveyDefinition.auto_recurring,
          recurrence_config: surveyDefinition.recurrence_config,
          active_period_start: surveyDefinition.active_period_start,
          active_period_end: surveyDefinition.active_period_end,
          created_by: null // TODO: Get from auth context
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating survey:', error);
        throw new Error(`Failed to create survey: ${error.message}`);
      }

      console.log('Survey created successfully:', data);
      setSuccess('Survey created successfully!');
      
      // Redirect to survey list after a brief delay to show success message
      setTimeout(() => {
        router.push('/surveys');
      }, 1500);
    } catch (error: any) {
      console.error('Error saving survey:', error);
      setError(error.message || 'Failed to create survey. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    router.push('/surveys');
  };

  return (
    <AdminGate>
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">Creating survey...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex text-red-400 hover:text-red-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Success</h3>
                <p className="text-sm text-green-700 mt-1">{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <SurveyBuilder
        onSave={handleSave}
        onCancel={handleCancel}
        isTemplate={false}
      />
    </AdminGate>
  );
}