-- ============================================================================
-- Authentication Setup - Phase 3: Row Level Security (COMPLETE LOCKDOWN)
-- ============================================================================
-- ⚠️  CRITICAL: Only run this AFTER you have created and tested your first admin user!
-- ⚠️  This will lock down ALL data to admin-only access!

-- Enable RLS on all tables
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE q1_q2_preference_rating ENABLE ROW LEVEL SECURITY;
ALTER TABLE q3_opt_out_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE q4_landscaping_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE q5_q6_construction_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE q7_interest_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE q8_equipment_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE q9_dues_preference ENABLE ROW LEVEL SECURITY;
ALTER TABLE q10_biggest_concern ENABLE ROW LEVEL SECURITY;
ALTER TABLE q11_cost_reduction ENABLE ROW LEVEL SECURITY;
ALTER TABLE q12_involvement ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- User Profiles Policies (Limited self-access + admin management)
-- ============================================================================

-- Users can view their own profile (so they know they exist and their role)
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Only admins can view other profiles (for user management)
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (is_admin() AND auth.uid() != id);

-- Only admins can modify profiles (promote users, etc.)
CREATE POLICY "Admins can manage profiles" ON user_profiles
  FOR ALL USING (is_admin());

-- ============================================================================
-- Survey Data Policies (COMPLETE ADMIN-ONLY LOCKDOWN)
-- ============================================================================

-- Responses table: ONLY ADMINS can access
CREATE POLICY "Only admins can view responses" ON responses
  FOR SELECT USING (is_admin());

CREATE POLICY "Only admins can create responses" ON responses
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can update responses" ON responses
  FOR UPDATE USING (is_admin());

CREATE POLICY "Only admins can delete responses" ON responses
  FOR DELETE USING (is_admin());

-- Survey question tables: ADMIN ONLY (apply same policy to all)
CREATE POLICY "Only admins can access q1_q2_data" ON q1_q2_preference_rating
  FOR ALL USING (is_admin());

CREATE POLICY "Only admins can access q3_data" ON q3_opt_out_reasons
  FOR ALL USING (is_admin());

CREATE POLICY "Only admins can access q4_data" ON q4_landscaping_issues
  FOR ALL USING (is_admin());

CREATE POLICY "Only admins can access q5_q6_data" ON q5_q6_construction_group
  FOR ALL USING (is_admin());

CREATE POLICY "Only admins can access q7_data" ON q7_interest_areas
  FOR ALL USING (is_admin());

CREATE POLICY "Only admins can access q8_data" ON q8_equipment_ownership
  FOR ALL USING (is_admin());

CREATE POLICY "Only admins can access q9_data" ON q9_dues_preference
  FOR ALL USING (is_admin());

CREATE POLICY "Only admins can access q10_data" ON q10_biggest_concern
  FOR ALL USING (is_admin());

CREATE POLICY "Only admins can access q11_data" ON q11_cost_reduction
  FOR ALL USING (is_admin());

CREATE POLICY "Only admins can access q12_data" ON q12_involvement
  FOR ALL USING (is_admin());

-- Notes: ADMIN ONLY
CREATE POLICY "Only admins can access notes" ON survey_notes
  FOR ALL USING (is_admin());

-- ============================================================================
-- Verification Queries (Run these to test the lockdown)
-- ============================================================================

-- Test 1: Admin should see data
-- SELECT COUNT(*) FROM responses; -- Should return actual count for admin

-- Test 2: Test is_admin() function
-- SELECT is_admin() as am_i_admin; -- Should return true for admin, false for others

-- Test 3: Test profile access
-- SELECT email, role FROM user_profiles; -- Admin should see all, others only their own

-- ============================================================================
-- SECURITY VERIFICATION CHECKLIST:
-- ============================================================================
-- After running this script:
-- □ 1. Log in as admin - verify you can see all survey data
-- □ 2. Create a test user account (will get 'no_access' role automatically)
-- □ 3. Log in as test user - verify they see no survey data
-- □ 4. Try to access /responses directly as test user - should see no data
-- □ 5. Verify PDFs are not accessible to test user
-- □ 6. Confirm admin can promote test user if needed

-- If all verification steps pass, your system is completely locked down!
-- Non-admin users will see empty tables and "Access Restricted" messages.