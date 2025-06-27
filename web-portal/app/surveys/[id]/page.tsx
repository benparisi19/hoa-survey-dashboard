import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Users, Calendar, Settings, BarChart3 } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase';
import AdminGate from '@/components/AdminGate';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SurveyDefinition } from '@/types/survey-builder';

export const dynamic = 'force-dynamic';

async function getSurvey(id: string): Promise<SurveyDefinition | null> {
  const supabase = createServiceClient();
  
  const { data: survey, error } = await supabase
    .from('survey_definitions')
    .select('*')
    .eq('survey_definition_id', id)
    .single();

  if (error || !survey) {
    return null;
  }

  return survey as SurveyDefinition;
}

async function getSurveyStats(id: string) {
  const supabase = createServiceClient();
  
  const { data: responses, error } = await supabase
    .from('property_surveys')
    .select('response_status, completion_percentage')
    .eq('survey_definition_id', id);

  if (error || !responses) {
    return {
      totalResponses: 0,
      completedResponses: 0,
      draftResponses: 0,
      averageCompletion: 0
    };
  }

  const totalResponses = responses.length;
  const completedResponses = responses.filter(r => r.response_status === 'submitted').length;
  const draftResponses = responses.filter(r => r.response_status === 'draft').length;
  const averageCompletion = responses.reduce((sum, r) => sum + (r.completion_percentage || 0), 0) / totalResponses || 0;

  return {
    totalResponses,
    completedResponses,
    draftResponses,
    averageCompletion: Math.round(averageCompletion)
  };
}

async function SurveyDetailContent({ id }: { id: string }) {
  const survey = await getSurvey(id);
  const stats = await getSurveyStats(id);

  if (!survey) {
    notFound();
  }

  const schema = survey.response_schema as any;
  const sections = schema?.sections || [];
  const totalQuestions = sections.reduce((sum: number, section: any) => sum + (section.questions?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/surveys"
            className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Surveys
          </Link>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href={`/surveys/${id}/edit`}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Survey
          </Link>
        </div>
      </div>

      {/* Survey Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{survey.survey_name}</h1>
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
              <p className="text-gray-600 mb-4">{survey.description}</p>
            )}
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>Created {new Date(survey.created_at || '').toLocaleDateString()}</span>
              <span>{sections.length} sections</span>
              <span>{totalQuestions} questions</span>
              {survey.active_period_end && (
                <span>Ends {new Date(survey.active_period_end).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedResponses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <Edit className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Draft</p>
              <p className="text-2xl font-bold text-gray-900">{stats.draftResponses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Avg. Completion</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageCompletion}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Survey Structure */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Survey Structure</h2>
          <p className="text-sm text-gray-600">Questions and sections in this survey</p>
        </div>
        <div className="p-6">
          {sections.length > 0 ? (
            <div className="space-y-6">
              {sections.map((section: any, sectionIndex: number) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Section {sectionIndex + 1}: {section.title}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {section.questions?.length || 0} questions
                    </span>
                  </div>
                  {section.description && (
                    <p className="text-gray-600 mb-3">{section.description}</p>
                  )}
                  {section.questions && section.questions.length > 0 && (
                    <div className="space-y-2">
                      {section.questions.map((question: any, questionIndex: number) => (
                        <div key={question.id} className="flex items-start space-x-3 p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium text-gray-500 mt-1">
                            {questionIndex + 1}.
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{question.text}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                {question.type.replace('_', ' ')}
                              </span>
                              {question.required && (
                                <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sections configured yet</p>
          )}
        </div>
      </div>

      {/* Settings Preview */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Survey Settings</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Display Settings</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Layout: {survey.display_config?.layout || 'sections'}</p>
                <p>Theme: {survey.display_config?.theme || 'default'}</p>
                <p>Progress bar: {survey.display_config?.showProgress ? 'Yes' : 'No'}</p>
                <p>Question numbers: {survey.display_config?.showQuestionNumbers ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Targeting</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Target: {survey.targeting_config?.type?.replace('_', ' ') || 'all properties'}</p>
                {survey.auto_recurring && (
                  <p>Recurring: {survey.recurrence_config?.frequency || 'Yes'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SurveyDetailPage({ params }: { params: { id: string } }) {
  return (
    <AdminGate>
      <Suspense fallback={<LoadingSpinner />}>
        <SurveyDetailContent id={params.id} />
      </Suspense>
    </AdminGate>
  );
}