# Phase 3B: Survey Response Collection System

**Goal**: Build the resident-facing interface for responding to surveys created with our flexible survey builder.

## 🎯 Overview

Now that we have a comprehensive survey builder, we need to create the response collection system that allows residents to:
- Access surveys via links
- Fill out surveys with progress tracking
- Save drafts and resume later
- Submit final responses
- View confirmation and thank you pages

## 📋 Technical Requirements

### 1. Database Schema (Already Exists)

The `property_surveys` table is already set up to store flexible responses:

```sql
property_surveys {
  survey_id: UUID PRIMARY KEY
  survey_definition_id: UUID REFERENCES survey_definitions
  property_id: UUID REFERENCES properties  
  resident_id: UUID REFERENCES property_residents (optional)
  responses: JSONB                 -- Flexible response data
  response_status: TEXT            -- 'draft', 'submitted', 'reviewed', 'archived'
  completion_percentage: INTEGER   -- 0-100
  submitted_at: TIMESTAMPTZ
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
}
```

### 2. Response Data Structure

The `responses` JSONB field will store data like this:

```typescript
interface SurveyResponse {
  sections: {
    [sectionId: string]: {
      [questionId: string]: any  // Answer value (string, number, array, etc.)
    }
  }
  metadata: {
    started_at: string
    last_saved_at: string
    ip_address?: string
    user_agent?: string
    device_info?: string
  }
}

// Example:
{
  "sections": {
    "section_1": {
      "q1_preference": "Option A",
      "q2_rating": 4,
      "q3_comments": "Great service overall"
    },
    "section_2": {
      "q4_email": "resident@example.com",
      "q5_multiple": ["option1", "option3"]
    }
  },
  "metadata": {
    "started_at": "2025-01-27T10:00:00Z",
    "last_saved_at": "2025-01-27T10:15:00Z",
    "ip_address": "192.168.1.1"
  }
}
```

## 🚀 Implementation Plan

### Step 1: Core Response UI Components

#### A. Survey Response Page (`/surveys/[id]/respond`)
```typescript
interface SurveyRespondPage {
  // Load survey definition and existing response (if any)
  // Render questions based on survey_definition.response_schema
  // Handle draft saving and final submission
}
```

#### B. Question Renderer Components
Based on our survey builder question types:

```typescript
// Question renderers for each type
<TextQuestion question={q} value={responses[q.id]} onChange={updateResponse} />
<ChoiceQuestion question={q} value={responses[q.id]} onChange={updateResponse} />
<RatingQuestion question={q} value={responses[q.id]} onChange={updateResponse} />
<FileUploadQuestion question={q} value={responses[q.id]} onChange={updateResponse} />
<NumberQuestion question={q} value={responses[q.id]} onChange={updateResponse} />
<EmailQuestion question={q} value={responses[q.id]} onChange={updateResponse} />
<YesNoQuestion question={q} value={responses[q.id]} onChange={updateResponse} />
// etc.
```

#### C. Progress Tracking Component
```typescript
<SurveyProgress 
  currentSection={currentSection}
  totalSections={totalSections}
  completionPercentage={completionPercentage}
  onSectionClick={navigateToSection}
/>
```

### Step 2: API Endpoints

#### A. Get Survey for Responding
```typescript
// GET /api/surveys/[id]/respond
// Returns survey definition + existing response (if any)
{
  survey: SurveyDefinition,
  existingResponse?: PropertySurvey,
  propertyInfo?: Property  // For property-specific surveys
}
```

#### B. Save Draft Response
```typescript
// PUT /api/surveys/[id]/responses/[responseId]/draft
// Auto-save every 30 seconds or on blur
{
  responses: SurveyResponse,
  completion_percentage: number
}
```

#### C. Submit Final Response
```typescript
// POST /api/surveys/[id]/responses/[responseId]/submit
// Mark as submitted and validate completeness
{
  responses: SurveyResponse,
  completion_percentage: 100,
  response_status: 'submitted'
}
```

### Step 3: User Experience Features

