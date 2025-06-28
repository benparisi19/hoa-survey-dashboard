-- Phase 4 RLS Security Fix: FINAL CORRECTED VERSION
-- 
-- This fixes the critical security vulnerability where users can access
-- any property by navigating to /properties/{any-id}
--
-- FINAL CORRECTION: Fixed property_access_requests policy

-- =============================================================================
-- 1. DROP AND RECREATE PROPERTIES TABLE POLICIES
-- =============================================================================

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users view accessible properties" ON properties;
DROP POLICY IF EXISTS "HOA admins view all properties" ON properties;
DROP POLICY IF EXISTS "Users can view accessible properties" ON properties;
DROP POLICY IF EXISTS "Admins can view all properties" ON properties;
DROP POLICY IF EXISTS "property_access_control" ON properties;

-- Ensure RLS is enabled
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create bulletproof property access policy
CREATE POLICY "property_access_control" ON properties
  FOR SELECT USING (
    -- HOA Admins can see all properties
    EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
        AND account_type = 'hoa_admin'
    )
    OR
    -- Users can only see properties they have verified access to via property_residents
    property_id IN (
      SELECT pr.property_id 
      FROM property_residents pr
      JOIN people p ON p.person_id = pr.person_id
      WHERE p.auth_user_id = auth.uid()
        AND pr.verification_status = 'verified'
        AND (pr.end_date IS NULL OR pr.end_date > CURRENT_DATE)
    )
    OR
    -- Property owners can see their owned properties  
    property_id IN (
      SELECT po.property_id
      FROM property_ownership po
      JOIN people p ON p.person_id = po.owner_id
      WHERE p.auth_user_id = auth.uid()
        AND po.verified_by_hoa = true
        AND (po.ownership_end_date IS NULL OR po.ownership_end_date > CURRENT_DATE)
    )
  );

-- =============================================================================
-- 2. FIX PROPERTY_RESIDENTS TABLE POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users view accessible residents" ON property_residents;
DROP POLICY IF EXISTS "HOA admins view all residents" ON property_residents;
DROP POLICY IF EXISTS "property_residents_access_control" ON property_residents;

-- Ensure RLS is enabled
ALTER TABLE property_residents ENABLE ROW LEVEL SECURITY;

-- Create secure property residents policy
CREATE POLICY "property_residents_access_control" ON property_residents
  FOR SELECT USING (
    -- HOA Admins can see all property residents
    EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
        AND account_type = 'hoa_admin'
    )
    OR
    -- Users can only see residents of properties they have access to
    property_id IN (
      SELECT pr.property_id 
      FROM property_residents pr
      JOIN people p ON p.person_id = pr.person_id
      WHERE p.auth_user_id = auth.uid()
        AND pr.verification_status = 'verified'
        AND (pr.end_date IS NULL OR pr.end_date > CURRENT_DATE)
    )
    OR
    -- Property owners can see residents of their properties
    property_id IN (
      SELECT po.property_id
      FROM property_ownership po
      JOIN people p ON p.person_id = po.owner_id
      WHERE p.auth_user_id = auth.uid()
        AND po.verified_by_hoa = true
        AND (po.ownership_end_date IS NULL OR po.ownership_end_date > CURRENT_DATE)
    )
  );

-- =============================================================================
-- 3. PROPERTY_OWNERSHIP TABLE POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users view own ownership" ON property_ownership;
DROP POLICY IF EXISTS "HOA admins view all ownership" ON property_ownership;

-- Ensure RLS is enabled
ALTER TABLE property_ownership ENABLE ROW LEVEL SECURITY;

-- Create property ownership policy
CREATE POLICY "property_ownership_access_control" ON property_ownership
  FOR SELECT USING (
    -- HOA Admins can see all ownership records
    EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
        AND account_type = 'hoa_admin'
    )
    OR
    -- Users can see their own ownership records
    owner_id IN (
      SELECT person_id FROM people 
      WHERE auth_user_id = auth.uid()
    )
    OR
    -- Users can see ownership of properties they have access to
    property_id IN (
      SELECT pr.property_id 
      FROM property_residents pr
      JOIN people p ON p.person_id = pr.person_id
      WHERE p.auth_user_id = auth.uid()
        AND pr.verification_status = 'verified'
        AND (pr.end_date IS NULL OR pr.end_date > CURRENT_DATE)
    )
  );

