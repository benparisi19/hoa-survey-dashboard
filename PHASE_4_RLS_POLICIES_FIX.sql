-- Phase 4: Row Level Security Policies Fix - Infinite Recursion Resolution
-- This script fixes the infinite recursion issue in people table policies

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON people;
DROP POLICY IF EXISTS "Users can update own profile" ON people;
DROP POLICY IF EXISTS "HOA admins can view all people" ON people;

-- =============================================================================
-- PEOPLE TABLE POLICIES - FIXED
-- =============================================================================

-- Users can view their own profile (simple, no recursion)
CREATE POLICY "Users can view own profile" ON people
  FOR SELECT USING (
    auth_user_id = auth.uid()
  );

-- Users can update their own profile (simple, no recursion)
CREATE POLICY "Users can update own profile" ON people
  FOR UPDATE USING (
    auth_user_id = auth.uid()
  );

-- REMOVED: The problematic "HOA admins can view all people" policy
-- This was causing infinite recursion because it queried the people table
-- within a policy that was checking access to the people table

-- NOTE: HOA admins will use the service key for administrative operations
-- that require viewing all people, which bypasses RLS entirely

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- To verify the fix works, run these queries after applying:

-- 1. Check if a user can read their own profile:
-- SELECT * FROM people WHERE auth_user_id = auth.uid();

-- 2. Verify no infinite recursion:
-- This should work without errors for any authenticated user

-- =============================================================================
-- ADMIN ACCESS PATTERN
-- =============================================================================

-- For admin operations that need to view all people:
-- 1. Use the service key (bypasses all RLS)
-- 2. Or create a specific stored function with SECURITY DEFINER
-- 3. Or temporarily disable RLS for admin operations

-- Example admin function (if needed):
/*
CREATE OR REPLACE FUNCTION admin_get_all_people()
RETURNS SETOF people
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function runs with elevated privileges
  -- Only call from admin-authenticated API endpoints
  RETURN QUERY SELECT * FROM people;
END;
$$;
*/

-- =============================================================================
-- NOTES
-- =============================================================================

-- 1. This removes the infinite recursion by eliminating the policy that
--    queries the people table to determine if someone is an admin
-- 2. Admin operations should use the service key or dedicated functions
-- 3. Regular users can still access their own profiles
-- 4. This maintains security while fixing the recursion issue