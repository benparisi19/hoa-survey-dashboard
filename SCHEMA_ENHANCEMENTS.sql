-- =====================================================
-- PHASE 3: ESSENTIAL SCHEMA ENHANCEMENTS
-- Google Forms-Style Survey Builder Support
-- =====================================================

-- Execute this entire file in the Supabase SQL Editor
-- Safe to run - only adds new columns and features

BEGIN;

-- =====================================================
-- 1. RESPONSE STATUS & PROGRESS TRACKING
-- =====================================================

-- Add response status and progress tracking to property_surveys
ALTER TABLE property_surveys 
ADD COLUMN IF NOT EXISTS response_status TEXT DEFAULT 'draft' 
  CHECK (response_status IN ('draft', 'submitted', 'reviewed', 'archived')),
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 
  CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
ADD COLUMN IF NOT EXISTS last_section_completed TEXT,
ADD COLUMN IF NOT EXISTS time_spent_minutes INTEGER DEFAULT 0;

-- Add comment explaining the status workflow
COMMENT ON COLUMN property_surveys.response_status IS 
'Response workflow: draft (being filled) → submitted (ready for review) → reviewed (admin approved) → archived (historical)';

-- =====================================================
-- 2. SURVEY TEMPLATES & VERSIONING
-- =====================================================

-- Add template and versioning support to survey_definitions
ALTER TABLE survey_definitions
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_category TEXT,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS parent_survey_id UUID REFERENCES survey_definitions(survey_definition_id),
ADD COLUMN IF NOT EXISTS auto_recurring BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_config JSONB;

-- Add comments for new fields
COMMENT ON COLUMN survey_definitions.is_template IS 
'True if this is a reusable template, false if this is an active survey';

COMMENT ON COLUMN survey_definitions.template_category IS 
'Category for templates: satisfaction, maintenance, emergency, community, etc.';

COMMENT ON COLUMN survey_definitions.recurrence_config IS 
'JSON config for auto-recurring surveys: {frequency: "annual", next_date: "2025-01-01", auto_create: true}';

-- =====================================================
-- 3. ENHANCED SURVEY TARGETING
-- =====================================================

-- Replace simple target_audience with structured targeting
-- First check if we need to preserve existing data
DO $$
BEGIN
  -- Check if target_audience has any non-null values
  IF EXISTS (SELECT 1 FROM survey_definitions WHERE target_audience IS NOT NULL) THEN
    -- Migrate existing target_audience to new structure
    UPDATE survey_definitions 
    SET targeting_config = jsonb_build_object(
      'type', 'simple_text',
      'description', target_audience
    )
    WHERE target_audience IS NOT NULL;
  END IF;
END $$;

-- Add new targeting config column
ALTER TABLE survey_definitions
ADD COLUMN IF NOT EXISTS targeting_config JSONB DEFAULT '{"type": "all_properties"}'::jsonb;

-- Add comment for targeting config
COMMENT ON COLUMN survey_definitions.targeting_config IS 
'JSON config for survey targeting: {type: "property_filter", criteria: {zones: ["A"], property_types: ["single_family"]}}';

-- =====================================================
-- 4. SURVEY FILE UPLOADS SUPPORT
-- =====================================================

