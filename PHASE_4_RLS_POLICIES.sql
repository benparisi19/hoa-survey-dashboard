-- Phase 4: Row Level Security Policies Update
-- This script updates RLS policies to properly use auth.uid() for authenticated users

-- Enable RLS on all relevant tables (if not already enabled)
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_access_audit ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate with proper auth.uid())
DROP POLICY IF EXISTS "Residents can view own property data" ON property_residents;
DROP POLICY IF EXISTS "Owners can view their property residents" ON property_residents;

-- =============================================================================
-- PEOPLE TABLE POLICIES
-- =============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON people
  FOR SELECT USING (
    auth_user_id = auth.uid()
  );

-- Users can update their own profile (except auth fields)
CREATE POLICY "Users can update own profile" ON people
  FOR UPDATE USING (
    auth_user_id = auth.uid()
  );

-- HOA admins can view all people
CREATE POLICY "HOA admins can view all people" ON people
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
      AND account_type = 'hoa_admin'
    )
  );

-- =============================================================================
-- PROPERTY_RESIDENTS TABLE POLICIES
-- =============================================================================

-- Residents can view their own property relationships
CREATE POLICY "Residents view own properties" ON property_residents
  FOR SELECT USING (
    person_id IN (
      SELECT person_id FROM people 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Property owners can view all residents of their properties
CREATE POLICY "Owners view property residents" ON property_residents
  FOR SELECT USING (
    property_id IN (
      SELECT pr.property_id 
      FROM property_residents pr
      JOIN people p ON p.person_id = pr.person_id
      WHERE p.auth_user_id = auth.uid()
      AND pr.relationship_type = 'owner'
      AND pr.end_date IS NULL
    )
  );

-- HOA admins can view all property residents
CREATE POLICY "HOA admins view all residents" ON property_residents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
      AND account_type = 'hoa_admin'
    )
  );

-- =============================================================================
-- PROPERTIES TABLE POLICIES
-- =============================================================================

-- Users can view properties they have access to
CREATE POLICY "Users view accessible properties" ON properties
  FOR SELECT USING (
    property_id IN (
      SELECT pr.property_id 
      FROM property_residents pr
      JOIN people p ON p.person_id = pr.person_id
      WHERE p.auth_user_id = auth.uid()
      AND pr.end_date IS NULL
    )
  );

-- HOA admins can view all properties
CREATE POLICY "HOA admins view all properties" ON properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
      AND account_type = 'hoa_admin'
    )
  );

-- =============================================================================
-- PROPERTY_OWNERSHIP TABLE POLICIES
-- =============================================================================

-- Owners can view their own ownership records
CREATE POLICY "Owners view own ownership" ON property_ownership
  FOR SELECT USING (
    owner_id IN (
      SELECT person_id FROM people 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Owners can view co-owners of their properties
CREATE POLICY "Owners view co-owners" ON property_ownership
  FOR SELECT USING (
    property_id IN (
      SELECT po.property_id 
      FROM property_ownership po
      JOIN people p ON p.person_id = po.owner_id
      WHERE p.auth_user_id = auth.uid()
      AND (po.ownership_end_date IS NULL OR po.ownership_end_date > CURRENT_DATE)
    )
  );

-- HOA admins can view and manage all ownership
CREATE POLICY "HOA admins manage ownership" ON property_ownership
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
      AND account_type = 'hoa_admin'
    )
  );

-- =============================================================================
-- PROPERTY_MANAGEMENT TABLE POLICIES
-- =============================================================================

-- Property managers can view their own management records
CREATE POLICY "Managers view own management" ON property_management
  FOR SELECT USING (
    manager_id IN (
      SELECT person_id FROM people 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Property owners can view managers for their properties
CREATE POLICY "Owners view property managers" ON property_management
  FOR SELECT USING (
    property_id IN (
      SELECT po.property_id 
      FROM property_ownership po
      JOIN people p ON p.person_id = po.owner_id
      WHERE p.auth_user_id = auth.uid()
      AND (po.ownership_end_date IS NULL OR po.ownership_end_date > CURRENT_DATE)
    )
  );

-- HOA admins can manage all property management
CREATE POLICY "HOA admins manage property management" ON property_management
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
      AND account_type = 'hoa_admin'
    )
  );

-- =============================================================================
-- PROPERTY_INVITATIONS TABLE POLICIES
-- =============================================================================

