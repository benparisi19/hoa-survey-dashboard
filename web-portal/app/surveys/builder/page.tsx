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

  const handleSave = async (surveyDefinition: Omit<SurveyDefinition, 'survey_definition_id' | 'created_at' | 'updated_at'>) => {
    setIsCreating(true);
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
        throw new Error('Failed to create survey');
      }

      console.log('Survey created successfully:', data);
      
      // Redirect to survey list or edit page
      router.push('/surveys');
    } catch (error) {
      console.error('Error saving survey:', error);
      // TODO: Show error toast
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    router.push('/surveys');
  };

  return (
    <AdminGate>
      <SurveyBuilder
        onSave={handleSave}
        onCancel={handleCancel}
        isTemplate={false}
      />
    </AdminGate>
  );
}