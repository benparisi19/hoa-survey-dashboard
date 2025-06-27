import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, FileText, Edit, Eye } from 'lucide-react';
import AdminGate from '@/components/AdminGate';
import LoadingSpinner from '@/components/LoadingSpinner';

export const dynamic = 'force-dynamic';

async function getSurveysData() {
  try {
    const { createServiceClient } = await import('@/lib/supabase');
    const supabase = createServiceClient();
    
    const { data: surveys, error } = await supabase
      .from('survey_definitions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching surveys:', error);
      return [];
    }
    
    return surveys || [];
  } catch (error) {
    console.error('Failed to fetch surveys:', error);
    return [];
  }
}

async function SurveysContent() {
  const surveys = await getSurveysData();
  
  const activeSurveys = surveys.filter((s: any) => !s.is_template && s.is_active);
  const draftSurveys = surveys.filter((s: any) => !s.is_template && !s.is_active);
  const templates = surveys.filter((s: any) => s.is_template);

  return (
    <div className="space-y-6">
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

      {/* Active Surveys */}
      {activeSurveys.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Surveys</h2>
            <p className="text-sm text-gray-600">Currently accepting responses</p>
          </div>
          <div className="divide-y divide-gray-200">
            {activeSurveys.map((survey: any) => (
              <SurveyCard key={survey.survey_definition_id} survey={survey} />
            ))}
          </div>
        </div>
      )}

      {/* Draft Surveys */}
      {draftSurveys.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Draft Surveys</h2>
            <p className="text-sm text-gray-600">Not yet published</p>
          </div>
          <div className="divide-y divide-gray-200">
            {draftSurveys.map((survey: any) => (
              <SurveyCard key={survey.survey_definition_id} survey={survey} />
            ))}
          </div>
        </div>
      )}

      {/* Templates */}
      {templates.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Survey Templates</h2>
            <p className="text-sm text-gray-600">Reusable survey structures</p>
          </div>
          <div className="divide-y divide-gray-200">
            {templates.map((survey: any) => (
              <SurveyCard key={survey.survey_definition_id} survey={survey} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {surveys.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No surveys yet</h3>
          <p className="text-gray-600 mb-6">Create your first survey to get started</p>
          <Link
            href="/surveys/builder"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Survey
          </Link>
        </div>
      )}
    </div>
  );
}

function SurveyCard({ survey }: { survey: any }) {
  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium text-gray-900">
              {survey.survey_name}
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
                {survey.survey_type.replace('_', ' ')}
              </span>
            </div>
          </div>
          {survey.description && (
            <p className="text-gray-600 mt-1">{survey.description}</p>
          )}
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>
              Created {new Date(survey.created_at).toLocaleDateString()}
            </span>
            {survey.active_period_end && (
              <span>
                Ends {new Date(survey.active_period_end).toLocaleDateString()}
              </span>
            )}
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