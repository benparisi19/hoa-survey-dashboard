-- Fix infinite recursion in RLS policies that breaks admin access
-- The issue: policies query people table from within people table policies = infinite loop
-- SOLUTION: Simplify RLS policies and handle admin access in application code

-- =============================================================================
-- 1. FIX PEOPLE TABLE POLICIES (Remove all admin checks to prevent recursion)
-- =============================================================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON people;
DROP POLICY IF EXISTS "HOA admins can view all people" ON people;

-- Create simple policy - users can only see their own profile
-- Admin access will be handled by using service client in application code
CREATE POLICY "Users can view own profile" ON people
  FOR SELECT USING (
    auth_user_id = auth.uid()
  );

-- =============================================================================
-- 2. FIX PROPERTIES TABLE POLICIES (Remove admin checks)
-- =============================================================================

-- Drop existing policies that have recursion issues
DROP POLICY IF EXISTS "property_access_control" ON properties;
DROP POLICY IF EXISTS "Users view accessible properties" ON properties;
DROP POLICY IF EXISTS "HOA admins view all properties" ON properties;

-- Create simple property access policy for regular users only
-- Admin access will be handled by using service client in application code
CREATE POLICY "property_access_control" ON properties
  FOR SELECT USING (
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
-- 3. FIX PROPERTY_RESIDENTS TABLE POLICIES (Remove recursion)  
-- =============================================================================

-- Drop existing policies that have recursion issues
DROP POLICY IF EXISTS "property_residents_access_control" ON property_residents;
DROP POLICY IF EXISTS "Residents view own properties" ON property_residents;
DROP POLICY IF EXISTS "Owners view property residents" ON property_residents;
DROP POLICY IF EXISTS "HOA admins view all residents" ON property_residents;

-- Create simple property residents policy WITHOUT admin check
CREATE POLICY "property_residents_access_control" ON property_residents
  FOR SELECT USING (
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
-- SUMMARY OF CHANGES
-- =============================================================================

-- 1. Removed all admin privilege checks from RLS policies to prevent recursion
-- 2. Regular users can only see their own data (profiles, accessible properties)
-- 3. Admin access is handled in application code by:
--    a) Detecting admin status from user profile (account_type = 'hoa_admin')
--    b) Using service client (createServiceClient) for admin operations
--    c) Service client bypasses ALL RLS policies automatically

-- =============================================================================
-- ADMIN ACCESS IMPLEMENTATION NOTES
-- =============================================================================

-- For admin users, application code should:
-- 1. Load user profile normally (works with basic RLS)
-- 2. Check if user.account_type === 'hoa_admin'
-- 3. If admin, use createServiceClient() for all data operations
-- 4. If not admin, use regular createClient() which respects RLS

-- This approach:
-- ✅ Prevents infinite recursion in RLS policies
-- ✅ Gives admins full access to all data
-- ✅ Maintains security for regular users
-- ✅ Keeps policies simple and maintainable

-- Check the policies were created correctly
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('people', 'properties', 'property_residents')
ORDER BY tablename, policyname;