-- Schema Cleanup Commands - Break Things to Find What Needs Fixing
-- This will remove outdated columns and simplify the database structure
-- WARNING: This will break the frontend until we fix the code

-- =============================================
-- STEP 1: Drop the old complete_responses view
-- =============================================

DROP VIEW IF EXISTS complete_responses;

-- =============================================
-- STEP 2: Remove outdated/confusing columns from tables
-- =============================================

-- Remove the extra _na columns that aren't consistently used
ALTER TABLE q3_opt_out_reasons DROP COLUMN IF EXISTS q3_na;
ALTER TABLE q7_interest_areas DROP COLUMN IF EXISTS q7_na;
ALTER TABLE q8_equipment_ownership DROP COLUMN IF EXISTS q8_na;

-- =============================================
-- STEP 3: Standardize column naming across tables
-- =============================================

-- REMOVE scattered notes fields - we'll use survey_notes table instead
ALTER TABLE q1_q2_preference_rating DROP COLUMN IF EXISTS notes;
ALTER TABLE q8_equipment_ownership DROP COLUMN IF EXISTS notes;
ALTER TABLE q9_dues_preference DROP COLUMN IF EXISTS notes;
ALTER TABLE q12_involvement DROP COLUMN IF EXISTS q12_notes;

-- Q9: Clean up naming
ALTER TABLE q9_dues_preference RENAME COLUMN q9_response TO dues_preference;

-- Q10: Rename for consistency
ALTER TABLE q10_biggest_concern RENAME COLUMN q10_text TO biggest_concern;

-- Q11: Rename for consistency
ALTER TABLE q11_cost_reduction RENAME COLUMN q11_text TO cost_reduction_ideas;

-- Q12: Clean up naming (notes column already dropped above)
ALTER TABLE q12_involvement RENAME COLUMN q12_response TO involvement_preference;

-- =============================================
-- STEP 4: Create simplified, clean complete_responses view
-- =============================================

CREATE VIEW complete_responses AS
SELECT 
    r.*,
    -- Q1/Q2: Preference and Rating
    q1q2.q1_preference,
    q1q2.q2_service_rating,
    
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
    q5q6.q5_construction_issues,
    q5q6.q5_explanation,
    q5q6.q6_group_action,
    
    -- Q7: Interest areas
    q7.plant_selection,
    q7.watering_irrigation,
    q7.fertilizing_pest,
    q7.lawn_maintenance,
    q7.seasonal_planning,
    q7.other_interests,
    
    -- Q8: Equipment (NOW CLEAN - no notes field)
    q8.lawn_mower,
    q8.trimmer,
    q8.blower,
    q8.basic_tools,
    q8.truck_trailer,
    
    -- Q9: Dues preference (NOW CLEAN - no notes field)
    q9.dues_preference,
    
    -- Q10: Biggest concern (NOW CLEAN)
    q10.biggest_concern,
    
    -- Q11: Cost reduction (NOW CLEAN)
    q11.cost_reduction_ideas,
    
    -- Q12: Involvement (NOW CLEAN - no notes field)
    q12.involvement_preference,
    
    -- Survey Notes Summary
    COALESCE(notes_summary.total_notes, 0) as total_notes,
    COALESCE(notes_summary.follow_up_notes, 0) as follow_up_notes,
    COALESCE(notes_summary.critical_notes, 0) as critical_notes

FROM responses r
LEFT JOIN q1_q2_preference_rating q1q2 ON r.response_id = q1q2.response_id
LEFT JOIN q3_opt_out_reasons q3 ON r.response_id = q3.response_id
LEFT JOIN q4_landscaping_issues q4 ON r.response_id = q4.response_id
LEFT JOIN q5_q6_construction_group q5q6 ON r.response_id = q5q6.response_id
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
        COUNT(*) FILTER (WHERE requires_follow_up = true) as follow_up_notes,
        COUNT(*) FILTER (WHERE priority = 'critical') as critical_notes
    FROM survey_notes 
    GROUP BY response_id
) notes_summary ON r.response_id = notes_summary.response_id
ORDER BY r.response_id;

-- =============================================
-- STEP 5: Create notes-focused views for the UI
-- =============================================

-- View for managing notes with response context
CREATE OR REPLACE VIEW survey_notes_with_response_info AS
SELECT 
    sn.*,
    r.address,
    r.name,
    r.anonymous,
    r.review_status
FROM survey_notes sn
JOIN responses r ON sn.response_id = r.response_id
ORDER BY sn.priority DESC, sn.created_at DESC;

-- View for critical issues dashboard
CREATE VIEW critical_issues AS
SELECT 
    sn.response_id,
    sn.note_text,
    sn.section,
    sn.priority,
    sn.requires_follow_up,
    sn.resolved,
    r.address,
    r.name,
    r.anonymous
FROM survey_notes sn
JOIN responses r ON sn.response_id = r.response_id
WHERE sn.priority IN ('critical', 'high') OR sn.requires_follow_up = true
ORDER BY 
    CASE sn.priority 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        ELSE 4 
    END,
    sn.created_at DESC;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check that column renames worked
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_name IN ('q8_equipment_ownership', 'q9_dues_preference', 'q10_biggest_concern', 'q11_cost_reduction', 'q12_involvement')
ORDER BY table_name, column_name;

-- Test the new view
SELECT response_id, q1_preference, biggest_concern, total_notes 
FROM complete_responses 
LIMIT 5;

-- Check critical issues view
SELECT response_id, priority, note_text 
FROM critical_issues 
LIMIT 5;