-- Create table for survey file uploads (for file upload question types)
CREATE TABLE IF NOT EXISTS survey_file_uploads (
  upload_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES property_surveys(survey_id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  content_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment
COMMENT ON TABLE survey_file_uploads IS 
'Stores file uploads for survey questions of type "file_upload"';

-- =====================================================
-- 5. PERFORMANCE INDEXES
-- =====================================================

-- Index for response status queries
CREATE INDEX IF NOT EXISTS idx_property_surveys_status 
ON property_surveys(response_status);

-- Index for survey definition lookups
CREATE INDEX IF NOT EXISTS idx_property_surveys_survey_def 
ON property_surveys(survey_definition_id, response_status);

-- Index for property-based queries
CREATE INDEX IF NOT EXISTS idx_property_surveys_property 
ON property_surveys(property_id, response_status);

-- GIN indexes for JSONB response queries (for dynamic filtering)
CREATE INDEX IF NOT EXISTS idx_property_surveys_responses_gin 
ON property_surveys USING GIN (responses);

-- Index for targeting config queries
CREATE INDEX IF NOT EXISTS idx_survey_definitions_targeting 
ON survey_definitions USING GIN (targeting_config);

-- Index for template queries
CREATE INDEX IF NOT EXISTS idx_survey_definitions_templates 
ON survey_definitions(is_template, template_category) 
WHERE is_template = true;

-- Index for active surveys
CREATE INDEX IF NOT EXISTS idx_survey_definitions_active 
ON survey_definitions(is_active, active_period_start, active_period_end) 
WHERE is_active = true;

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function to get active surveys for a property
CREATE OR REPLACE FUNCTION get_active_surveys_for_property(
  input_property_id UUID
)
RETURNS TABLE (
  survey_definition_id UUID,
  survey_name TEXT,
  survey_type TEXT,
  active_period_end TIMESTAMPTZ,
  has_response BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sd.survey_definition_id,
    sd.survey_name,
    sd.survey_type,
    sd.active_period_end,
    (ps.survey_id IS NOT NULL) as has_response
  FROM survey_definitions sd
  LEFT JOIN property_surveys ps ON (
    sd.survey_definition_id = ps.survey_definition_id 
    AND ps.property_id = input_property_id
    AND ps.response_status != 'archived'
  )
  WHERE sd.is_active = true
    AND sd.is_template = false
    AND (sd.active_period_end IS NULL OR sd.active_period_end > NOW())
  ORDER BY sd.created_at DESC;
END;
$$;

-- Function to calculate survey completion statistics
CREATE OR REPLACE FUNCTION get_survey_participation_stats(
  input_survey_definition_id UUID
)
RETURNS TABLE (
  total_properties BIGINT,
  properties_with_responses BIGINT,
  total_responses BIGINT,
  completed_responses BIGINT,
  participation_rate NUMERIC,
  completion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER  
AS $$
BEGIN
  RETURN QUERY
  WITH survey_stats AS (
    SELECT 
      COUNT(DISTINCT p.property_id) as total_props,
      COUNT(DISTINCT ps.property_id) as props_with_responses,
      COUNT(ps.survey_id) as total_resp,
      COUNT(ps.survey_id) FILTER (WHERE ps.response_status IN ('submitted', 'reviewed')) as completed_resp
    FROM properties p
    LEFT JOIN property_surveys ps ON (
      p.property_id = ps.property_id 
      AND ps.survey_definition_id = input_survey_definition_id
    )
  )
  SELECT 
    total_props,
    props_with_responses,
    total_resp,
    completed_resp,
    CASE 
      WHEN total_props > 0 THEN ROUND((props_with_responses::NUMERIC / total_props) * 100, 2)
      ELSE 0 
    END as participation_rate,
    CASE 
      WHEN total_resp > 0 THEN ROUND((completed_resp::NUMERIC / total_resp) * 100, 2)
      ELSE 0 
    END as completion_rate
  FROM survey_stats;
END;
$$;

-- Function to duplicate a survey definition (for templates and recurring)
CREATE OR REPLACE FUNCTION duplicate_survey_definition(
  source_survey_id UUID,
  new_name TEXT,
  new_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_survey_id UUID;
BEGIN
  INSERT INTO survey_definitions (
    survey_name,
    survey_type,
    description,
    response_schema,
    display_config,
    targeting_config,
    is_active,
    is_template,
    template_category,
    parent_survey_id,
    created_by
  )
  SELECT 
    new_name,
    survey_type,
    COALESCE(new_description, description),
    response_schema,
    display_config,
    targeting_config,
    false, -- New surveys start inactive
    false, -- Duplicates are not templates
    template_category,
    source_survey_id, -- Link back to source
    created_by
  FROM survey_definitions
  WHERE survey_definition_id = source_survey_id
  RETURNING survey_definition_id INTO new_survey_id;
  
  RETURN new_survey_id;
END;
$$;

-- =====================================================
-- 7. UPDATE EXISTING VIEWS FOR NEW SCHEMA
-- =====================================================

-- Update survey_participation_summary view to include new fields
DROP VIEW IF EXISTS survey_participation_summary;
CREATE VIEW survey_participation_summary AS
SELECT 
  sd.survey_definition_id,
  sd.survey_name,
  sd.survey_type,
  sd.is_template,
  sd.template_category,
  sd.active_period_start,
  sd.active_period_end,
  COUNT(DISTINCT p.property_id) as total_properties,
  COUNT(DISTINCT ps.property_id) as properties_participated,
  COUNT(ps.survey_id) as total_responses,
  COUNT(ps.survey_id) FILTER (WHERE ps.response_status IN ('submitted', 'reviewed')) as completed_responses,
  CASE 
    WHEN COUNT(DISTINCT p.property_id) > 0 
    THEN ROUND((COUNT(DISTINCT ps.property_id)::NUMERIC / COUNT(DISTINCT p.property_id)) * 100, 2)
    ELSE 0 
  END as participation_rate_percent
FROM survey_definitions sd
CROSS JOIN properties p
LEFT JOIN property_surveys ps ON (
  sd.survey_definition_id = ps.survey_definition_id 
  AND p.property_id = ps.property_id
)
WHERE sd.is_template = false
GROUP BY sd.survey_definition_id, sd.survey_name, sd.survey_type, sd.is_template, 
         sd.template_category, sd.active_period_start, sd.active_period_end;

-- =====================================================
-- 8. ROW LEVEL SECURITY UPDATES
-- =====================================================

-- Enable RLS on new table
ALTER TABLE survey_file_uploads ENABLE ROW LEVEL SECURITY;

-- Policy for survey file uploads (admins only)
CREATE POLICY "Admins can manage survey file uploads" ON survey_file_uploads
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
    )
  );

-- =====================================================
-- 9. SEED DATA FOR TESTING
-- =====================================================

-- Create a sample survey template for testing
INSERT INTO survey_definitions (
  survey_name,
  survey_type, 
  description,
  response_schema,
  display_config,
  targeting_config,
  is_active,
  is_template,
  template_category
) VALUES (
  'Annual Community Satisfaction Template',
  'property_specific',
  'Template for annual resident satisfaction surveys',
  '{
    "sections": [
      {
        "id": "satisfaction",
        "title": "Overall Satisfaction",
        "questions": [
          {
            "id": "overall_rating",
            "type": "rating_scale", 
            "text": "How satisfied are you with living in our community?",
            "required": true,
            "config": {
              "scale": {"min": 1, "max": 5},
              "labels": {"1": "Very Dissatisfied", "5": "Very Satisfied"}
            }
          },
          {
            "id": "recommend",
            "type": "single_choice",
            "text": "Would you recommend our community to others?",
            "required": true,
            "options": [
              {"value": "yes", "label": "Yes, definitely"},
              {"value": "maybe", "label": "Maybe"},
              {"value": "no", "label": "No, probably not"}
            ]
          }
        ]
      },
      {
        "id": "feedback",
        "title": "Feedback & Suggestions",
        "questions": [
          {
            "id": "improvements",
            "type": "long_text",
            "text": "What improvements would you like to see in our community?",
            "required": false,
            "config": {
              "placeholder": "Please share your suggestions..."
            }
          }
        ]
      }
    ]
  }'::jsonb,
  '{
    "theme": "community",
    "layout": "sections",
    "showProgress": true,
    "allowSave": true
  }'::jsonb,
  '{"type": "all_properties"}'::jsonb,
  false,
  true,
  'satisfaction'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify the changes were applied successfully
DO $$
BEGIN
  -- Check if new columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'property_surveys' AND column_name = 'response_status'
  ) THEN
    RAISE EXCEPTION 'Failed to add response_status column to property_surveys';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'survey_definitions' AND column_name = 'is_template'
  ) THEN
    RAISE EXCEPTION 'Failed to add is_template column to survey_definitions';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'survey_file_uploads'
  ) THEN
    RAISE EXCEPTION 'Failed to create survey_file_uploads table';
  END IF;
  
  RAISE NOTICE 'Schema enhancements applied successfully!';
