-- ============================================================================
-- Authentication Setup - Phase 2: Admin Functions
-- ============================================================================
-- These are the core security functions that power the entire access control system.

-- CRITICAL FUNCTION: Check if current user is admin
-- This is the ONLY function we need - every policy will use this!
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin',
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Function to promote user to admin (can only be called by existing admin)
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;
  
  -- Check if target user exists
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Promote the user
  UPDATE user_profiles 
  SET 
    role = 'admin', 
    promoted_by = auth.uid(), 
    promoted_at = NOW(),
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to demote admin to no_access (can only be called by existing admin)
CREATE OR REPLACE FUNCTION demote_user_from_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is admin
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can demote users';
  END IF;
  
  -- Prevent self-demotion (safety check)
  IF user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot demote yourself';
  END IF;
  
  -- Check if target user exists
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = user_id) THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Demote the user
  UPDATE user_profiles 
  SET 
    role = 'no_access',
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user's profile info
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  last_sign_in TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.email,
    up.full_name,
    up.role,
    up.is_active,
    up.created_at,
    up.last_sign_in
  FROM user_profiles up
  WHERE up.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;