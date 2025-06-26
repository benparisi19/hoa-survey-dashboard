-- ============================================================================
-- Fix User Creation Trigger - Safer Version
-- ============================================================================
-- This fixes the trigger that was causing user creation to fail

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

-- Create a more robust trigger function
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Handle the case where user_profiles table might not exist
  -- or where there might be other issues
  BEGIN
    INSERT INTO user_profiles (id, email, full_name, role)
    VALUES (
      NEW.id, 
      COALESCE(NEW.email, ''), 
      COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'name',
        ''
      ),
      'no_access'
    );
  EXCEPTION 
    WHEN OTHERS THEN
      -- Log the error but don't prevent user creation
      RAISE WARNING 'Failed to create user profile for %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a simpler trigger function for sign-in updates
CREATE OR REPLACE FUNCTION handle_user_signin()
RETURNS trigger AS $$
BEGIN
  -- Only update if last_sign_in_at actually changed
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at AND NEW.last_sign_in_at IS NOT NULL THEN
    BEGIN
      UPDATE user_profiles 
      SET last_sign_in = NEW.last_sign_in_at 
      WHERE id = NEW.id;
    EXCEPTION 
      WHEN OTHERS THEN
        -- Don't fail if profile doesn't exist
        NULL;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_signin();

-- Test the user_profiles table exists and is accessible
SELECT 'user_profiles table is ready' as status, count(*) as current_users FROM user_profiles;