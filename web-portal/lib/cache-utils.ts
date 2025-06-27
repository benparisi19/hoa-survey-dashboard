import { revalidatePath } from 'next/cache';

/**
 * Revalidate all survey-related cache paths
 * Call this after any survey data modification
 */
export function revalidateSurveyCache(surveyId?: string) {
  console.log(`🔄 Revalidating survey cache${surveyId ? ` for survey ${surveyId}` : ''}`);
  
  // Always revalidate the main surveys list and API
  revalidatePath('/surveys');
  revalidatePath('/api/surveys');
  
  // If a specific survey ID is provided, revalidate its pages
  if (surveyId) {
    revalidatePath(`/surveys/${surveyId}`);
    revalidatePath(`/surveys/${surveyId}/edit`);
    revalidatePath(`/api/surveys/${surveyId}`);
  }
  
  // Revalidate the layout to ensure navigation updates
  revalidatePath('/', 'layout');
}

/**
 * Force a hard refresh of all survey data
 * Useful for debugging or after external database changes
 */
export function revalidateAllSurveyData() {
  console.log('🔄 Hard refresh: Revalidating all survey data');
  revalidatePath('/surveys', 'page');
  revalidatePath('/api/surveys', 'page');
  revalidatePath('/', 'layout');
}