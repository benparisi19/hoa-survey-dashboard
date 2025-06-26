-- ============================================================================
-- Property-Centric Foundation Schema
-- ============================================================================
-- Creates the foundation for property-based community management
-- Designed to work with master property list and official owner records

-- ============================================================================
-- Core Foundation Tables
-- ============================================================================

-- 1. Properties: Foundation table for all HOA operations
CREATE TABLE IF NOT EXISTS properties (
  property_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL UNIQUE,
  
  -- Internal organization system
  lot_number TEXT, -- Sequential numbering for internal reference
  hoa_zone TEXT NOT NULL, -- Geographic/maintenance zones: '1', '2', '3', etc.
  street_group TEXT, -- Street name for grouping: 'Goldstone', 'Hills', 'Blueberry', etc.
  
  -- Property characteristics
  property_type TEXT DEFAULT 'single_family' CHECK (property_type IN ('single_family', 'townhouse', 'condo')),
  square_footage INTEGER,
  lot_size_sqft INTEGER,
  year_built INTEGER,
  architectural_style TEXT,
  special_features JSONB, -- pools, sheds, courtyards, etc.
  
  -- Data management
  source TEXT DEFAULT 'master_list' CHECK (source IN ('master_list', 'survey', 'manual')),
  external_property_id TEXT, -- reference to HOA system if applicable
  notes TEXT, -- Admin notes about the property
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. People: Track individuals across properties (owners, residents, contacts)
CREATE TABLE IF NOT EXISTS people (
  person_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'text', 'mail')),
  -- Mailing address (for owners who live elsewhere)
  mailing_address TEXT,
  mailing_city TEXT,
  mailing_state TEXT,
  mailing_zip TEXT,
  is_official_owner BOOLEAN DEFAULT false, -- from master owner records
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Property Residents: Historical relationship tracking
CREATE TABLE IF NOT EXISTS property_residents (
  resident_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(person_id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('owner', 'renter', 'family_member', 'resident')),
  is_primary_contact BOOLEAN DEFAULT false,
  is_hoa_responsible BOOLEAN DEFAULT true, -- for dues/violations
  start_date DATE NOT NULL,
  end_date DATE, -- NULL for current residents
  move_in_reason TEXT,
  move_out_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Multi-Survey Platform Architecture
-- ============================================================================

-- 4. Survey Definitions: Template/metadata for different survey types
CREATE TABLE IF NOT EXISTS survey_definitions (
  survey_definition_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_name TEXT NOT NULL, -- 'Landscaping 2024', 'Annual Satisfaction', 'Emergency Preparedness'
  survey_type TEXT NOT NULL CHECK (survey_type IN ('property_specific', 'community_wide', 'demographic')),
  description TEXT,
  active_period_start DATE,
  active_period_end DATE,
  is_active BOOLEAN DEFAULT true,
  target_audience TEXT, -- 'all_residents', 'owners_only', 'specific_zone'
  response_schema JSONB NOT NULL, -- defines expected response structure
  display_config JSONB, -- UI configuration for response viewing/editing
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Property Surveys: Link surveys to properties (replaces current response tables)
CREATE TABLE IF NOT EXISTS property_surveys (
  survey_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_definition_id UUID NOT NULL REFERENCES survey_definitions(survey_definition_id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
  resident_id UUID REFERENCES property_residents(resident_id) ON DELETE SET NULL, -- who filled it out
  submitted_date TIMESTAMPTZ DEFAULT NOW(),
  is_anonymous BOOLEAN DEFAULT false,
  responses JSONB NOT NULL, -- flexible storage for any survey structure
  review_status TEXT DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed', 'in_progress', 'reviewed', 'flagged')),
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Properties
CREATE INDEX IF NOT EXISTS idx_properties_address ON properties(address);
CREATE INDEX IF NOT EXISTS idx_properties_zone ON properties(hoa_zone);
CREATE INDEX IF NOT EXISTS idx_properties_street_group ON properties(street_group);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_source ON properties(source);
CREATE INDEX IF NOT EXISTS idx_properties_lot ON properties(lot_number);

-- People
CREATE INDEX IF NOT EXISTS idx_people_name ON people(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_people_email ON people(email);
CREATE INDEX IF NOT EXISTS idx_people_owner ON people(is_official_owner);

-- Property Residents
CREATE INDEX IF NOT EXISTS idx_property_residents_property ON property_residents(property_id);
CREATE INDEX IF NOT EXISTS idx_property_residents_person ON property_residents(person_id);
CREATE INDEX IF NOT EXISTS idx_property_residents_current ON property_residents(property_id) WHERE end_date IS NULL;
CREATE INDEX IF NOT EXISTS idx_property_residents_primary ON property_residents(property_id, is_primary_contact) WHERE is_primary_contact = true;

-- Survey Definitions
CREATE INDEX IF NOT EXISTS idx_survey_definitions_active ON survey_definitions(is_active);
CREATE INDEX IF NOT EXISTS idx_survey_definitions_type ON survey_definitions(survey_type);

-- Property Surveys
CREATE INDEX IF NOT EXISTS idx_property_surveys_property ON property_surveys(property_id);
CREATE INDEX IF NOT EXISTS idx_property_surveys_definition ON property_surveys(survey_definition_id);
CREATE INDEX IF NOT EXISTS idx_property_surveys_status ON property_surveys(review_status);
CREATE INDEX IF NOT EXISTS idx_property_surveys_date ON property_surveys(submitted_date);

-- ============================================================================
-- Enable Row Level Security
-- ============================================================================

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_surveys ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for Admin Access
-- ============================================================================

-- Properties: Admins can view all
CREATE POLICY "Admins can view all properties" ON properties
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage properties" ON properties
  FOR ALL USING (is_admin());

-- People: Admins can view all
CREATE POLICY "Admins can view all people" ON people
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage people" ON people
  FOR ALL USING (is_admin());

-- Property Residents: Admins can view all
CREATE POLICY "Admins can view all property residents" ON property_residents
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage property residents" ON property_residents
  FOR ALL USING (is_admin());

-- Survey Definitions: Admins can manage
CREATE POLICY "Admins can view survey definitions" ON survey_definitions
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage survey definitions" ON survey_definitions
  FOR ALL USING (is_admin());

-- Property Surveys: Admins can view all
CREATE POLICY "Admins can view all property surveys" ON property_surveys
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can manage property surveys" ON property_surveys
  FOR ALL USING (is_admin());

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get current residents for a property
CREATE OR REPLACE FUNCTION get_current_residents(property_id UUID)
RETURNS TABLE (
  resident_id UUID,
  person_id UUID,
  full_name TEXT,
  relationship_type TEXT,
  is_primary_contact BOOLEAN,
  email TEXT,
  phone TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pr.resident_id,
    pr.person_id,
    CONCAT(p.first_name, ' ', p.last_name) as full_name,
    pr.relationship_type,
    pr.is_primary_contact,
    p.email,
    p.phone
  FROM property_residents pr
  JOIN people p ON p.person_id = pr.person_id
  WHERE pr.property_id = get_current_residents.property_id
    AND pr.end_date IS NULL
  ORDER BY pr.is_primary_contact DESC, p.last_name, p.first_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find properties with no survey responses for a specific survey
CREATE OR REPLACE FUNCTION get_non_participating_properties(survey_def_id UUID)
RETURNS TABLE (
  property_id UUID,
  address TEXT,
  lot_number TEXT,
  hoa_zone TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.property_id,
    p.address,
    p.lot_number,
    p.hoa_zone
  FROM properties p
  LEFT JOIN property_surveys ps ON ps.property_id = p.property_id 
    AND ps.survey_definition_id = survey_def_id
  WHERE ps.survey_id IS NULL
  ORDER BY p.hoa_zone, p.address;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Views for Common Queries
-- ============================================================================

-- Complete property information with current residents
CREATE OR REPLACE VIEW property_directory AS
SELECT 
  p.property_id,
  p.address,
  p.lot_number,
  p.hoa_zone,
  p.street_group,
  p.property_type,
  p.square_footage,
  p.year_built,
  p.special_features,
  -- Primary owner information
  owner.person_id as owner_person_id,
  CONCAT(owner.first_name, ' ', owner.last_name) as owner_name,
  owner.email as owner_email,
  owner.phone as owner_phone,
  owner.mailing_address as owner_mailing_address,
  -- Current resident count
  COALESCE(resident_count.count, 0) as current_resident_count,
  -- Survey participation
  survey_count.total_surveys,
  p.notes,
  p.created_at,
  p.updated_at
FROM properties p
-- Get primary owner
LEFT JOIN property_residents pr_owner ON pr_owner.property_id = p.property_id 
  AND pr_owner.relationship_type = 'owner' 
  AND pr_owner.is_primary_contact = true
  AND pr_owner.end_date IS NULL
LEFT JOIN people owner ON owner.person_id = pr_owner.person_id
-- Count current residents
LEFT JOIN (
  SELECT property_id, COUNT(*) as count
  FROM property_residents 
  WHERE end_date IS NULL 
  GROUP BY property_id
) resident_count ON resident_count.property_id = p.property_id
-- Count survey responses
LEFT JOIN (
  SELECT property_id, COUNT(*) as total_surveys
  FROM property_surveys
  GROUP BY property_id
) survey_count ON survey_count.property_id = p.property_id;

-- Survey participation summary
CREATE OR REPLACE VIEW survey_participation_summary AS
SELECT 
  sd.survey_definition_id,
  sd.survey_name,
  sd.survey_type,
  sd.active_period_start,
  sd.active_period_end,
  COUNT(ps.survey_id) as total_responses,
  COUNT(DISTINCT ps.property_id) as properties_participated,
  (SELECT COUNT(*) FROM properties) as total_properties,
  ROUND(
    COUNT(DISTINCT ps.property_id)::DECIMAL / (SELECT COUNT(*) FROM properties) * 100, 
    2
  ) as participation_rate_percent
FROM survey_definitions sd
LEFT JOIN property_surveys ps ON ps.survey_definition_id = sd.survey_definition_id
GROUP BY sd.survey_definition_id, sd.survey_name, sd.survey_type, sd.active_period_start, sd.active_period_end
ORDER BY sd.created_at DESC;

-- Comments for documentation
COMMENT ON TABLE properties IS 'Foundation table for all HOA operations - canonical property directory';
COMMENT ON TABLE people IS 'Individuals involved with properties - owners, residents, contacts';
COMMENT ON TABLE property_residents IS 'Historical tracking of people-property relationships with move-in/out dates';
COMMENT ON TABLE survey_definitions IS 'Templates and metadata for different survey types (landscaping, satisfaction, etc.)';
COMMENT ON TABLE property_surveys IS 'Flexible storage for survey responses linked to specific properties';

COMMENT ON VIEW property_directory IS 'Complete property information with current residents and survey participation';
COMMENT ON VIEW survey_participation_summary IS 'Summary of participation rates across all surveys';