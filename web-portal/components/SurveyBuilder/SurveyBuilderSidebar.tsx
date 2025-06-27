'use client';

import { Plus, Settings, FileText, Move3D } from 'lucide-react';
// Using direct Tailwind styling
import { QUESTION_TYPES, SurveySchema } from '@/types/survey-builder';

interface SurveyBuilderSidebarProps {
  onAddSection: () => void;
  currentSection: number;
  schema: SurveySchema;
  onSectionSelect: (index: number) => void;
}

export function SurveyBuilderSidebar({
  onAddSection,
  currentSection,
  schema,
  onSectionSelect
}: SurveyBuilderSidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Question Types */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Question Types</h3>
        <div className="space-y-2">
          {QUESTION_TYPES.map((questionType) => {
            const IconComponent = require('lucide-react')[questionType.icon];
            return (
              <div
                key={questionType.type}
                className="flex items-center p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-move"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('questionType', questionType.type);
                }}
              >
                <IconComponent className="h-4 w-4 text-gray-600 mr-2" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {questionType.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {questionType.description}
                  </div>
                </div>
                <Move3D className="h-4 w-4 text-gray-400" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Sections List */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Sections</h3>
            <button
              onClick={onAddSection}
              className="inline-flex items-center px-3 py-1 text-xs border border-gray-300 bg-white hover:bg-gray-50 rounded-md transition-colors"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Section
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-4 space-y-2">
            {schema.sections.map((section, index) => (
              <div
                key={section.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  index === currentSection
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
                onClick={() => onSectionSelect(index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {section.title || `Section ${index + 1}`}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <Settings className="h-4 w-4 text-gray-400" />
                </div>

                {/* Question List */}
                {section.questions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {section.questions.slice(0, 3).map((question, qIndex) => (
                      <div
                        key={question.id}
                        className="text-xs text-gray-600 pl-6 truncate"
                      >
                        {qIndex + 1}. {question.text || 'Untitled Question'}
                      </div>
                    ))}
                    {section.questions.length > 3 && (
                      <div className="text-xs text-gray-500 pl-6">
                        +{section.questions.length - 3} more...
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Survey Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <div>
            {schema.sections.length} section{schema.sections.length !== 1 ? 's' : ''}
          </div>
          <div>
            {schema.sections.reduce((total, section) => total + section.questions.length, 0)} total questions
          </div>
        </div>
      </div>
    </div>
  );
}