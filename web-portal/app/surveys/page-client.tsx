'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FileText, Edit, Eye } from 'lucide-react';
import AdminGate from '@/components/AdminGate';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSurveys() {
      try {
        const response = await fetch('/api/surveys', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch surveys: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched surveys:', data);
        setSurveys(data || []);
      } catch (err) {
        console.error('Error fetching surveys:', err);
        setError(err instanceof Error ? err.message : 'Failed to load surveys');
      } finally {
        setLoading(false);
      }
    }

    fetchSurveys();
  }, []);

  if (loading) {
    return (
      <AdminGate>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </AdminGate>
    );
  }

  const activeSurveys = surveys.filter(s => !s.is_template && s.is_active);
  const templates = surveys.filter(s => s.is_template);
  const draftSurveys = surveys.filter(s => !s.is_template && !s.is_active);

  return (
    <AdminGate>
      <div className="space-y-6">
        {/* Debug Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
          <strong>Debug Info:</strong> Total surveys: {surveys.length} | Active: {activeSurveys.length} | Templates: {templates.length} | Drafts: {draftSurveys.length}
          {error && <div className="text-red-600 mt-2">Error: {error}</div>}
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

        {/* All Surveys List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All Surveys</h2>
            <p className="text-sm text-gray-600">All surveys, templates, and drafts</p>
          </div>
          
          {surveys.length === 0 ? (
            <div className="p-12 text-center">
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
          ) : (
            <div className="divide-y divide-gray-200">
              {surveys.map((survey: any) => (
                <div key={survey.survey_definition_id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
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
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGate>
  );
}