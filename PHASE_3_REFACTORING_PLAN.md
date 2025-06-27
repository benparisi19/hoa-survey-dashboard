# Phase 3: Multi-Survey Platform - Detailed Refactoring Plan

## 🏗️ MIGRATION STRATEGY: Legacy to Flexible Survey System

Based on the analysis in `PHASE_3_ANALYSIS.md`, this document provides a detailed technical roadmap for migrating from the hardcoded survey system to the existing flexible survey infrastructure.

---

## 📋 PHASE 3A: Foundation Migration (4-6 weeks)

### **Goal**: Migrate the application to use the existing `survey_definitions` + `property_surveys` flexible schema while preserving all current functionality.

### **3A.1: Database Migration Scripts**

#### **Create Landscaping Survey Definition**
```sql
-- Create the survey definition for the current landscaping survey
INSERT INTO survey_definitions (
  survey_definition_id,
  survey_name,
  survey_type,
  description,
  response_schema,
  display_config,
  is_active,
  created_by
) VALUES (
  gen_random_uuid(),
  'HOA Landscaping Service Survey 2024',
  'property_specific',
  'Annual landscaping service evaluation and resident preferences',
  '{
    "sections": [
      {
        "id": "preferences",
        "title": "Service Preferences", 
        "questions": [
          {
            "id": "q1_preference",
            "type": "single_choice",
            "text": "Which landscaping option do you prefer?",
            "required": false,
            "options": [
              {"value": "opt_in", "label": "Opt into HOA landscaping service"},
              {"value": "opt_out", "label": "Opt out of HOA landscaping service"},
              {"value": "neither", "label": "Neither option appeals to me"}
            ]
          },
          {
            "id": "q2_service_rating", 
            "type": "rating_scale",
            "text": "How would you rate the current landscaping service?",
            "required": false,
            "scale": {"min": 1, "max": 5, "labels": {"1": "Poor", "5": "Excellent"}}
          }
        ]
      },
      {
        "id": "opt_out_reasons",
        "title": "Opt-Out Reasoning",
        "conditional": {"question": "q1_preference", "value": "opt_out"},
        "questions": [
          {
            "id": "q3_reasons",
            "type": "multiple_choice", 
            "text": "Why are you choosing to opt out?",
            "options": [
              {"value": "maintain_self", "label": "I prefer to maintain my own landscaping"},
              {"value": "quality", "label": "Quality concerns with current service"},
              {"value": "pet_safety", "label": "Pet safety concerns"},
              {"value": "privacy", "label": "Privacy concerns"},
              {"value": "other", "label": "Other (please specify)"}
            ]
          },
          {
            "id": "q3_other_text",
            "type": "long_text",
            "text": "Please specify other reasons:",
            "conditional": {"question": "q3_reasons", "contains": "other"}
          }
        ]
      }
      // ... Continue for all Q4-Q12 sections
    ]
  }',
  '{
    "theme": "landscaping",
    "layout": "sections",
    "showProgress": true,
    "pdfIntegration": true
  }',
  true,
  (SELECT id FROM user_profiles WHERE role = 'admin' LIMIT 1)
);
```

