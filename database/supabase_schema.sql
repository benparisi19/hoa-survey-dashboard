-- HOA Survey Database Schema for Supabase
-- Run this script in your Supabase SQL Editor to create the database structure

-- Enable Row Level Security (RLS) for all tables
-- You can adjust these policies based on your access needs

-- ============================================================
-- 1. RESPONSES TABLE (Main respondent information)
-- ============================================================

CREATE TABLE responses (
    response_id TEXT PRIMARY KEY,
    address TEXT,
    name TEXT,
    email_contact TEXT,
    anonymous TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE responses IS 'Basic respondent information and contact details';
COMMENT ON COLUMN responses.response_id IS 'Unique survey response identifier (001-113)';
COMMENT ON COLUMN responses.address IS 'Respondent address (if provided)';
COMMENT ON COLUMN responses.name IS 'Respondent name (if provided)';
COMMENT ON COLUMN responses.email_contact IS 'Contact information (email/phone)';
COMMENT ON COLUMN responses.anonymous IS 'Whether response was submitted anonymously (Yes/No)';

-- ============================================================
-- 2. Q1 & Q2: PREFERENCE & SERVICE RATING
-- ============================================================

CREATE TABLE q1_q2_preference_rating (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id) ON DELETE CASCADE,
    q1_preference TEXT,
    q2_service_rating TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE q1_q2_preference_rating IS 'Landscaping preference and current service rating';
COMMENT ON COLUMN q1_q2_preference_rating.q1_preference IS 'Preference: Keep HOA landscaping, Opt out and maintain myself, etc.';
COMMENT ON COLUMN q1_q2_preference_rating.q2_service_rating IS 'Service rating: Excellent, Good, Fair, Poor, Very Poor';
COMMENT ON COLUMN q1_q2_preference_rating.notes IS 'Additional notes or complex markings';

-- ============================================================
-- 3. Q3: OPT-OUT REASONS
-- ============================================================

CREATE TABLE q3_opt_out_reasons (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id) ON DELETE CASCADE,
    q3_na TEXT,
    maintain_self TEXT,
    quality TEXT,
    pet_safety TEXT,
    privacy TEXT,
    other_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE q3_opt_out_reasons IS 'Reasons for wanting to opt out of HOA landscaping';
COMMENT ON COLUMN q3_opt_out_reasons.q3_na IS 'Not applicable (already opted out)';
COMMENT ON COLUMN q3_opt_out_reasons.maintain_self IS 'Want to maintain property myself';
COMMENT ON COLUMN q3_opt_out_reasons.quality IS 'Poor quality of current service';
COMMENT ON COLUMN q3_opt_out_reasons.pet_safety IS 'Pet safety concerns';
COMMENT ON COLUMN q3_opt_out_reasons.privacy IS 'Privacy concerns';
COMMENT ON COLUMN q3_opt_out_reasons.other_text IS 'Other reasons (free text)';

-- ============================================================
-- 4. Q4: LANDSCAPING ISSUES
-- ============================================================

CREATE TABLE q4_landscaping_issues (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id) ON DELETE CASCADE,
    irrigation TEXT,
    poor_mowing TEXT,
    property_damage TEXT,
    missed_service TEXT,
    inadequate_weeds TEXT,
    irrigation_detail TEXT,
    other_issues TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE q4_landscaping_issues IS 'Specific landscaping problems and issues reported';
COMMENT ON COLUMN q4_landscaping_issues.irrigation IS 'Irrigation system problems (Yes/No)';
COMMENT ON COLUMN q4_landscaping_issues.poor_mowing IS 'Poor mowing quality (Yes/No)';
COMMENT ON COLUMN q4_landscaping_issues.property_damage IS 'Property damage from landscaping (Yes/No)';
COMMENT ON COLUMN q4_landscaping_issues.missed_service IS 'Missed service appointments (Yes/No)';
COMMENT ON COLUMN q4_landscaping_issues.inadequate_weeds IS 'Inadequate weed control (Yes/No)';
COMMENT ON COLUMN q4_landscaping_issues.irrigation_detail IS 'Details about irrigation issues';
COMMENT ON COLUMN q4_landscaping_issues.other_issues IS 'Other landscaping issues (free text)';

-- ============================================================
-- 5. Q5 & Q6: CONSTRUCTION ISSUES & GROUP ACTION
-- ============================================================

CREATE TABLE q5_q6_construction_group (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id) ON DELETE CASCADE,
    q5_construction_issues TEXT,
    q5_explanation TEXT,
    q6_group_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE q5_q6_construction_group IS 'Construction-related issues and interest in group action';
COMMENT ON COLUMN q5_q6_construction_group.q5_construction_issues IS 'Has construction-related landscaping issues';
COMMENT ON COLUMN q5_q6_construction_group.q5_explanation IS 'Explanation of construction issues';
COMMENT ON COLUMN q5_q6_construction_group.q6_group_action IS 'Interest in group action (Yes/No/Maybe)';

-- ============================================================
-- 6. Q7: INTEREST AREAS
-- ============================================================

CREATE TABLE q7_interest_areas (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id) ON DELETE CASCADE,
    q7_na TEXT,
    plant_selection TEXT,
    watering_irrigation TEXT,
    fertilizing_pest TEXT,
    lawn_maintenance TEXT,
    seasonal_planning TEXT,
    other_interests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE q7_interest_areas IS 'Learning interests for landscaping topics';
COMMENT ON COLUMN q7_interest_areas.q7_na IS 'Not applicable/not interested';
COMMENT ON COLUMN q7_interest_areas.plant_selection IS 'Interest in plant selection';
COMMENT ON COLUMN q7_interest_areas.watering_irrigation IS 'Interest in watering/irrigation';
COMMENT ON COLUMN q7_interest_areas.fertilizing_pest IS 'Interest in fertilizing/pest control';
COMMENT ON COLUMN q7_interest_areas.lawn_maintenance IS 'Interest in lawn maintenance';
COMMENT ON COLUMN q7_interest_areas.seasonal_planning IS 'Interest in seasonal planning';
COMMENT ON COLUMN q7_interest_areas.other_interests IS 'Other learning interests';

-- ============================================================
-- 7. Q8: EQUIPMENT OWNERSHIP
-- ============================================================

CREATE TABLE q8_equipment_ownership (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id) ON DELETE CASCADE,
    q8_na TEXT,
    lawn_mower TEXT,
    trimmer TEXT,
    blower TEXT,
    basic_tools TEXT,
    truck_trailer TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE q8_equipment_ownership IS 'Equipment owned by respondents for landscaping';
COMMENT ON COLUMN q8_equipment_ownership.q8_na IS 'Not applicable';
COMMENT ON COLUMN q8_equipment_ownership.lawn_mower IS 'Owns lawn mower';
COMMENT ON COLUMN q8_equipment_ownership.trimmer IS 'Owns trimmer/edger';
COMMENT ON COLUMN q8_equipment_ownership.blower IS 'Owns leaf blower';
COMMENT ON COLUMN q8_equipment_ownership.basic_tools IS 'Owns basic gardening tools';
COMMENT ON COLUMN q8_equipment_ownership.truck_trailer IS 'Owns truck/trailer for hauling';
COMMENT ON COLUMN q8_equipment_ownership.notes IS 'Additional equipment notes';

-- ============================================================
-- 8. Q9: DUES PREFERENCE
-- ============================================================

CREATE TABLE q9_dues_preference (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id) ON DELETE CASCADE,
    q9_response TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE q9_dues_preference IS 'Preferences about HOA dues changes';
COMMENT ON COLUMN q9_dues_preference.q9_response IS 'Dues preference response';
COMMENT ON COLUMN q9_dues_preference.notes IS 'Additional notes about dues preference';

-- ============================================================
-- 9. Q10: BIGGEST CONCERN
-- ============================================================

CREATE TABLE q10_biggest_concern (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id) ON DELETE CASCADE,
    q10_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE q10_biggest_concern IS 'Open-ended biggest concerns about landscaping';
COMMENT ON COLUMN q10_biggest_concern.q10_text IS 'Free text response about biggest concern';

-- ============================================================
-- 10. Q11: COST REDUCTION IDEAS
-- ============================================================

CREATE TABLE q11_cost_reduction (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id) ON DELETE CASCADE,
    q11_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE q11_cost_reduction IS 'Ideas for reducing landscaping costs';
COMMENT ON COLUMN q11_cost_reduction.q11_text IS 'Free text suggestions for cost reduction';

-- ============================================================
-- 11. Q12: INVOLVEMENT
-- ============================================================

CREATE TABLE q12_involvement (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id) ON DELETE CASCADE,
    q12_response TEXT,
    q12_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE q12_involvement IS 'Willingness to be involved in landscaping solutions';
COMMENT ON COLUMN q12_involvement.q12_response IS 'Involvement preference (Yes/No/Just keep me informed)';
COMMENT ON COLUMN q12_involvement.q12_notes IS 'Additional involvement notes';

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Index on response_id for joins (already primary key, so automatic)
-- Index on common filter fields
CREATE INDEX idx_responses_anonymous ON responses(anonymous);
CREATE INDEX idx_q1_q2_preference ON q1_q2_preference_rating(q1_preference);
CREATE INDEX idx_q1_q2_rating ON q1_q2_preference_rating(q2_service_rating);
CREATE INDEX idx_q9_response ON q9_dues_preference(q9_response);
CREATE INDEX idx_q12_response ON q12_involvement(q12_response);

-- ============================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================

-- Complete response view (joins all tables)
CREATE VIEW complete_responses AS
SELECT 
    r.response_id,
    r.address,
    r.name,
    r.email_contact,
    r.anonymous,
    
    -- Q1/Q2: Preference and Rating
    q1.q1_preference,
    q1.q2_service_rating,
    q1.notes as q1_q2_notes,
    
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
    
    -- Q7: Interest areas
    q7.plant_selection,
    q7.watering_irrigation,
    q7.fertilizing_pest,
    q7.lawn_maintenance,
    q7.seasonal_planning,
    q7.other_interests,
    
    -- Q8: Equipment
    q8.lawn_mower,
    q8.trimmer,
    q8.blower,
    q8.basic_tools,
    q8.truck_trailer,
    q8.notes as equipment_notes,
    
    -- Q9: Dues preference
    q9.q9_response as dues_preference,
    q9.notes as dues_notes,
    
    -- Q10: Biggest concern
    q10.q10_text as biggest_concern,
    
    -- Q11: Cost reduction
    q11.q11_text as cost_reduction_ideas,
    
    -- Q12: Involvement
    q12.q12_response as involvement_preference,
    q12.q12_notes as involvement_notes

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
ORDER BY r.response_id;

COMMENT ON VIEW complete_responses IS 'Complete view of all survey responses with all questions joined';

-- Summary statistics view
CREATE VIEW survey_summary AS
SELECT 
    'Total Responses' as metric,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / COUNT(*), 1) as percentage
