-- Phase 4 RLS Security Fix: Proper Property Data Protection
-- 
-- This fixes the critical security vulnerability where users can access
-- any property by navigating to /properties/{any-id}
--
-- ISSUE: Current RLS policies exist but aren't properly enforcing restrictions
-- ROOT CAUSE: Policies may not be applied or have logic issues

-- =============================================================================
-- 1. VERIFY CURRENT POLICY STATUS
-- =============================================================================

-- Check if RLS is enabled on key tables
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables pt
JOIN pg_class pc ON pc.relname = pt.tablename
WHERE schemaname = 'public' 
  AND tablename IN ('properties', 'property_residents', 'people')
ORDER BY tablename;

-- List current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('properties', 'property_residents', 'people')
ORDER BY tablename, policyname;

-- =============================================================================
-- 2. DROP AND RECREATE PROPERTIES TABLE POLICIES
-- =============================================================================

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users view accessible properties" ON properties;
DROP POLICY IF EXISTS "HOA admins view all properties" ON properties;
DROP POLICY IF EXISTS "Users can view accessible properties" ON properties;
DROP POLICY IF EXISTS "Admins can view all properties" ON properties;

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
    -- Users can only see properties they have verified access to
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
        AND po.verification_status = 'verified'
        AND (po.ownership_end_date IS NULL OR po.ownership_end_date > CURRENT_DATE)
    )
  );

-- =============================================================================
-- 3. FIX PROPERTY_RESIDENTS TABLE POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users view accessible residents" ON property_residents;
DROP POLICY IF EXISTS "HOA admins view all residents" ON property_residents;

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
        AND po.verification_status = 'verified'
        AND (po.ownership_end_date IS NULL OR po.ownership_end_date > CURRENT_DATE)
    )
  );

-- =============================================================================
-- 4. PEOPLE TABLE POLICIES (ALREADY FIXED - NO INFINITE RECURSION)
-- =============================================================================

-- These should already be working from previous fix
-- Just verify they exist and don't have recursion issues

-- =============================================================================
-- 5. TEST QUERIES TO VERIFY SECURITY
-- =============================================================================

-- Test 1: Regular user should only see their accessible properties
-- (Run this as a regular user, should return only their properties)
-- SELECT property_id, address FROM properties LIMIT 5;

-- Test 2: Admin user should see all properties  
-- (Run this as HOA admin, should return all properties)
-- SELECT COUNT(*) as total_properties FROM properties;

-- Test 3: User should not be able to see residents of inaccessible properties
-- (Try accessing residents of a property the user doesn't have access to)
-- SELECT * FROM property_residents WHERE property_id = 'some-property-id-user-should-not-access';

-- =============================================================================
-- 6. VERIFICATION QUERIES
-- =============================================================================

-- Check that policies are properly created
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN ('properties', 'property_residents')
  AND policyname LIKE '%access_control%'
ORDER BY tablename;

-- Verify RLS is enabled
SELECT 
  relname as table_name,
  relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname IN ('properties', 'property_residents', 'people')
  AND relkind = 'r';

-- =============================================================================
-- NOTES FOR TESTING
-- =============================================================================

-- After running this script:
-- 1. Test with a non-admin user account
-- 2. Try accessing /properties/{random-property-id} 
-- 3. Should get empty results or access denied
-- 4. Verify admin account can still see all properties
-- 5. Check that property detail pages show 404 for unauthorized access

-- If policies are still not working:
-- 1. Check that auth.uid() returns the correct user ID
-- 2. Verify people records have correct auth_user_id links
-- 3. Check property_residents records have verification_status = 'verified'
-- 4. Confirm RLS is enabled on all tables

COMMIT;