END $$;

COMMIT;

-- =====================================================
-- POST-MIGRATION NOTES
-- =====================================================

/*
SCHEMA ENHANCEMENTS SUMMARY:
=============================

1. ✅ Response Status & Progress Tracking
   - Added response_status (draft/submitted/reviewed/archived)
   - Added completion_percentage and progress tracking
   - Enables save-as-draft functionality

2. ✅ Survey Templates & Versioning  
   - Added is_template, template_category for reusable templates
   - Added version and parent_survey_id for survey evolution
   - Added auto_recurring and recurrence_config for scheduled surveys

3. ✅ Enhanced Targeting
   - Replaced target_audience with structured targeting_config JSONB
   - Supports complex property filtering and targeting rules

4. ✅ File Upload Support
   - Created survey_file_uploads table for file question types
   - Links to survey responses with question-level granularity

5. ✅ Performance Optimization
   - Added GIN indexes for JSONB queries
   - Added status and relationship indexes
   - Optimized for survey builder and analysis queries

6. ✅ Helper Functions
   - get_active_surveys_for_property(): Find available surveys
   - get_survey_participation_stats(): Calculate survey metrics  
   - duplicate_survey_definition(): Clone surveys/templates

7. ✅ Updated Views
   - Enhanced survey_participation_summary with new fields
   - Maintains backward compatibility

8. ✅ Security & Testing
   - RLS policies for new tables
   - Sample template for testing
   - Verification queries

NEXT STEPS:
===========
- Run this SQL in Supabase SQL Editor
- Update TypeScript types to reflect new schema
- Build Google Forms-style survey builder
- Test with sample surveys before migrating legacy data
*/