FROM responses

UNION ALL

SELECT 
    'Anonymous Responses' as metric,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM responses), 1) as percentage
FROM responses 
WHERE anonymous = 'Yes'

UNION ALL

SELECT 
    'Want to Opt Out' as metric,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM q1_q2_preference_rating), 1) as percentage
FROM q1_q2_preference_rating 
WHERE q1_preference LIKE '%Opt out%'

UNION ALL

SELECT 
    'Keep HOA Landscaping' as metric,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM q1_q2_preference_rating), 1) as percentage
FROM q1_q2_preference_rating 
WHERE q1_preference LIKE '%Keep current HOA%'

UNION ALL

SELECT 
    'Poor/Very Poor Service Rating' as metric,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM q1_q2_preference_rating), 1) as percentage
FROM q1_q2_preference_rating 
WHERE q2_service_rating IN ('Poor', 'Very Poor');

COMMENT ON VIEW survey_summary IS 'High-level statistics about survey responses';

-- ============================================================
-- ROW LEVEL SECURITY (Optional - enable if you need access control)
-- ============================================================

-- Enable RLS on all tables (uncomment if needed)
-- ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE q1_q2_preference_rating ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE q3_opt_out_reasons ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE q4_landscaping_issues ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE q5_q6_construction_group ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE q7_interest_areas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE q8_equipment_ownership ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE q9_dues_preference ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE q10_biggest_concern ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE q11_cost_reduction ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE q12_involvement ENABLE ROW LEVEL SECURITY;

-- Create policies for read access (uncomment and modify if needed)
-- CREATE POLICY "Public read access" ON responses FOR SELECT USING (true);
-- (repeat for other tables as needed)

-- ============================================================
-- COMPLETION MESSAGE
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE 'HOA Survey database schema created successfully!';
    RAISE NOTICE 'Tables created: 11 survey tables + 2 views';
    RAISE NOTICE 'Next step: Run the data import script to populate the tables';
END $$;