-- Users can view invitations they sent
CREATE POLICY "Users view sent invitations" ON property_invitations
  FOR SELECT USING (
    invited_by IN (
      SELECT person_id FROM people 
      WHERE auth_user_id = auth.uid()
    )
  );

-- Users who can invite others can create invitations
CREATE POLICY "Authorized users create invitations" ON property_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM property_residents pr
      JOIN people p ON p.person_id = pr.person_id
      WHERE p.auth_user_id = auth.uid()
      AND pr.property_id = property_invitations.property_id
      AND pr.can_invite_others = true
      AND pr.end_date IS NULL
    )
  );

-- =============================================================================
-- PROPERTY_ACCESS_REQUESTS TABLE POLICIES
-- =============================================================================

-- Public can create access requests (no auth required)
CREATE POLICY "Anyone can create access requests" ON property_access_requests
  FOR INSERT WITH CHECK (true);

-- HOA admins can view and manage all requests
CREATE POLICY "HOA admins manage access requests" ON property_access_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
      AND account_type = 'hoa_admin'
    )
  );

-- =============================================================================
-- PROPERTY_ACCESS_AUDIT TABLE POLICIES
-- =============================================================================

-- Users can view audit logs for their accessible properties
CREATE POLICY "Users view property audit logs" ON property_access_audit
  FOR SELECT USING (
    property_id IN (
      SELECT pr.property_id 
      FROM property_residents pr
      JOIN people p ON p.person_id = pr.person_id
      WHERE p.auth_user_id = auth.uid()
      AND pr.end_date IS NULL
    )
  );

-- HOA admins can view all audit logs
CREATE POLICY "HOA admins view all audit logs" ON property_access_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
      AND account_type = 'hoa_admin'
    )
  );

-- =============================================================================
-- SURVEY TABLES POLICIES
-- =============================================================================

-- Enable RLS on survey tables
ALTER TABLE survey_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_surveys ENABLE ROW LEVEL SECURITY;

-- Users can view active surveys
CREATE POLICY "Users view active surveys" ON survey_definitions
  FOR SELECT USING (
    is_active = true
  );

-- Users can view and submit surveys for their properties
CREATE POLICY "Users manage own property surveys" ON property_surveys
  FOR ALL USING (
    property_id IN (
      SELECT pr.property_id 
      FROM property_residents pr
      JOIN people p ON p.person_id = pr.person_id
      WHERE p.auth_user_id = auth.uid()
      AND pr.end_date IS NULL
      AND pr.permissions ? 'survey_access'
    )
  );

-- HOA admins can manage all surveys
CREATE POLICY "HOA admins manage all surveys" ON property_surveys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
      AND account_type = 'hoa_admin'
    )
  );

-- =============================================================================
-- HELPER FUNCTION FOR GETTING USER'S ACCESSIBLE PROPERTIES
-- =============================================================================

-- Update the function to use auth.uid() directly
CREATE OR REPLACE FUNCTION get_user_accessible_properties(user_auth_id UUID)
RETURNS TABLE (
  property_id UUID,
  address TEXT,
  hoa_zone TEXT,
  access_type TEXT,
  permissions JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.property_id,
    p.address,
    p.hoa_zone,
    CASE 
      WHEN pr.relationship_type = 'owner' THEN 'owner'
      WHEN pr.relationship_type IN ('property_manager', 'hoa_manager') THEN 'manager'
      ELSE 'resident'
    END as access_type,
    COALESCE(pr.permissions, '{}'::JSONB) as permissions
  FROM property_residents pr
  JOIN properties p ON p.property_id = pr.property_id
  JOIN people per ON per.person_id = pr.person_id
  WHERE per.auth_user_id = user_auth_id
    AND pr.end_date IS NULL
    AND pr.verification_status = 'verified'
  ORDER BY p.address;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_accessible_properties TO authenticated;

-- =============================================================================
-- SERVICE ROLE BYPASS
-- =============================================================================

-- Service role (using service key) bypasses all RLS policies
-- This is automatic in Supabase when using the service key

-- =============================================================================
-- NOTES
-- =============================================================================

-- 1. All policies use auth.uid() to get the current authenticated user
-- 2. HOA admin check is repeated in each policy for clarity and performance
-- 3. Property access is determined by active property_residents records
-- 4. Service key operations bypass all RLS policies
-- 5. Public operations (like access requests) don't require authentication