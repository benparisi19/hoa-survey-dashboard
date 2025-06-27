'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { SurveyBuilder } from '@/components/SurveyBuilder/SurveyBuilder';
import { SurveyDefinition } from '@/types/survey-builder';
import { createServiceClient } from '@/lib/supabase';
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
        const supabase = createServiceClient();
        
        const { data, error } = await supabase
          .from('survey_definitions')
          .select('*')
          .eq('survey_definition_id', params.id)
          .single();

        if (error || !data) {
          notFound();
          return;
        }

        setSurvey(data as SurveyDefinition);
      } catch (err) {
        console.error('Error loading survey:', err);
        setError('Failed to load survey');
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
      const supabase = createServiceClient();
      
      const { data, error } = await supabase
        .from('survey_definitions')
        .update({
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
          updated_at: new Date().toISOString()
        })
        .eq('survey_definition_id', params.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating survey:', error);
        throw new Error(`Failed to update survey: ${error.message}`);
      }

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