#### **Migrate Response Data**
```sql
-- Create migration script to convert legacy responses
WITH landscaping_survey AS (
  SELECT survey_definition_id 
  FROM survey_definitions 
  WHERE survey_name = 'HOA Landscaping Service Survey 2024'
),
legacy_responses AS (
  SELECT 
    r.response_id,
    r.property_id,
    r.name,
    r.address,
    r.email_contact,
    r.anonymous,
    r.review_status,
    r.reviewed_by,
    r.reviewed_at,
    r.pdf_file_path,
    r.pdf_storage_url,
    r.pdf_uploaded_at,
    
    -- Aggregate all Q1-Q12 data into JSONB
    jsonb_build_object(
      'q1_preference', q1.q1_preference,
      'q2_service_rating', q1.q2_service_rating,
      'q3_maintain_self', q3.maintain_self,
      'q3_quality', q3.quality,
      'q3_pet_safety', q3.pet_safety,
      'q3_privacy', q3.privacy,
      'q3_other_text', q3.other_text,
      'q4_irrigation', q4.irrigation,
      'q4_poor_mowing', q4.poor_mowing,
      'q4_property_damage', q4.property_damage,
      'q4_missed_service', q4.missed_service,
      'q4_inadequate_weeds', q4.inadequate_weeds,
      'q4_irrigation_detail', q4.irrigation_detail,
      'q4_other_issues', q4.other_issues,
      'q5_construction_issues', q5.q5_construction_issues,
      'q5_explanation', q5.q5_explanation,
      'q6_group_action', q5.q6_group_action,
      'q7_paid_work', q7.paid_work,
      'q7_volunteering', q7.volunteering,
      'q7_equipment_coop', q7.equipment_coop,
      'q7_mentorship', q7.mentorship,
      'q7_manage_area', q7.manage_area,
      'q8_lawn_mower', q8.lawn_mower,
      'q8_trimmer', q8.trimmer,
      'q8_blower', q8.blower,
      'q8_basic_tools', q8.basic_tools,
      'q8_truck_trailer', q8.truck_trailer,
      'q9_dues_preference', q9.dues_preference,
      'q10_biggest_concern', q10.biggest_concern,
      'q11_cost_reduction_ideas', q11.cost_reduction_ideas,
      'q12_involvement_preference', q12.involvement_preference
    ) as responses
    
  FROM responses r
  LEFT JOIN q1_q2_preference_rating q1 ON r.response_id = q1.response_id
  LEFT JOIN q3_opt_out_reasons q3 ON r.response_id = q3.response_id
  LEFT JOIN q4_landscaping_issues q4 ON r.response_id = q4.response_id
  LEFT JOIN q5_q6_construction_group q5 ON r.response_id = q5.response_id
  LEFT JOIN q7_interest_areas q7 ON r.response_id = q7.response_id
  LEFT JOIN q8_equipment_ownership q8 ON r.response_id = q8.response_id
  LEFT JOIN q9_dues_preference q9 ON r.response_id = q9.response_id
  LEFT JOIN q10_biggest_concern q10 ON r.response_id = q10.response_id
  LEFT JOIN q11_cost_reduction q11 ON r.response_id = q11.response_id
  LEFT JOIN q12_involvement q12 ON r.response_id = q12.response_id
)
INSERT INTO property_surveys (
  survey_definition_id,
  property_id,
  responses,
  review_status,
  reviewed_by, 
  reviewed_at,
  submitted_date,
  notes,
  created_at
)
SELECT 
  (SELECT survey_definition_id FROM landscaping_survey),
  lr.property_id,
  lr.responses,
  lr.review_status,
  lr.reviewed_by,
  lr.reviewed_at,
  lr.created_at,
  jsonb_build_object(
    'legacy_response_id', lr.response_id,
    'name', lr.name,
    'address', lr.address, 
    'email_contact', lr.email_contact,
    'anonymous', lr.anonymous,
    'pdf_file_path', lr.pdf_file_path,
    'pdf_storage_url', lr.pdf_storage_url,
    'pdf_uploaded_at', lr.pdf_uploaded_at
  ),
  lr.created_at
FROM legacy_responses lr;
```

### **3A.2: Core Component Abstraction**

#### **Generic Survey View Component**
```typescript
// components/GenericSurveyView.tsx
interface SurveyDefinition {
  survey_definition_id: string;
  survey_name: string;
  response_schema: {
    sections: SurveySection[];
  };
  display_config: {
    theme?: string;
    layout?: 'sections' | 'single_page';
    showProgress?: boolean;
    pdfIntegration?: boolean;
  };
}

interface SurveySection {
  id: string;
  title: string;
  questions: SurveyQuestion[];
  conditional?: {
    question: string;
    value: string | string[];
  };
}

interface SurveyQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'single_choice' | 'multiple_choice' | 'rating_scale' | 'yes_no';
  text: string;
  required?: boolean;
  options?: Array<{value: string; label: string}>;
  scale?: {min: number; max: number; labels?: Record<string, string>};
  conditional?: {
    question: string;
    value?: string;
    contains?: string;
  };
}

interface GenericSurveyViewProps {
  surveyDefinition: SurveyDefinition;
  responses: Record<string, any>;
  editable?: boolean;
  onSave?: (responses: Record<string, any>) => void;
  pdfUrl?: string;
}

export function GenericSurveyView({
  surveyDefinition,
  responses,
  editable = false,
  onSave,
  pdfUrl
}: GenericSurveyViewProps) {
  // Abstract implementation that can render any survey structure
  // Replaces the hardcoded SurveyFormView
}
```

