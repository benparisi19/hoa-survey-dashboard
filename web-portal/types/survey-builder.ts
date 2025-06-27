// Enhanced types for the flexible survey system
import type { Database } from './database';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

// Base types from database
export type BaseSurveyDefinition = Tables<'survey_definitions'>;
export type BasePropertySurvey = Tables<'property_surveys'>;

// Enhanced survey definition with new schema fields
export interface SurveyDefinition extends Omit<BaseSurveyDefinition, 'response_schema' | 'display_config' | 'targeting_config'> {
  // Enhanced typed fields
  response_schema: SurveySchema;
  display_config: SurveyDisplayConfig | null;
  targeting_config: SurveyTargetingConfig | null;
  
  // New fields from schema enhancement
  is_template: boolean | null;
  template_category: string | null;
  version: number | null;
  parent_survey_id: string | null;
  auto_recurring: boolean | null;
  recurrence_config: RecurrenceConfig | null;
}

// Enhanced property survey with new schema fields
export interface PropertySurvey extends Omit<BasePropertySurvey, 'responses'> {
  // Enhanced typed fields
  responses: SurveyResponses;
  
  // New fields from schema enhancement
  response_status: 'draft' | 'submitted' | 'reviewed' | 'archived';
  completion_percentage: number;
  last_section_completed: string | null;
  time_spent_minutes: number;
}

// Survey schema types for Google Forms-style surveys
export interface SurveySchema {
  sections: SurveySection[];
  metadata?: {
    version: string;
    created_with: string;
  };
}

export interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  conditional?: ConditionalLogic;
}

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  text: string;
  description?: string;
  required?: boolean;
  config?: QuestionConfig;
  validation?: ValidationRules;
  conditional?: ConditionalLogic;
}

export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'single_choice'
  | 'multiple_choice'
  | 'rating_scale'
  | 'yes_no'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'file_upload';

export interface QuestionConfig {
  // For choice questions
  options?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
  
  // For rating scale questions
  scale?: {
    min?: number;
    max?: number;
    step?: number;
    labels?: Record<string, string>;
  };
  
  // For text questions
  placeholder?: string;
  maxLength?: number;
  
  // For number questions
  min?: number;
  max?: number;
  step?: number;
  
  // For file upload questions
  allowedTypes?: string[];
  maxSize?: string;
  multiple?: boolean;
}

export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  email?: boolean;
  phone?: boolean;
  custom?: string;
}

export interface ConditionalLogic {
  operator?: 'AND' | 'OR';
  conditions: Array<{
    question: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
    value?: any;
  }>;
  action?: 'show' | 'hide' | 'require' | 'skip_to_section';
  target?: string; // section ID for skip_to_section
}

export interface SurveyDisplayConfig {
  theme?: 'default' | 'community' | 'professional' | 'modern';
  layout?: 'sections' | 'single_page' | 'question_by_question';
  showProgress?: boolean;
  allowSave?: boolean;
  allowBack?: boolean;
  showQuestionNumbers?: boolean;
  submitButtonText?: string;
  thankYouMessage?: string;
}

export interface SurveyTargetingConfig {
  type: 'all_properties' | 'property_filter' | 'manual_selection' | 'simple_text';
  description?: string;
  criteria?: {
    zones?: string[];
    property_types?: string[];
    street_groups?: string[];
    property_ids?: string[];
    exclude_properties?: string[];
    min_residents?: number;
    max_residents?: number;
    has_participated_in?: string[]; // survey IDs
    exclude_previous_participants?: boolean;
  };
}

export interface RecurrenceConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  interval?: number; // e.g., every 2 weeks = frequency: 'weekly', interval: 2
  next_occurrence?: string;
  auto_create?: boolean;
  notification_days_before?: number;
  end_date?: string;
}

// Survey response types
export type SurveyResponses = Record<string, any>;

// Survey template types
export interface SurveyTemplate extends Omit<SurveyDefinition, 'survey_definition_id' | 'is_template' | 'is_active'> {
  is_template: true;
  template_category: string;
}

