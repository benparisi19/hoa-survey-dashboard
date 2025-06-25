-- DATABASE_PDF_SETUP.sql
-- Commands to set up PDF storage in Supabase

-- SUPABASE FREE TIER LIMITS (as of 2024):
-- * File size limit: 50MB per upload (plenty for <1MB PDFs)
-- * Total storage: 1GB (could fit ~1000 PDF files)
-- * Bandwidth: 5GB/month
-- * Database storage: 500MB before read-only mode

-- 1. Update the responses table to track PDF files
ALTER TABLE responses 
ADD COLUMN pdf_file_path TEXT,
ADD COLUMN pdf_uploaded_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN pdf_storage_url TEXT;

-- 2. Create a storage bucket for survey PDFs
-- NOTE: This MUST be done in the Supabase Dashboard:
-- 1. Go to Storage section in your Supabase project
-- 2. Click "New bucket"
-- 3. Name it exactly: survey-pdfs
-- 4. Set to PUBLIC (since dashboard is currently public)
-- 5. Enable "Allow file uploads"
-- 6. Set max file size to 50MB (default) or lower like 5MB

-- 3. Storage bucket RLS policies (run AFTER creating bucket)
-- Allow public read access
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'survey-pdfs');

-- Allow authenticated uploads (for future when you add auth)
CREATE POLICY "Authenticated users can upload PDFs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'survey-pdfs');

-- Allow authenticated users to update their own PDFs
CREATE POLICY "Users can update own PDFs"
ON storage.objects FOR UPDATE
USING (bucket_id = 'survey-pdfs')
WITH CHECK (bucket_id = 'survey-pdfs');

-- Allow authenticated users to delete their own PDFs
CREATE POLICY "Users can delete own PDFs"
ON storage.objects FOR DELETE
USING (bucket_id = 'survey-pdfs');

-- 4. Add index for faster PDF lookups
CREATE INDEX idx_responses_pdf_file_path ON responses(pdf_file_path) WHERE pdf_file_path IS NOT NULL;

-- 5. Update the complete_responses view to include PDF fields
-- This recreates the view with the new PDF columns included
DROP VIEW IF EXISTS complete_responses CASCADE;

CREATE VIEW complete_responses AS
SELECT 
    r.response_id,
    r.address,
    r.name,
    r.email_contact,
    r.anonymous,
    r.review_status,
    r.reviewed_by,
    r.reviewed_at,
    r.review_notes,
    r.pdf_file_path,
    r.pdf_storage_url,
    r.pdf_uploaded_at,
    
    -- Q1/Q2: Preference and Rating
    q1.q1_preference,
    q1.q2_service_rating,
    
    -- Q3: Opt-out reasons
    q3.maintain_self as q3_maintain_self,
    q3.quality as q3_quality,
    q3.pet_safety as q3_pet_safety,
    q3.privacy as q3_privacy,
    q3.other_text as q3_other_text,
    
    -- Q4: Issues
    q4.irrigation,
    q4.poor_mowing,
    q4.property_damage,
    q4.missed_service,
    q4.inadequate_weeds,
    q4.irrigation_detail,
    q4.other_issues,
    
    -- Q5/Q6: Construction and group action
    q5.q5_construction_issues,
    q5.q5_explanation,
    q5.q6_group_action,
    
    -- Q7: Interest areas (updated column names)
    q7.equipment_coop,
    q7.manage_area,
    q7.mentorship,
    q7.paid_work,
    q7.volunteering,
    
    -- Q8: Equipment
    q8.lawn_mower,
    q8.trimmer,
    q8.blower,
    q8.basic_tools,
    q8.truck_trailer,
    
    -- Q9: Dues preference
    q9.dues_preference,
    
    -- Q10: Biggest concern
    q10.biggest_concern,
    
    -- Q11: Cost reduction
    q11.cost_reduction_ideas,
    
    -- Q12: Involvement
    q12.involvement_preference,
    
    -- Notes summary (subquery for counts)
    COALESCE(notes_summary.total_notes, 0) as total_notes,
    COALESCE(notes_summary.follow_up_notes, 0) as follow_up_notes,
    COALESCE(notes_summary.critical_notes, 0) as critical_notes

FROM responses r
LEFT JOIN q1_q2_preference_rating q1 ON r.response_id = q1.response_id
LEFT JOIN q3_opt_out_reasons q3 ON r.response_id = q3.response_id
LEFT JOIN q4_landscaping_issues q4 ON r.response_id = q4.response_id
LEFT JOIN q5_q6_construction_group q5 ON r.response_id = q5.response_id
LEFT JOIN q7_interest_areas q7 ON r.response_id = q7.response_id
LEFT JOIN q8_equipment_ownership q8 ON r.response_id = q8.response_id
LEFT JOIN q9_dues_preference q9 ON r.response_id = q9.response_id
LEFT JOIN q10_biggest_concern q10 ON r.response_id = q10.response_id
LEFT JOIN q11_cost_reduction q11 ON r.response_id = q11.response_id
LEFT JOIN q12_involvement q12 ON r.response_id = q12.response_id
LEFT JOIN (
    SELECT 
        response_id,
        COUNT(*) as total_notes,
        SUM(CASE WHEN requires_follow_up = true THEN 1 ELSE 0 END) as follow_up_notes,
        SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical_notes
    FROM survey_notes
    GROUP BY response_id
) notes_summary ON r.response_id = notes_summary.response_id
ORDER BY r.response_id;

COMMENT ON VIEW complete_responses IS 'Complete view of all survey responses with all questions joined, including PDF info and notes summary';

-- 6. Test that everything works
-- After running all commands and creating the storage bucket:
-- SELECT response_id, pdf_file_path, pdf_storage_url FROM responses LIMIT 5;
-- This should show the new columns (initially NULL)