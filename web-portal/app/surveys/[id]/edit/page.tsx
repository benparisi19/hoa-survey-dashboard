'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { SurveyBuilder } from '@/components/SurveyBuilder/SurveyBuilder';
import { SurveyDefinition } from '@/types/survey-builder';
import AdminGate from '@/components/AdminGate';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SurveyEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [survey, setSurvey] = useState<SurveyDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSurvey() {
      try {
        const response = await fetch(`/api/surveys/${params.id}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('API error loading survey:', errorData);
          setError(`Failed to load survey: ${errorData.error || 'Unknown error'}`);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('Successfully loaded survey:', data.survey_name);
        
        // Normalize the survey data to match our types
        const normalizedSurvey = {
          ...data,
          // Ensure all required fields exist with defaults
          display_config: data.display_config || {
            theme: 'default',
            layout: 'sections',
            showProgress: true,
            allowSave: true,
            allowBack: true,
            showQuestionNumbers: true,
            submitButtonText: 'Submit Survey',
            thankYouMessage: 'Thank you for your response!'
          },
          targeting_config: data.targeting_config || {
            type: 'all_properties'
          },
          is_template: data.is_template ?? false,
          is_active: data.is_active ?? false,
          auto_recurring: data.auto_recurring ?? false,
          version: data.version ?? 1
        };

        // Fix legacy question format - move options to config.options if needed
        if (normalizedSurvey.response_schema?.sections) {
          normalizedSurvey.response_schema.sections.forEach((section: any) => {
            if (section.questions) {
              section.questions.forEach((question: any) => {
                // Fix legacy options format
                if (question.options && !question.config?.options) {
                  question.config = question.config || {};
                  question.config.options = question.options;
                  delete question.options;
                }
              });
            }
          });
        }

        setSurvey(normalizedSurvey as SurveyDefinition);
      } catch (err) {
        console.error('Unexpected error loading survey:', err);
        setError(`Failed to load survey: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    loadSurvey();
  }, [params.id]);

  const handleSave = async (surveyDefinition: Omit<SurveyDefinition, 'survey_definition_id' | 'created_at' | 'updated_at'>) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/surveys/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update survey: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('Survey updated successfully:', data);
      
      // Redirect to survey detail page
      router.push(`/surveys/${params.id}`);
    } catch (error: any) {
      console.error('Error saving survey:', error);
      setError(error.message || 'Failed to update survey');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    router.push(`/surveys/${params.id}`);
  };

  if (loading) {
    return (
      <AdminGate>
        <LoadingSpinner />
      </AdminGate>
    );
  }

  if (error) {
    return (
      <AdminGate>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-red-600 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Survey</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => router.push('/surveys')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Surveys
              </button>
            </div>
          </div>
        </div>
      </AdminGate>
    );
  }

  if (!survey) {
    notFound();
  }

  return (
    <AdminGate>
      {isUpdating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <LoadingSpinner />
            <span className="text-gray-900">Updating survey...</span>
          </div>
        </div>
      )}
      
      <SurveyBuilder
        editingSurvey={survey}
        onSave={handleSave}
        onCancel={handleCancel}
        isTemplate={survey.is_template || false}
      />
    </AdminGate>
  );
}