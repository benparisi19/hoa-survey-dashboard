# Database Schema Analysis & Refinement for Phase 3

## 🔍 **Current Schema Deep Dive**

Based on the existing `supabase.ts` schema, let's analyze whether the current flexible survey tables fully support our refined Google Forms-style vision.

### **Existing Survey Tables Analysis**

#### **`survey_definitions` Table**
```typescript
survey_definitions: {
  survey_definition_id: string,
  survey_name: string,              // ✅ Good: "Annual Satisfaction 2025"
  survey_type: string,              // ✅ Good: "property_specific", "community_wide"
  description: string | null,       // ✅ Good: User-friendly description
  response_schema: Json,            // 🎯 CRITICAL: This stores the flexible survey structure
  display_config: Json | null,     // 🎯 CRITICAL: UI rendering configuration  
  is_active: boolean | null,        // ✅ Good: Enable/disable surveys
  active_period_start: string | null, // ✅ Good: Survey scheduling
  active_period_end: string | null,   // ✅ Good: Survey scheduling
  target_audience: string | null,   // ⚠️  QUESTION: Is text field sufficient for targeting?
  created_by: string | null,        // ✅ Good: Admin tracking
  created_at/updated_at: string     // ✅ Good: Audit trail
}
```

#### **`property_surveys` Table**
```typescript
property_surveys: {
  survey_id: string,
  survey_definition_id: string,    // ✅ Good: Links to survey definition
  property_id: string,             // ✅ Good: Property-centric approach
  resident_id: string | null,      // ✅ Good: Optional resident attribution
  responses: Json,                 // 🎯 CRITICAL: Flexible response storage
  review_status: string | null,    // ✅ Good: Review workflow support
  reviewed_by: string | null,      // ✅ Good: Admin workflow
  reviewed_at: string | null,      // ✅ Good: Audit trail
  submitted_date: string | null,   // ✅ Good: Response timing
  is_anonymous: boolean | null,    // ✅ Good: Privacy support
  notes: string | null,            // ✅ Good: Admin notes
  created_at/updated_at: string    // ✅ Good: Audit trail
}
```

---

## 🎯 **Google Forms Feature Requirements Analysis**

Let me map our Google Forms-style requirements against the current schema:

### **✅ FULLY SUPPORTED Features**

#### **Basic Question Types**
- **Short Text/Long Text**: `response_schema.questions[].type: "short_text" | "long_text"`
- **Multiple Choice**: `response_schema.questions[].type: "single_choice"` 
- **Checkboxes**: `response_schema.questions[].type: "multiple_choice"`
- **Rating Scales**: `response_schema.questions[].type: "rating_scale"`
- **Yes/No**: `response_schema.questions[].type: "yes_no"`

#### **Survey Organization**
- **Sections**: `response_schema.sections[]`
- **Question Ordering**: Array order in JSON
- **Required Fields**: `response_schema.questions[].required: boolean`

#### **Response Management** 
- **Flexible Storage**: `property_surveys.responses` JSONB can store any structure
- **Review Workflow**: `review_status`, `reviewed_by`, `reviewed_at`
- **Property Association**: Built-in `property_id` linking

#### **Admin Features**
- **Survey Scheduling**: `active_period_start/end`
- **Survey Status**: `is_active`
- **Creator Tracking**: `created_by`

### **⚠️ POTENTIALLY INSUFFICIENT Features**

#### **1. Conditional Logic & Branching**
```json
// Current approach in response_schema:
{
  "questions": [
    {
      "id": "q3_reasons", 
      "conditional": {"question": "q1_preference", "value": "opt_out"}
    }
  ]
}
```
**Analysis**: Simple conditionals work, but complex multi-condition logic might be challenging.

**Google Forms Supports**:
- "Show question if Q1 = 'Yes' AND Q2 contains 'Other'"  
- "Skip to section 3 if Q5 = 'Not Applicable'"
- Multiple condition operators (equals, contains, greater than, etc.)

**Potential Enhancement**:
```json
{
  "conditional": {
    "operator": "AND",
    "conditions": [
      {"question": "q1", "operator": "equals", "value": "yes"},
      {"question": "q2", "operator": "contains", "value": "other"}
    ]
  }
}
```