// Survey builder component types
export interface SurveyBuilderState {
  definition: Partial<SurveyDefinition>;
  currentSection: number;
  currentQuestion: number;
  isDirty: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  section?: string;
  question?: string;
}

// Survey analytics types
export interface SurveyAnalytics {
  survey_definition_id: string;
  total_properties: number;
  properties_with_responses: number;
  total_responses: number;
  completed_responses: number;
  participation_rate: number;
  completion_rate: number;
  response_by_status: Record<string, number>;
  response_by_zone: Record<string, number>;
  average_time_spent: number;
  question_analytics: QuestionAnalytics[];
}

export interface QuestionAnalytics {
  question_id: string;
  question_text: string;
  question_type: QuestionType;
  response_count: number;
  skip_count: number;
  response_distribution: Record<string, number>;
  average_rating?: number;
  common_responses?: string[];
}

// File upload types
export interface SurveyFileUpload {
  upload_id: string;
  survey_id: string;
  question_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  content_type: string;
  uploaded_at: string;
}

// Helper types for the builder UI
export interface QuestionTypeDefinition {
  type: QuestionType;
  label: string;
  description: string;
  icon: string;
  defaultConfig: Partial<QuestionConfig>;
  configurable: Array<keyof QuestionConfig>;
}

export interface SurveyBuilderAction {
  type: 'ADD_SECTION' | 'REMOVE_SECTION' | 'ADD_QUESTION' | 'REMOVE_QUESTION' | 
        'UPDATE_QUESTION' | 'UPDATE_SECTION' | 'UPDATE_SURVEY' | 'REORDER_QUESTIONS' | 
        'REORDER_SECTIONS' | 'DUPLICATE_QUESTION' | 'DUPLICATE_SECTION';
  payload: any;
}

// Constants for the builder
export const QUESTION_TYPES: QuestionTypeDefinition[] = [
  {
    type: 'short_text',
    label: 'Short Text',
    description: 'Single line text input',
    icon: 'Type',
    defaultConfig: { placeholder: 'Your answer...' },
    configurable: ['placeholder', 'maxLength']
  },
  {
    type: 'long_text',
    label: 'Paragraph',
    description: 'Multi-line text input',
    icon: 'AlignLeft',
    defaultConfig: { placeholder: 'Your detailed answer...' },
    configurable: ['placeholder', 'maxLength']
  },
  {
    type: 'single_choice',
    label: 'Multiple Choice',
    description: 'Choose one option',
    icon: 'Circle',
    defaultConfig: { options: [{ value: 'option1', label: 'Option 1' }] },
    configurable: ['options']
  },
  {
    type: 'multiple_choice',
    label: 'Checkboxes',
    description: 'Choose multiple options',
    icon: 'CheckSquare',
    defaultConfig: { options: [{ value: 'option1', label: 'Option 1' }] },
    configurable: ['options']
  },
  {
    type: 'rating_scale',
    label: 'Rating Scale',
    description: 'Rate on a scale',
    icon: 'Star',
    defaultConfig: { scale: { min: 1, max: 5 } },
    configurable: ['scale']
  },
  {
    type: 'yes_no',
    label: 'Yes/No',
    description: 'Simple yes or no question',
    icon: 'ToggleLeft',
    defaultConfig: {},
    configurable: []
  },
  {
    type: 'number',
    label: 'Number',
    description: 'Numeric input',
    icon: 'Hash',
    defaultConfig: {},
    configurable: ['min', 'max', 'step']
  },
  {
    type: 'email',
    label: 'Email',
    description: 'Email address input',
    icon: 'Mail',
    defaultConfig: { placeholder: 'your.email@example.com' },
    configurable: ['placeholder']
  },
  {
    type: 'file_upload',
    label: 'File Upload',
    description: 'Upload documents or images',
    icon: 'Upload',
    defaultConfig: { allowedTypes: ['.pdf', '.jpg', '.png'], maxSize: '10MB' },
    configurable: ['allowedTypes', 'maxSize', 'multiple']
  }
];