#### **Flexible Response Table**
```typescript
// components/FlexibleResponseTable.tsx
interface FlexibleResponseTableProps {
  surveyDefinition: SurveyDefinition;
  responses: PropertySurveyResponse[];
  onFilter?: (filters: FilterCriteria) => void;
  onExport?: () => void;
}

export function FlexibleResponseTable({
  surveyDefinition,
  responses,
  onFilter,
  onExport
}: FlexibleResponseTableProps) {
  // Generate columns dynamically based on survey_definition.response_schema
  // Preserve existing advanced filtering capabilities
  // Support multiple survey types in same interface
}
```

#### **Dynamic Analytics Components**
```typescript
// components/DynamicSurveyAnalytics.tsx
interface DynamicSurveyAnalyticsProps {
  surveyDefinition: SurveyDefinition;
  responses: PropertySurveyResponse[];
}

export function DynamicSurveyAnalytics({
  surveyDefinition,
  responses
}: DynamicSurveyAnalyticsProps) {
  // Generate charts based on question types:
  // - rating_scale questions → rating distribution charts
  // - single_choice questions → pie charts  
  // - multiple_choice questions → horizontal bar charts
  // - text questions → word clouds / sentiment analysis
}
```

### **3A.3: API Layer Refactoring**

#### **Survey-Aware API Routes**
```typescript
// app/api/surveys/[surveyId]/responses/route.ts
export async function GET(request: Request, { params }: { params: { surveyId: string } }) {
  const supabase = createServiceClient();
  
  // Get survey definition
  const { data: surveyDef } = await supabase
    .from('survey_definitions')
    .select('*')
    .eq('survey_definition_id', params.surveyId)
    .single();
    
  // Get responses for this survey
  const { data: responses } = await supabase
    .from('property_surveys')
    .select(`
      *,
      properties!inner(address, hoa_zone, lot_number),
      property_residents(
        people!inner(first_name, last_name, email)
      )
    `)
    .eq('survey_definition_id', params.surveyId);
    
  return NextResponse.json({
    surveyDefinition: surveyDef,
    responses: responses
  });
}
```

#### **Backward Compatibility Layer**
```typescript
// lib/survey-compatibility.ts
export function getLegacyResponseData(responseId: string) {
  // During migration, support both old and new data access
  const isLegacyResponse = responseId.match(/^\d{3}$/);
  
  if (isLegacyResponse) {
    return getLegacySurveyData(responseId);
  } else {
    return getFlexibleSurveyData(responseId);
  }
}

export function convertLegacyToFlexible(legacyResponse: CompleteResponse): PropertySurveyResponse {
  // Convert legacy response format to flexible format
  // Used during migration period
}
```

### **3A.4: Migration Testing Strategy**

#### **Dual-System Testing**
```typescript
// tests/migration-compatibility.test.ts
describe('Legacy to Flexible Migration', () => {
  test('Legacy response data matches flexible response data', async () => {
    const legacyResponse = await getLegacyResponse('001');
    const flexibleResponse = await getConvertedFlexibleResponse('001');
    
    expect(flexibleResponse.responses.q1_preference).toBe(legacyResponse.q1_preference);
    expect(flexibleResponse.responses.q2_service_rating).toBe(legacyResponse.q2_service_rating);
    // ... test all fields
  });
  
  test('GenericSurveyView renders legacy data correctly', () => {
    const landscapingSurveyDef = getLandscapingSurveyDefinition();
    const legacyData = getConvertedLegacyData();
    
    render(<GenericSurveyView surveyDefinition={landscapingSurveyDef} responses={legacyData} />);
    
    // Verify all Q1-Q12 sections render correctly
    expect(screen.getByText('Service Preferences')).toBeInTheDocument();
    expect(screen.getByText('Opt-Out Reasoning')).toBeInTheDocument();
    // ... test all sections
  });
});
```

---

## 📋 PHASE 3B: Survey Builder Interface (4-6 weeks)

### **Goal**: Build Google Forms-style survey builder for creating new survey definitions.

### **3B.1: Survey Builder Components**

#### **Main Survey Builder Interface**
```typescript
// components/SurveyBuilder/SurveyBuilder.tsx
interface SurveyBuilderProps {
  editingSurvey?: SurveyDefinition;
  onSave: (surveyDefinition: SurveyDefinition) => void;
  onCancel: () => void;
}

export function SurveyBuilder({ editingSurvey, onSave, onCancel }: SurveyBuilderProps) {
  const [surveyData, setSurveyData] = useState(editingSurvey || getEmptySurvey());
  
  return (
    <div className="survey-builder">
      <SurveyBuilderHeader 
        title={surveyData.survey_name}
        onTitleChange={(title) => setSurveyData({...surveyData, survey_name: title})}
      />
      
      <SurveyBuilderSidebar
        questionTypes={QUESTION_TYPES}
        onAddQuestion={addQuestion}
      />
      
      <SurveyBuilderCanvas
        sections={surveyData.response_schema.sections}
        onUpdateSections={updateSections}
      />
      
      <SurveyBuilderPreview 
        surveyDefinition={surveyData}
        sampleResponses={getSampleResponses()}
      />
    </div>
  );
}
```

