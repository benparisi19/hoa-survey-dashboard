import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, FileText, Edit, Eye } from 'lucide-react';
import AdminGate from '@/components/AdminGate';
import LoadingSpinner from '@/components/LoadingSpinner';

export const dynamic = 'force-dynamic';

async function getSurveysData() {
  try {
    console.log('🔍 getSurveysData starting...');
    
    // Use the same pattern as properties page - await import
    const { createServiceClient } = await import('@/lib/supabase');
    console.log('✅ createServiceClient imported');
    
    const supabase = createServiceClient();
    console.log('✅ Supabase client created');
    
    const { data: surveys, error } = await supabase
      .from('survey_definitions')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('🎯 Query result:', { error: error?.message, count: surveys?.length });

    if (error) {
      console.error('❌ Error fetching surveys:', error);
      return [];
    }

    console.log(`✅ Successfully fetched ${surveys?.length || 0} surveys`);
    console.log('📋 Survey names:', surveys?.map(s => s.survey_name));
    
    return surveys || [];
  } catch (error) {
    console.error('💥 Failed to fetch surveys:', error);
    return [];
  }
}

async function SurveysContent() {
  const surveys = await getSurveysData();
  
  console.log('🔥 SurveysContent rendering with', surveys.length, 'surveys');

  return (
    <div className="space-y-6">
      {/* Debug Info - Always Show */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
        <div><strong>🔍 Debug Info:</strong></div>
        <div>• Total surveys fetched: {surveys.length}</div>
        <div>• Environment: {process.env.NODE_ENV}</div>
        <div>• Has service key: {!!process.env.SUPABASE_SERVICE_KEY}</div>
        <div>• Survey names: {surveys.map((s: any) => s.survey_name).join(', ') || 'None'}</div>
        {surveys.length > 0 && (
          <div>• Sample survey: {JSON.stringify({
            name: surveys[0]?.survey_name,
            template: surveys[0]?.is_template,
            active: surveys[0]?.is_active
          })}</div>
        )}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Survey Management</h1>
            <p className="text-gray-600">Create and manage community surveys</p>
          </div>
        </div>
        <Link
          href="/surveys/builder"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Survey
        </Link>
      </div>

      {/* ALL Surveys - No Filtering */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Surveys ({surveys.length})</h2>
          <p className="text-sm text-gray-600">Every survey in the database, no filtering</p>
        </div>
        
        <div className="p-6">
          {surveys.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys found</h3>
              <p className="text-gray-600 mb-6">The database query returned 0 surveys</p>
              <Link
                href="/surveys/builder"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Survey
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {surveys.map((survey: any, index: number) => (
                <div key={survey.survey_definition_id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {survey.survey_name || 'Unnamed Survey'}
                        </h3>
                        <div className="flex space-x-2">
                          {survey.is_template && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              Template
                            </span>
                          )}
                          {survey.is_active && !survey.is_template && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                          {!survey.is_active && !survey.is_template && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Draft
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {survey.survey_type?.replace('_', ' ') || 'Unknown Type'}
                          </span>
                        </div>
                      </div>
                      
                      {survey.description && (
                        <p className="text-gray-600 mb-2">{survey.description}</p>
                      )}
                      
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>ID: {survey.survey_definition_id}</div>
                        <div>Created: {survey.created_at ? new Date(survey.created_at).toLocaleDateString() : 'Unknown'}</div>
                        <div>Template: {survey.is_template ? 'Yes' : 'No'}</div>
                        <div>Active: {survey.is_active ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/surveys/${survey.survey_definition_id}/edit`}
                        className="inline-flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <Link
                        href={`/surveys/${survey.survey_definition_id}`}
                        className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Test API Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          🧪 <strong>For comparison:</strong> <a href="/api/surveys" target="_blank" className="underline">Check /api/surveys</a> to see what the API returns
        </p>
      </div>
    </div>
  );
}

export default function SurveysPage() {
  return (
    <AdminGate>
      <Suspense fallback={<LoadingSpinner />}>
        <SurveysContent />
      </Suspense>
    </AdminGate>
  );
}