import { Suspense } from 'react';
import Link from 'next/link';
import { Plus, FileText, Calendar, Users, Settings } from 'lucide-react';
import { createServiceClient } from '@/lib/supabase';
import AdminGate from '@/components/AdminGate';
import LoadingSpinner from '@/components/LoadingSpinner';

export const dynamic = 'force-dynamic';

async function getSurveys() {
  // Use API route instead of direct DB connection to avoid env var scoping issues
  try {
    // In server components, we need to construct the full URL
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const response = await fetch(`${baseUrl}/api/surveys`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Force no caching
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('❌ API error fetching surveys:', response.status, response.statusText);
      return [];
    }

    const surveys = await response.json();
    console.log(`✅ API fetched ${surveys?.length || 0} surveys via API route`);
    return surveys || [];
  } catch (error) {
    console.error('❌ Failed to fetch surveys via API:', error);
    return [];
  }
}

async function SurveysContent() {
  const surveys = await getSurveys();
  
  // Debug logging
  console.log('Survey count:', surveys.length);
  surveys.forEach(s => {
    console.log(`Survey: ${s.survey_name}, template: ${s.is_template}, active: ${s.is_active}`);
  });
  
  const activeSurveys = surveys.filter(s => !s.is_template && s.is_active);
  const templates = surveys.filter(s => s.is_template);
  const draftSurveys = surveys.filter(s => !s.is_template && !s.is_active);
  
  console.log('Filtered counts:', { active: activeSurveys.length, templates: templates.length, drafts: draftSurveys.length });

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
        <strong>Debug Info:</strong> Total surveys: {surveys.length} | Active: {activeSurveys.length} | Templates: {templates.length} | Drafts: {draftSurveys.length}
        <br />
        <strong>Survey Details:</strong> {surveys.map(s => `${s.survey_name} (template: ${s.is_template}, active: ${s.is_active})`).join(' | ')}
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Survey Management</h1>
            <p className="text-gray-600">
              Create and manage community surveys
            </p>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Surveys</p>
              <p className="text-2xl font-bold text-gray-900">{activeSurveys.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Templates</p>
              <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Draft Surveys</p>
              <p className="text-2xl font-bold text-gray-900">{draftSurveys.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-card border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Surveys</p>
              <p className="text-2xl font-bold text-gray-900">{surveys.filter(s => !s.is_template).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Surveys */}
      {activeSurveys.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Surveys</h2>
            <p className="text-sm text-gray-600">Currently accepting responses</p>
          </div>
          <div className="divide-y divide-gray-200">
            {activeSurveys.map((survey) => (
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
            {draftSurveys.map((survey) => (
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
            {templates.map((survey) => (
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
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit
          </Link>
          <Link
            href={`/surveys/${survey.survey_definition_id}`}
            className="text-gray-600 hover:text-gray-700 text-sm font-medium"
          >
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