#### **Drag-and-Drop Question Builder**
```typescript
// components/SurveyBuilder/QuestionBuilder.tsx
const QUESTION_TYPES = [
  { type: 'short_text', label: 'Short Text', icon: Type },
  { type: 'long_text', label: 'Long Text', icon: AlignLeft },
  { type: 'single_choice', label: 'Multiple Choice', icon: RadioButton },
  { type: 'multiple_choice', label: 'Checkboxes', icon: CheckSquare },
  { type: 'rating_scale', label: 'Rating Scale', icon: Star },
  { type: 'yes_no', label: 'Yes/No', icon: ToggleLeft },
] as const;

export function QuestionBuilder({ question, onUpdate }: QuestionBuilderProps) {
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="question-builder">
        <QuestionTypeSelector 
          currentType={question.type}
          onTypeChange={updateQuestionType}
        />
        
        <QuestionTextEditor
          text={question.text}
          onTextChange={updateQuestionText}
        />
        
        {question.type === 'single_choice' || question.type === 'multiple_choice' ? (
          <OptionsEditor
            options={question.options}
            onOptionsChange={updateOptions}
          />
        ) : null}
        
        {question.type === 'rating_scale' ? (
          <RatingScaleEditor
            scale={question.scale}
            onScaleChange={updateScale}
          />
        ) : null}
        
        <ConditionalLogicEditor
          conditional={question.conditional}
          availableQuestions={getAvailableQuestions()}
          onConditionalChange={updateConditional}
        />
      </div>
    </DndContext>
  );
}
```

#### **Survey Templates System**
```typescript
// lib/survey-templates.ts
export const SURVEY_TEMPLATES = {
  'community_satisfaction': {
    name: 'Community Satisfaction Survey',
    description: 'Annual resident satisfaction survey',
    sections: [
      {
        title: 'Overall Satisfaction',
        questions: [
          {
            type: 'rating_scale',
            text: 'How satisfied are you with living in our community?',
            scale: { min: 1, max: 5 }
          }
        ]
      }
    ]
  },
  'emergency_preparedness': {
    name: 'Emergency Preparedness Survey',
    description: 'Assess community emergency readiness',
    // ... template structure
  },
  'amenity_usage': {
    name: 'Amenity Usage & Feedback',
    description: 'Gather feedback on community amenities',
    // ... template structure
  }
} as const;
```

### **3B.2: Survey Management Interface**

#### **Survey Dashboard**
```typescript
// app/surveys/page.tsx - New survey management page
export default async function SurveysPage() {
  const surveys = await getSurveyDefinitions();
  
  return (
    <div className="surveys-page">
      <SurveysHeader onCreateNew={() => router.push('/surveys/builder')} />
      
      <SurveysList
        surveys={surveys}
        onEdit={(id) => router.push(`/surveys/${id}/edit`)}
        onView={(id) => router.push(`/surveys/${id}`)}
        onDuplicate={duplicateSurvey}
        onArchive={archiveSurvey}
      />
      
      <SurveyTemplates
        templates={SURVEY_TEMPLATES}
        onSelectTemplate={createFromTemplate}
      />
    </div>
  );
}
```

#### **Survey Response Analysis**
```typescript
// app/surveys/[id]/page.tsx - Individual survey analysis
export default async function SurveyAnalysisPage({ params }: { params: { id: string } }) {
  const surveyData = await getSurveyWithResponses(params.id);
  
  return (
    <div className="survey-analysis">
      <SurveyAnalysisHeader survey={surveyData.definition} />
      
      <SurveyMetrics
        totalResponses={surveyData.responses.length}
        participationRate={calculateParticipationRate(surveyData)}
        completionRate={calculateCompletionRate(surveyData)}
      />
      
      <DynamicSurveyAnalytics
        surveyDefinition={surveyData.definition}
        responses={surveyData.responses}
      />
      
      <FlexibleResponseTable
        surveyDefinition={surveyData.definition}
        responses={surveyData.responses}
      />
    </div>
  );
}
```

---

