'use client';

import { ArrowLeft } from 'lucide-react';
import { SurveyDefinition } from '@/types/survey-builder';

interface SurveyBuilderPreviewProps {
  definition: SurveyDefinition;
  onBackToBuilder: () => void;
}

export function SurveyBuilderPreview({ definition, onBackToBuilder }: SurveyBuilderPreviewProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Survey Preview</h1>
            <button
              onClick={onBackToBuilder}
              className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Builder
            </button>
          </div>
          <p className="text-gray-600">Preview how your survey will appear to respondents</p>
        </div>

        {/* Survey Preview */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {definition.survey_name || 'Untitled Survey'}
            </h1>
            {definition.description && (
              <p className="text-gray-600 text-lg">{definition.description}</p>
            )}
          </div>

          {definition.response_schema?.sections?.map((section, sectionIndex) => (
            <div key={section.id} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {section.title}
              </h2>
              {section.description && (
                <p className="text-gray-600 mb-6">{section.description}</p>
              )}

              <div className="space-y-6">
                {section.questions.map((question, questionIndex) => (
                  <div key={question.id} className="space-y-3">
                    <label className="block">
                      <span className="text-gray-900 font-medium">
                        {sectionIndex + 1}.{questionIndex + 1} {question.text}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                      {question.description && (
                        <p className="text-sm text-gray-600 mt-1">{question.description}</p>
                      )}
                    </label>

                    {/* Question Input Preview */}
                    <div className="mt-2">
                      {question.type === 'short_text' && (
                        <input
                          type="text"
                          placeholder={question.config?.placeholder || 'Your answer...'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      )}

                      {question.type === 'long_text' && (
                        <textarea
                          placeholder={question.config?.placeholder || 'Your answer...'}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      )}

                      {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
                        <div className="space-y-2">
                          {question.config?.options?.map((option, optionIndex) => (
                            <label key={optionIndex} className="flex items-center space-x-3">
                              <input
                                type={question.type === 'single_choice' ? 'radio' : 'checkbox'}
                                name={`preview_${question.id}`}
                                className="text-blue-600 focus:ring-blue-500"
                                disabled
                              />
                              <span className="text-gray-900">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {question.type === 'rating_scale' && (
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            {question.config?.scale?.min || 1}
                          </span>
                          <div className="flex space-x-2">
                            {Array.from({ 
                              length: (question.config?.scale?.max || 5) - (question.config?.scale?.min || 1) + 1 
                            }).map((_, index) => (
                              <button
                                key={index}
                                className="w-8 h-8 border border-gray-300 rounded-full hover:bg-blue-50 focus:ring-2 focus:ring-blue-500"
                                disabled
                              >
                                {(question.config?.scale?.min || 1) + index}
                              </button>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {question.config?.scale?.max || 5}
                          </span>
                        </div>
                      )}

                      {question.type === 'yes_no' && (
                        <div className="flex space-x-6">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`preview_${question.id}`}
                              className="text-blue-600 focus:ring-blue-500"
                              disabled
                            />
                            <span>Yes</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`preview_${question.id}`}
                              className="text-blue-600 focus:ring-blue-500"
                              disabled
                            />
                            <span>No</span>
                          </label>
                        </div>
                      )}

                      {question.type === 'number' && (
                        <input
                          type="number"
                          min={question.config?.min}
                          max={question.config?.max}
                          step={question.config?.step}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      )}

                      {question.type === 'email' && (
                        <input
                          type="email"
                          placeholder={question.config?.placeholder || 'your.email@example.com'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
                        />
                      )}

                      {question.type === 'file_upload' && (
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                          <p className="text-gray-600">File upload area (preview only)</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Allowed types: {question.config?.allowedTypes?.join(', ') || 'Any'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Submit Button Preview */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              disabled
            >
              {definition.display_config?.submitButtonText || 'Submit Survey'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}