-- ============================================================================
-- Authentication Setup - Phase 4: Storage Security (PDF Lockdown)
-- ============================================================================
-- ⚠️  IMPORTANT: This locks down ALL PDF access to admin-only!
-- Run this in Supabase Dashboard > Storage > Policies

-- Enable RLS on storage.objects if not already enabled
-- (This might already be enabled - that's fine)

-- ONLY ADMINS can view PDFs
CREATE POLICY "Only admins can view PDFs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'survey-pdfs' AND
    is_admin()
  );

-- ONLY ADMINS can upload PDFs
CREATE POLICY "Only admins can upload PDFs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'survey-pdfs' AND
    is_admin()
  );

-- ONLY ADMINS can delete PDFs
CREATE POLICY "Only admins can delete PDFs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'survey-pdfs' AND
    is_admin()
  );

-- ONLY ADMINS can update PDF metadata
CREATE POLICY "Only admins can update PDFs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'survey-pdfs' AND
    is_admin()
  );

-- ============================================================================
-- STORAGE VERIFICATION:
-- ============================================================================
-- After running this:
-- □ 1. Test PDF access as admin - should work normally
-- □ 2. Test PDF access as non-admin - should get access denied
-- □ 3. Try direct PDF URLs as non-admin - should get 403 Forbidden
-- □ 4. Verify PDF upload only works for admins

-- Note: You might need to run these policies in the Supabase Dashboard
-- under Storage > Policies if the SQL editor doesn't have access to the storage schema