#### A. Auto-Save Functionality
- Save draft every 30 seconds
- Save on question blur/change
- Show "Saving..." indicator
- Resume from where user left off

#### B. Validation System
- Client-side validation based on question config
- Required field validation
- Email format validation
- Number range validation
- Show validation errors clearly

#### C. Navigation & Progress
- Section-based navigation
- Progress bar showing completion
- "Previous" and "Next" buttons
- Jump to specific sections

#### D. Responsive Design
- Mobile-friendly interface
- Touch-friendly inputs
- Proper keyboard navigation
- Accessibility compliance

### Step 4: Access Control & Security

#### A. Survey Access Methods
1. **Public Link**: `/surveys/[id]/respond` (anyone with link)
2. **Property-Specific**: `/surveys/[id]/respond?property=[id]` (tied to property)
3. **Authenticated**: Require login for resident portal (future)

#### B. Duplicate Prevention
- Check for existing responses before allowing new ones
- Allow editing of draft responses
- Prevent multiple submissions (unless explicitly allowed)

#### C. Data Validation
- Sanitize all inputs
- Validate against survey definition schema
- Rate limiting on submissions

## 📊 Admin Response Management

### Step 5: Response Viewing & Management

#### A. Response List Page (`/surveys/[id]/responses`)
```typescript
interface ResponsesPage {
  // List all responses for a survey
  // Filter by status (draft, submitted, reviewed)
  // Export responses to CSV/Excel
  // Bulk operations (mark as reviewed, etc.)
}
```

#### B. Individual Response View (`/surveys/[id]/responses/[responseId]`)
```typescript
interface ResponseDetailPage {
  // View submitted response in readable format
  // Show response metadata (submission time, IP, etc.)
  // Allow admin to mark as reviewed
  // Link to property/resident information
}
```

#### C. Response Analytics Dashboard
```typescript
interface ResponseAnalytics {
  // Response rate by section/zone
  // Completion statistics
  // Question-by-question breakdown
  // Charts based on question types
}
```

## 🔧 File Structure

```
app/
├── surveys/
│   └── [id]/
│       ├── respond/
│       │   └── page.tsx              # Main response page
│       └── responses/
│           ├── page.tsx              # Response list
│           └── [responseId]/
│               └── page.tsx          # Individual response view
├── api/
│   └── surveys/
│       └── [id]/
│           ├── respond/
│           │   └── route.ts          # Get survey for responding
│           └── responses/
│               ├── route.ts          # List/create responses
│               └── [responseId]/
│                   ├── draft/
│                   │   └── route.ts  # Save draft
│                   ├── submit/
│                   │   └── route.ts  # Submit final
│                   └── route.ts      # Get/update response

components/
├── SurveyResponse/
│   ├── SurveyRespondPage.tsx         # Main response interface
│   ├── QuestionRenderer.tsx          # Dynamic question rendering
│   ├── SectionNavigation.tsx         # Section progress/navigation
│   ├── ProgressBar.tsx               # Completion progress
│   ├── AutoSave.tsx                  # Auto-save functionality
│   └── questions/                    # Individual question components
│       ├── TextQuestion.tsx
│       ├── ChoiceQuestion.tsx
│       ├── RatingQuestion.tsx
│       ├── FileUploadQuestion.tsx
│       └── ...
```

## 🎯 Success Metrics

### Phase 3B Completion Criteria:
1. ✅ Residents can access surveys via link
2. ✅ Progress tracking and section navigation
3. ✅ Auto-save draft functionality
4. ✅ Submit final responses with validation
5. ✅ Admins can view submitted responses
6. ✅ Response data stored in flexible JSONB format
7. ✅ Mobile-responsive interface
8. ✅ Basic response analytics

### Expected Timeline: 2-3 weeks
- Week 1: Core response UI and API endpoints
- Week 2: Progress tracking, validation, auto-save
- Week 3: Admin response viewing and analytics

This system will complete the survey lifecycle: Create → Respond → Analyze, making the platform fully functional for any type of survey!