## 📋 PHASE 3C: Multi-Survey Analytics & Workflows (3-4 weeks)

### **Goal**: Cross-survey analytics, automated workflows, and issue tracking integration.

### **3C.1: Cross-Survey Analytics**

#### **Property Timeline View**
```typescript
// components/PropertyTimeline.tsx
export function PropertyTimeline({ propertyId }: { propertyId: string }) {
  const surveys = usePropertySurveys(propertyId);
  
  return (
    <div className="property-timeline">
      <TimelineHeader property={surveys[0]?.property} />
      
      {surveys.map(survey => (
        <TimelineEntry
          key={survey.survey_id}
          survey={survey}
          onViewDetails={() => openSurveyModal(survey)}
        />
      ))}
      
      <TrendAnalysis
        surveys={surveys}
        metrics={['satisfaction_ratings', 'issue_reports', 'participation']}
      />
    </div>
  );
}
```

#### **Cross-Survey Comparison**
```typescript
// components/CrossSurveyComparison.tsx
export function CrossSurveyComparison({ 
  surveyIds,
  comparisonType = 'trend' | 'demographic' | 'geographic'
}: CrossSurveyComparisonProps) {
  const surveyData = useSurveyComparison(surveyIds);
  
  return (
    <div className="cross-survey-comparison">
      <ComparisonControls
        surveyIds={surveyIds}
        comparisonType={comparisonType}
        onConfigChange={updateComparison}
      />
      
      {comparisonType === 'trend' && (
        <TrendComparisonChart data={surveyData} />
      )}
      
      {comparisonType === 'geographic' && (
        <GeographicComparisonMap data={surveyData} />
      )}
      
      <ComparisonInsights insights={generateInsights(surveyData)} />
    </div>
  );
}
```

### **3C.2: Automated Workflow System**

#### **Issue Auto-Generation**
```typescript
// lib/workflow-automation.ts
export async function processNewSurveyResponse(response: PropertySurveyResponse) {
  const surveyDefinition = await getSurveyDefinition(response.survey_definition_id);
  
  // Extract workflow rules from survey definition
  const workflowRules = surveyDefinition.display_config.workflows || [];
  
  for (const rule of workflowRules) {
    if (evaluateWorkflowCondition(rule.condition, response.responses)) {
      await executeWorkflowAction(rule.action, response);
    }
  }
}

interface WorkflowRule {
  condition: {
    question: string;
    operator: 'equals' | 'less_than' | 'contains' | 'not_empty';
    value: any;
  };
  action: {
    type: 'create_issue' | 'send_followup' | 'flag_response' | 'notify_admin';
    config: Record<string, any>;
  };
}

// Example: Auto-create issue for low satisfaction ratings
const LANDSCAPING_WORKFLOW_RULES: WorkflowRule[] = [
  {
    condition: { question: 'q2_service_rating', operator: 'less_than', value: 3 },
    action: { 
      type: 'create_issue', 
      config: { 
        title: 'Low Service Rating Reported',
        priority: 'medium',
        category: 'service_quality'
      }
    }
  }
];
```

#### **Communication Templates**
```typescript
// components/CommunicationTemplates.tsx
interface CommunicationTemplate {
  template_id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[]; // Available template variables
  trigger: WorkflowRule['condition'];
}

export function CommunicationTemplateManager() {
  return (
    <div className="communication-templates">
      <TemplateList
        templates={templates}
        onEdit={editTemplate}
        onDelete={deleteTemplate}
      />
      
      <TemplateEditor
        template={editingTemplate}
        availableVariables={['property_address', 'resident_name', 'survey_response']}
        onSave={saveTemplate}
      />
    </div>
  );
}
```

---

## 🛠️ TECHNICAL IMPLEMENTATION DETAILS

### **Database Migration Safety**

#### **Rollback Strategy**
```sql
-- Migration safety: Keep legacy tables during transition
-- Add migration status tracking
CREATE TABLE migration_status (
  table_name TEXT PRIMARY KEY,
  migration_started_at TIMESTAMPTZ,
  migration_completed_at TIMESTAMPTZ,
  total_records INTEGER,
  migrated_records INTEGER,
  rollback_available BOOLEAN DEFAULT true
);

-- Backup legacy data before migration
CREATE TABLE responses_backup AS SELECT * FROM responses;
CREATE TABLE q1_q2_preference_rating_backup AS SELECT * FROM q1_q2_preference_rating;
-- ... backup all legacy tables
```