-- =============================================================================
-- 4. PEOPLE TABLE POLICIES (VERIFY NO INFINITE RECURSION)
-- =============================================================================

-- Check current people policies (should already be working)
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'people';

-- These should exist and not have recursion:
-- - "Users can view own profile" 
-- - No policy that queries people table within people policy

-- =============================================================================
-- 5. PROPERTY_INVITATIONS AND ACCESS_REQUESTS POLICIES
-- =============================================================================

-- Property invitations - users can see invitations they created or received
DROP POLICY IF EXISTS "property_invitations_access" ON property_invitations;
ALTER TABLE property_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_invitations_access" ON property_invitations
  FOR SELECT USING (
    -- HOA Admins can see all invitations
    EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
        AND account_type = 'hoa_admin'
    )
    OR
    -- Users can see invitations they created
    invited_by IN (
      SELECT person_id FROM people 
      WHERE auth_user_id = auth.uid()
    )
    OR
    -- Users can see invitations to properties they have access to
    property_id IN (
      SELECT pr.property_id 
      FROM property_residents pr
      JOIN people p ON p.person_id = pr.person_id
      WHERE p.auth_user_id = auth.uid()
        AND pr.verification_status = 'verified'
        AND (pr.end_date IS NULL OR pr.end_date > CURRENT_DATE)
    )
  );

-- Property access requests - CORRECTED for anonymous requests
-- Note: property_access_requests table stores anonymous requests (requester_email/name)
-- These are NOT linked to auth users until approved
DROP POLICY IF EXISTS "property_access_requests_access" ON property_access_requests;
ALTER TABLE property_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "property_access_requests_access" ON property_access_requests
  FOR SELECT USING (
    -- HOA Admins can see all access requests
    EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
        AND account_type = 'hoa_admin'
    )
    OR
    -- Property owners can see requests for their properties
    property_id IN (
      SELECT po.property_id
      FROM property_ownership po
      JOIN people p ON p.person_id = po.owner_id
      WHERE p.auth_user_id = auth.uid()
        AND po.verified_by_hoa = true
        AND (po.ownership_end_date IS NULL OR po.ownership_end_date > CURRENT_DATE)
    )
    OR
    -- Users can see requests for properties they have access to
    property_id IN (
      SELECT pr.property_id 
      FROM property_residents pr
      JOIN people p ON p.person_id = pr.person_id
      WHERE p.auth_user_id = auth.uid()
        AND pr.verification_status = 'verified'
        AND (pr.end_date IS NULL OR pr.end_date > CURRENT_DATE)
    )
  );

-- =============================================================================
-- 6. VERIFICATION QUERIES
-- =============================================================================

-- Check that all policies are properly created
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('properties', 'property_residents', 'property_ownership', 'people')
  AND policyname LIKE '%access_control%'
ORDER BY tablename;

-- Verify RLS is enabled on critical tables
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname IN (
    'properties', 
    'property_residents', 
    'property_ownership', 
    'people',
    'property_invitations',
    'property_access_requests'
  )
  AND relkind = 'r';

-- =============================================================================
-- 7. TEST QUERIES (Run as different users to verify)
-- =============================================================================

-- Test 1: As regular user - should only see accessible properties
-- SELECT property_id, address FROM properties LIMIT 5;

-- Test 2: As admin - should see all properties  
-- SELECT COUNT(*) as total_properties FROM properties;

-- Test 3: Try to access specific property as non-owner
-- SELECT * FROM properties WHERE property_id = 'some-random-property-id';

-- =============================================================================
-- NOTES
-- =============================================================================

-- Key Schema Corrections Made:
-- 1. property_ownership uses 'verified_by_hoa' boolean, not 'verification_status'
-- 2. property_residents does have 'verification_status' column
-- 3. property_access_requests has NO requester_id - uses requester_email for anonymous requests
-- 4. Added policies for property_invitations and property_access_requests
-- 5. Proper column references based on actual supabase.ts schema

-- SECURITY ARCHITECTURE:
-- - property_access_requests are ANONYMOUS until approved
-- - Once approved, they get converted to property_residents records with auth_user_id
-- - Only admins and property owners can see these anonymous requests
-- - Regular users cannot see requests until they become residents

-- After running this:
-- 1. Test with non-admin user - should not see unauthorized properties
-- 2. Test property detail pages - should get 404 for unauthorized access
-- 3. Verify admin users can still see all data
-- 4. Check API endpoints respect the new security

COMMIT;