#### **2. Advanced Question Types**
**Missing from Current Schema**:
- **File Upload**: Upload PDFs, images, documents
- **Date/Time Picker**: Specific date/time selection
- **Number Input**: Numeric input with validation
- **Email/Phone**: Input with format validation
- **Address**: Structured address input
- **Grid Questions**: Matrix of rating scales

**Could Be Added**:
```json
{
  "type": "file_upload",
  "config": {
    "allowedTypes": [".pdf", ".jpg", ".png"],
    "maxSize": "10MB",
    "multiple": false
  }
}
```

#### **3. Survey Targeting & Distribution**
**Current**: `target_audience: string | null` (just text)

**Enhanced Targeting Needed**:
```json
{
  "target_audience": {
    "type": "property_filter",
    "criteria": {
      "zones": ["Zone A", "Zone B"],
      "property_types": ["single_family"],
      "resident_count": {"min": 1},
      "exclude_properties": ["prop_123", "prop_456"]
    }
  }
}
```

#### **4. Response Validation & Data Quality**
**Missing**: Field-level validation rules

**Enhancement Needed**:
```json
{
  "questions": [
    {
      "type": "short_text",
      "validation": {
        "required": true,
        "minLength": 5,
        "maxLength": 100,
        "pattern": "^[A-Za-z\\s]+$"
      }
    },
    {
      "type": "number",
      "validation": {
        "min": 1,
        "max": 10,
        "integer": true
      }
    }
  ]
}
```

#### **5. Survey Versioning & Updates**
**Current Schema Issue**: What happens if we need to update a survey after responses exist?

**Potential Solutions**:
1. **Version Field**: Add `version: number` to `survey_definitions`
2. **Immutable Approach**: Create new definition, link responses to specific version
3. **Schema Evolution**: Track changes and handle migration

#### **6. Response Status & Progress Tracking**
**Missing**: Partial response support

**Enhancement**:
```json
// Add to property_surveys:
{
  "response_status": "draft" | "submitted" | "reviewed",
  "completion_percentage": 75,
  "last_question_answered": "q7_equipment"
}
```

#### **7. Survey Templates & Duplication**
**Missing**: Template system for survey reuse

**Enhancement**: 
```json
// Add to survey_definitions:
{
  "is_template": boolean,
  "template_category": "satisfaction" | "maintenance" | "emergency",
  "derived_from_template": "template_id"
}
```

#### **8. Auto-Recurring Surveys**
**Missing**: Automatic survey duplication

**Enhancement**:
```json
// Add to survey_definitions:
{
  "recurrence": {
    "enabled": true,
    "frequency": "annual" | "quarterly" | "monthly",
    "next_occurrence": "2025-01-01",
    "auto_create": true
  }
}
```

---

## 🛠️ **RECOMMENDED SCHEMA ENHANCEMENTS**

### **Priority 1: Essential for Google Forms Functionality**

#### **Enhanced Question Types**
```sql
-- Add support for more question types in response_schema
-- No schema change needed - just expand the JSON structure

-- Example enhanced response_schema:
{
  "sections": [
    {
      "questions": [
        {
          "type": "file_upload",
          "config": {"allowedTypes": [".pdf"], "maxSize": "10MB"}
        },
        {
          "type": "number", 
          "validation": {"min": 1, "max": 100}
        },
        {
          "type": "email",
          "validation": {"format": "email"}
        }
      ]
    }
  ]
}
```

#### **Enhanced Conditional Logic**
```json
// More powerful conditional logic in response_schema
{
  "conditional": {
    "operator": "AND",
    "conditions": [
      {"question": "q1", "operator": "equals", "value": "yes"},
      {"question": "q2", "operator": "greater_than", "value": 3}
    ],
    "action": "show" | "hide" | "skip_to_section"
  }
}
```

#### **Response Status Tracking**
```sql
-- Add columns to property_surveys
ALTER TABLE property_surveys 
ADD COLUMN response_status TEXT DEFAULT 'draft' CHECK (response_status IN ('draft', 'submitted', 'reviewed', 'archived')),
ADD COLUMN completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
ADD COLUMN last_section_completed TEXT;
```