#### **Gradual Migration Approach**
```typescript
// Feature flag system for gradual rollout
export function useSurveySystem() {
  const user = useUser();
  const features = useFeatureFlags(user.id);
  
  return {
    useFlexibleSurveys: features.flexible_surveys_enabled,
    canCreateSurveys: features.survey_builder_enabled,
    showCrossSurveyAnalytics: features.cross_survey_analytics_enabled
  };
}
```

### **Performance Considerations**

#### **JSONB Query Optimization**
```sql
-- Index JSONB response data for common queries
CREATE INDEX idx_property_surveys_responses_q2_rating 
ON property_surveys USING GIN ((responses->'q2_service_rating'));

CREATE INDEX idx_property_surveys_responses_satisfaction
ON property_surveys USING GIN ((responses->'satisfaction_rating'));

-- Function for efficient cross-survey queries
CREATE OR REPLACE FUNCTION get_survey_responses_by_question(
  question_id TEXT,
  survey_definition_ids UUID[]
) RETURNS TABLE (
  survey_id UUID,
  property_id UUID, 
  response_value JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.survey_id,
    ps.property_id,
    ps.responses->question_id as response_value
  FROM property_surveys ps
  WHERE ps.survey_definition_id = ANY(survey_definition_ids)
    AND ps.responses ? question_id;
END;
$$ LANGUAGE plpgsql;
```

### **TypeScript Type Safety**

#### **Flexible Response Types**
```typescript
// Dynamic typing based on survey definition
export type SurveyResponse<T extends SurveyDefinition> = {
  [K in T['response_schema']['sections'][number]['questions'][number]['id']]: 
    T['response_schema']['sections'][number]['questions'][number] extends { type: 'rating_scale' }
      ? number
      : T['response_schema']['sections'][number]['questions'][number] extends { type: 'single_choice' }
      ? string
      : T['response_schema']['sections'][number]['questions'][number] extends { type: 'multiple_choice' }
      ? string[]
      : string;
};

// Example usage:
const landscapingSurvey = getLandscapingSurveyDefinition();
type LandscapingResponse = SurveyResponse<typeof landscapingSurvey>;
// Result: { q1_preference: string, q2_service_rating: number, ... }
```

---

## 📅 IMPLEMENTATION TIMELINE

### **Week 1-2: Foundation**
- [ ] Create comprehensive database migration scripts
- [ ] Build `GenericSurveyView` component with landscaping survey
- [ ] Implement backward compatibility layer
- [ ] Set up feature flags for gradual rollout

### **Week 3-4: API Migration**
- [ ] Refactor API routes to use flexible schema
- [ ] Update TypeScript types for flexible responses
- [ ] Implement survey-aware filtering and analytics
- [ ] Migration testing and validation

### **Week 5-6: UI Migration**
- [ ] Convert individual response pages to use `GenericSurveyView`
- [ ] Update response table to use flexible schema
- [ ] Migrate dashboard analytics to flexible system
- [ ] User acceptance testing

### **Week 7-10: Survey Builder**
- [ ] Build drag-and-drop survey builder interface
- [ ] Implement question type components
- [ ] Add survey templates system
- [ ] Survey preview and testing tools

### **Week 11-12: Multi-Survey Management**
- [ ] Survey selection and switching interface
- [ ] Cross-survey analytics components
- [ ] Migration completion and legacy cleanup
- [ ] Documentation and training materials

### **Week 13-14: Advanced Workflows**
- [ ] Automated issue creation system
- [ ] Communication template management
- [ ] Cross-survey comparison tools
- [ ] Performance optimization and final testing

---

## 🎯 SUCCESS CRITERIA

### **Phase 3A Success Metrics:**
- [ ] All existing landscaping survey functionality preserved
- [ ] Zero data loss during migration
- [ ] Performance equivalent or better than legacy system
- [ ] All existing users can continue normal workflows

### **Phase 3B Success Metrics:**
- [ ] Non-technical admin can create a new survey in <30 minutes
- [ ] Survey builder supports all question types from landscaping survey
- [ ] Survey templates reduce creation time by 75%
- [ ] New surveys integrate seamlessly with existing property/resident data

### **Phase 3C Success Metrics:**
- [ ] Cross-survey analytics provide insights not available before
- [ ] Automated workflows reduce manual follow-up tasks by 50%
- [ ] Property timeline view shows complete survey history
- [ ] System supports 5+ concurrent survey types without performance impact

This refactoring plan transforms the application from a single-purpose landscaping survey tool into a comprehensive community engagement platform while preserving all existing functionality and data.