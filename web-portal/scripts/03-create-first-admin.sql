-- ============================================================================
-- CRITICAL: Create First Admin User
-- ============================================================================
-- ⚠️  IMPORTANT: This must be done BEFORE enabling RLS policies!
-- ⚠️  Replace 'your-email@domain.com' with your actual email address!

-- Step 1: First, you need to create a user in Supabase Auth
-- Go to Supabase Dashboard > Authentication > Users > "Create new user"
-- Use your email and set a temporary password
-- Then come back and run this script

-- Step 2: Get the user ID (replace the email with your actual email)
-- Uncomment the line below and replace with your email:
-- SELECT id, email FROM auth.users WHERE email = 'your-email@domain.com';

-- Step 3: Copy the user ID from above and replace 'YOUR-USER-ID-HERE' below
-- UPDATE user_profiles 
-- SET role = 'admin', updated_at = NOW()
-- WHERE id = 'YOUR-USER-ID-HERE';

-- Step 4: Verify it worked (should show your email with role = 'admin')
-- SELECT 
--   au.email, 
--   up.role, 
--   up.created_at,
--   up.promoted_at
-- FROM user_profiles up
-- JOIN auth.users au ON up.id = au.id 
-- WHERE up.role = 'admin';

-- ============================================================================
-- MANUAL STEPS CHECKLIST:
-- ============================================================================
-- □ 1. Create user in Supabase Dashboard > Authentication > Users
-- □ 2. Run: SELECT id FROM auth.users WHERE email = 'your-email@domain.com';
-- □ 3. Copy the user ID
-- □ 4. Update the UPDATE statement above with your user ID
-- □ 5. Run the UPDATE statement
-- □ 6. Run the verification SELECT to confirm admin role
-- □ 7. Test login with your credentials
-- □ 8. ONLY THEN proceed to enable RLS policies!

-- Once you've completed these steps and confirmed you can log in as admin,
-- you can safely run the RLS policies script (04-enable-rls-policies.sql)