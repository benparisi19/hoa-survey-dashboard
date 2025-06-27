'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2, Copy, Settings } from 'lucide-react';
import { 
  SurveySchema, 
  SurveySection, 
  SurveyQuestion, 
  QUESTION_TYPES, 
  ValidationError 
} from '@/types/survey-builder';

interface SurveyBuilderCanvasProps {
  schema: SurveySchema;
  onSchemaChange: (schema: SurveySchema) => void;
  currentSection: number;
  currentQuestion: number;
  onQuestionSelect: (questionIndex: number) => void;
  errors: ValidationError[];
}

export function SurveyBuilderCanvas({
  schema,
  onSchemaChange,
  currentSection,
  currentQuestion,
  onQuestionSelect,
  errors
}: SurveyBuilderCanvasProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const currentSectionData = schema.sections[currentSection];

  // Add new question
  const addQuestion = useCallback((type: string, index?: number) => {
    const questionType = QUESTION_TYPES.find(qt => qt.type === type);
    if (!questionType) return;

    const newQuestion: SurveyQuestion = {
      id: `question_${Date.now()}`,
      type: questionType.type,
      text: '',
      required: false,
      config: questionType.defaultConfig
    };

    const updatedSections = [...schema.sections];
    const insertIndex = index !== undefined ? index : currentSectionData.questions.length;
    updatedSections[currentSection].questions.splice(insertIndex, 0, newQuestion);

    onSchemaChange({ ...schema, sections: updatedSections });
    onQuestionSelect(insertIndex);
  }, [schema, currentSection, currentSectionData?.questions.length, onSchemaChange, onQuestionSelect]);

  // Update question
  const updateQuestion = useCallback((questionIndex: number, updates: Partial<SurveyQuestion>) => {
    const updatedSections = [...schema.sections];
    updatedSections[currentSection].questions[questionIndex] = {
      ...updatedSections[currentSection].questions[questionIndex],
      ...updates
    };
    onSchemaChange({ ...schema, sections: updatedSections });
  }, [schema, currentSection, onSchemaChange]);

  // Delete question
  const deleteQuestion = useCallback((questionIndex: number) => {
    const updatedSections = [...schema.sections];
    updatedSections[currentSection].questions.splice(questionIndex, 1);
    onSchemaChange({ ...schema, sections: updatedSections });
    
    if (currentQuestion >= questionIndex && currentQuestion > 0) {
      onQuestionSelect(currentQuestion - 1);
    }
  }, [schema, currentSection, currentQuestion, onSchemaChange, onQuestionSelect]);

  // Update section
  const updateSection = useCallback((updates: Partial<SurveySection>) => {
    const updatedSections = [...schema.sections];
    updatedSections[currentSection] = { ...updatedSections[currentSection], ...updates };
    onSchemaChange({ ...schema, sections: updatedSections });
  }, [schema, currentSection, onSchemaChange]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    
    const questionType = e.dataTransfer.getData('questionType');
    if (questionType) {
      addQuestion(questionType, index);
    }
  }, [addQuestion]);

  if (!currentSectionData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-gray-500 mb-4">No section selected</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Section Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={currentSectionData.title}
                onChange={(e) => updateSection({ title: e.target.value })}
                className="text-2xl font-bold border-none outline-none w-full placeholder-gray-400"
                placeholder="Section Title"
              />
              <textarea
                value={currentSectionData.description || ''}
                onChange={(e) => updateSection({ description: e.target.value })}
                className="mt-2 text-gray-600 border-none outline-none w-full resize-none placeholder-gray-400"
                placeholder="Section description (optional)"
                rows={2}
              />
            </div>
            <Settings className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {currentSectionData.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              isSelected={index === currentQuestion}
              onSelect={() => onQuestionSelect(index)}
              onUpdate={(updates) => updateQuestion(index, updates)}
              onDelete={() => deleteQuestion(index)}
              errors={errors.filter(e => e.question === question.id)}
            />
          ))}

          {/* Drop Zones */}
          {currentSectionData.questions.map((_, index) => (
            <div
              key={`drop-${index}`}
              className={`h-2 border-2 border-dashed transition-colors ${
                dragOverIndex === index
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-transparent'
              }`}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
            />
          ))}

          {/* Final Drop Zone */}
          <div
            className={`h-12 border-2 border-dashed rounded-lg transition-colors flex items-center justify-center ${
              dragOverIndex === currentSectionData.questions.length
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => handleDragOver(e, currentSectionData.questions.length)}
            onDrop={(e) => handleDrop(e, currentSectionData.questions.length)}
          >
            <span className="text-gray-500 text-sm">
              Drop a question here or click + to add
            </span>
          </div>

          {/* Add Question Button */}
          <div className="flex justify-center">
            <button
              onClick={() => addQuestion('short_text')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuestionCardProps {
  question: SurveyQuestion;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<SurveyQuestion>) => void;
  onDelete: () => void;
  errors: ValidationError[];
}

function QuestionCard({ 
  question, 
  index, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete,
  errors 
}: QuestionCardProps) {
  const questionType = QUESTION_TYPES.find(qt => qt.type === question.type);
  const hasErrors = errors.length > 0;

  return (
    <div
      className={`bg-white rounded-lg border p-6 cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200' 
          : hasErrors
          ? 'border-red-300 ring-1 ring-red-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
            {index + 1}
          </span>
          <div className="flex items-center space-x-2">
            {questionType && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {questionType.label}
              </span>
            )}
            <label className="flex items-center space-x-1 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span>Required</span>
            </label>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
          <Trash2 
            className="h-4 w-4 text-gray-400 hover:text-red-600 cursor-pointer" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          />
        </div>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          value={question.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full text-lg border-none outline-none placeholder-gray-400"
          placeholder="Question text"
        />

        {question.description && (
          <textarea
            value={question.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="w-full text-sm text-gray-600 border-none outline-none resize-none placeholder-gray-400"
            placeholder="Question description (optional)"
            rows={2}
          />
        )}

        {/* Question Type Specific UI */}
        <QuestionPreview question={question} onUpdate={onUpdate} />

        {/* Errors */}
        {hasErrors && (
          <div className="text-sm text-red-600 space-y-1">
            {errors.map((error, idx) => (
              <div key={idx}>{error.message}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionPreview({ question, onUpdate }: { 
  question: SurveyQuestion; 
  onUpdate: (updates: Partial<SurveyQuestion>) => void;
}) {
  switch (question.type) {
    case 'single_choice':
    case 'multiple_choice':
      return (
        <div className="space-y-2">
          {question.config?.options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type={question.type === 'single_choice' ? 'radio' : 'checkbox'}
                disabled
                className="text-blue-600"
              />
              <input
                type="text"
                value={option.label}
                onChange={(e) => {
                  const newOptions = [...(question.config?.options || [])];
                  newOptions[index] = { ...option, label: e.target.value };
                  onUpdate({ config: { ...question.config, options: newOptions } });
                }}
                className="flex-1 border-none outline-none text-sm"
                placeholder="Option text"
              />
              <Trash2 
                className="h-4 w-4 text-gray-400 hover:text-red-600 cursor-pointer"
                onClick={() => {
                  const newOptions = [...(question.config?.options || [])];
                  newOptions.splice(index, 1);
                  onUpdate({ config: { ...question.config, options: newOptions } });
                }}
              />
            </div>
          ))}
          <button
            onClick={() => {
              const newOptions = [
                ...(question.config?.options || []),
                { value: `option_${Date.now()}`, label: 'New option' }
              ];
              onUpdate({ config: { ...question.config, options: newOptions } });
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + Add option
          </button>
        </div>
      );

    case 'rating_scale':
      return (
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Scale:</span>
          <input
            type="number"
            value={question.config?.scale?.min || 1}
            onChange={(e) => onUpdate({ 
              config: { 
                ...question.config, 
                scale: { ...question.config?.scale, min: parseInt(e.target.value) }
              }
            })}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
            min="1"
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            value={question.config?.scale?.max || 5}
            onChange={(e) => onUpdate({ 
              config: { 
                ...question.config, 
                scale: { ...question.config?.scale, max: parseInt(e.target.value) }
              }
            })}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
            min="2"
          />
        </div>
      );

    case 'short_text':
    case 'long_text':
      return (
        <input
          type="text"
          value={question.config?.placeholder || ''}
          onChange={(e) => onUpdate({ config: { ...question.config, placeholder: e.target.value } })}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm placeholder-gray-400"
          placeholder="Placeholder text for respondents..."
        />
      );

    default:
      return (
        <div className="text-sm text-gray-500 italic">
          Preview for {question.type} question type
        </div>
      );
  }
}