### **Priority 2: Enhanced Targeting & Management**

#### **Advanced Targeting**
```sql
-- Replace simple target_audience with structured targeting
ALTER TABLE survey_definitions 
DROP COLUMN target_audience,
ADD COLUMN targeting_config JSONB;

-- Example targeting_config:
{
  "type": "property_filter",
  "criteria": {
    "zones": ["Zone A"],
    "property_types": ["single_family"], 
    "min_residents": 1,
    "exclude_previous_participants": true
  }
}
```

#### **Survey Templates & Versioning**
```sql
-- Add template and versioning support
ALTER TABLE survey_definitions
ADD COLUMN is_template BOOLEAN DEFAULT false,
ADD COLUMN template_category TEXT,
ADD COLUMN version INTEGER DEFAULT 1,
ADD COLUMN parent_survey_id UUID REFERENCES survey_definitions(survey_definition_id);
```

### **Priority 3: Advanced Features**

#### **Auto-Recurring Surveys**
```sql
-- Add recurrence support
ALTER TABLE survey_definitions
ADD COLUMN recurrence_config JSONB;

-- Example recurrence_config:
{
  "enabled": true,
  "frequency": "annual",
  "next_occurrence": "2025-01-01", 
  "auto_create": true,
  "notification_days_before": 30
}
```

#### **File Upload Support**
```sql
-- Create table for survey file uploads
CREATE TABLE survey_file_uploads (
  upload_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES property_surveys(survey_id),
  question_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 **RECOMMENDED IMPLEMENTATION APPROACH**

### **Phase 1: Builder-First Development (Recommended)**

#### **Week 1-2: Core Builder with Current Schema**
- Build Google Forms-style survey builder using existing `response_schema` structure
- Support basic question types (text, choice, rating, yes/no)
- Test with simple conditional logic
- **Goal**: Validate the core approach without touching legacy data

#### **Week 3-4: Enhanced Question Types** 
- Add file upload, number, email, date question types
- Implement advanced validation rules
- Test with complex survey structures
- **Goal**: Prove the schema can handle Google Forms complexity

#### **Week 5-6: Schema Refinements**
- Based on builder testing, implement Priority 1 schema enhancements
- Add response status tracking
- Enhance conditional logic support
- **Goal**: Optimize schema based on real usage

### **Phase 2: Legacy Migration (After Builder Validation)**
- Create the landscaping survey definition using the builder
- Migrate existing responses to new flexible format
- Run both systems in parallel for validation
- **Goal**: Preserve existing functionality while gaining flexibility

### **Phase 3: Advanced Features**
- Cross-survey analytics
- Auto-recurring surveys  
- Advanced targeting
- **Goal**: Full multi-survey platform

---

## 🤔 **KEY DECISIONS NEEDED**

### **1. Schema Enhancement Priority**
Which enhancements should we implement before starting the builder?
- **Minimal**: Use current schema, enhance later
- **Essential**: Add response status tracking and advanced question types
- **Comprehensive**: Implement all Priority 1 & 2 enhancements

### **2. File Upload Strategy**
How should we handle file uploads in surveys?
- **Simple**: Store file paths in response JSONB
- **Structured**: Separate `survey_file_uploads` table
- **Cloud**: Direct upload to cloud storage with URLs

### **3. Conditional Logic Complexity**
How complex should conditional logic be in V1?
- **Basic**: Simple field = value conditions
- **Intermediate**: AND/OR with multiple conditions
- **Advanced**: Complex expressions with skip logic

### **4. Migration Timeline**
When should we migrate legacy data?
- **Immediate**: Migrate before building new features
- **Parallel**: Build new system, migrate when ready
- **Gradual**: Feature flag approach with both systems

---

## 💡 **RECOMMENDATION**

**Start with the Builder using current schema + minimal enhancements**:

1. **Implement Priority 1 enhancements** (response status, advanced question types)
2. **Build Google Forms-style survey builder** 
3. **Test thoroughly with new surveys**
4. **Refine schema based on testing**
5. **Then migrate legacy data**

This approach minimizes risk to existing data while validating our design assumptions with real usage.

**What do you think? Should we proceed with this builder-first approach?**