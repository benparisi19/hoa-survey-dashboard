-- Fix profile creation by adding INSERT policy for people table
-- This allows authenticated users to create their own profile

-- Enable RLS on people table if not already enabled
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can create own profile" ON people;

-- Create INSERT policy to allow users to create their own profile
CREATE POLICY "Users can create own profile" ON people
  FOR INSERT WITH CHECK (
    -- Users can only create a profile for themselves
    auth_user_id = auth.uid()
  );

-- Also add UPDATE policy for users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON people;

CREATE POLICY "Users can update own profile" ON people
  FOR UPDATE USING (
    auth_user_id = auth.uid()
  );

-- Ensure SELECT policy exists for users to read their own profile
-- This should already exist from PHASE_4_RLS_POLICIES.sql but let's ensure it's correct
DROP POLICY IF EXISTS "Users can view own profile" ON people;

CREATE POLICY "Users can view own profile" ON people
  FOR SELECT USING (
    -- Users can see their own profile
    auth_user_id = auth.uid()
  );

-- HOA admins need separate policy to see all profiles
DROP POLICY IF EXISTS "HOA admins can view all people" ON people;

CREATE POLICY "HOA admins can view all people" ON people
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM people 
      WHERE auth_user_id = auth.uid() 
      AND account_type = 'hoa_admin'
    )
  );

-- Check the policies were created
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'people'
ORDER BY cmd, policyname;