-- HOA Survey Analysis Queries for Supabase
-- Copy and paste these queries into the Supabase SQL Editor for analysis

-- ============================================================
-- 1. EXECUTIVE SUMMARY QUERIES
-- ============================================================

-- Overall survey statistics
SELECT * FROM survey_summary;

-- Response rate by anonymity
SELECT 
    anonymous,
    COUNT(*) as responses,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM responses
GROUP BY anonymous
ORDER BY responses DESC;

-- ============================================================
-- 2. SERVICE SATISFACTION ANALYSIS
-- ============================================================

-- Service rating distribution
SELECT 
    q2_service_rating as "Service Rating",
    COUNT(*) as "Count",
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as "Percentage"
FROM q1_q2_preference_rating 
WHERE q2_service_rating IS NOT NULL
GROUP BY q2_service_rating
ORDER BY 
    CASE q2_service_rating
        WHEN 'Excellent' THEN 1
        WHEN 'Good' THEN 2  
        WHEN 'Fair' THEN 3
        WHEN 'Poor' THEN 4
        WHEN 'Very Poor' THEN 5
        ELSE 6
    END;

-- Landscaping preference breakdown
SELECT 
    q1_preference as "Preference",
    COUNT(*) as "Count",
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as "Percentage"
FROM q1_q2_preference_rating 
WHERE q1_preference IS NOT NULL
GROUP BY q1_preference
ORDER BY COUNT(*) DESC;

-- Cross-analysis: Rating vs Preference
SELECT 
    q2_service_rating as "Service Rating",
    q1_preference as "Preference",
    COUNT(*) as "Count"
FROM q1_q2_preference_rating
WHERE q2_service_rating IS NOT NULL AND q1_preference IS NOT NULL
GROUP BY q2_service_rating, q1_preference
ORDER BY q2_service_rating, COUNT(*) DESC;

-- ============================================================
-- 3. LANDSCAPING ISSUES ANALYSIS
-- ============================================================

-- Most common landscaping problems
SELECT 
    'Irrigation Issues' as problem_type,
    COUNT(CASE WHEN irrigation = 'Yes' THEN 1 END) as count,
    ROUND(COUNT(CASE WHEN irrigation = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1) as percentage
FROM q4_landscaping_issues

UNION ALL

SELECT 
    'Poor Mowing',
    COUNT(CASE WHEN poor_mowing = 'Yes' THEN 1 END),
    ROUND(COUNT(CASE WHEN poor_mowing = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1)
FROM q4_landscaping_issues

UNION ALL

SELECT 
    'Property Damage',
    COUNT(CASE WHEN property_damage = 'Yes' THEN 1 END),
    ROUND(COUNT(CASE WHEN property_damage = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1)
FROM q4_landscaping_issues

UNION ALL

SELECT 
    'Missed Service',
    COUNT(CASE WHEN missed_service = 'Yes' THEN 1 END),
    ROUND(COUNT(CASE WHEN missed_service = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1)
FROM q4_landscaping_issues

UNION ALL

SELECT 
    'Inadequate Weed Control',
    COUNT(CASE WHEN inadequate_weeds = 'Yes' THEN 1 END),
    ROUND(COUNT(CASE WHEN inadequate_weeds = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1)
FROM q4_landscaping_issues

ORDER BY count DESC;

-- Responses with multiple issues
SELECT 
    r.response_id,
    r.address,
    r.name,
    CASE WHEN q4.irrigation = 'Yes' THEN 'Irrigation, ' ELSE '' END ||
    CASE WHEN q4.poor_mowing = 'Yes' THEN 'Poor Mowing, ' ELSE '' END ||
    CASE WHEN q4.property_damage = 'Yes' THEN 'Property Damage, ' ELSE '' END ||
    CASE WHEN q4.missed_service = 'Yes' THEN 'Missed Service, ' ELSE '' END ||
    CASE WHEN q4.inadequate_weeds = 'Yes' THEN 'Inadequate Weeds, ' ELSE '' END as issues,
    q4.other_issues
FROM responses r
JOIN q4_landscaping_issues q4 ON r.response_id = q4.response_id
WHERE (q4.irrigation = 'Yes' OR q4.poor_mowing = 'Yes' OR q4.property_damage = 'Yes' 
       OR q4.missed_service = 'Yes' OR q4.inadequate_weeds = 'Yes')
ORDER BY r.response_id;

-- ============================================================
-- 4. DUES AND COST ANALYSIS
-- ============================================================

-- Dues preference breakdown
SELECT 
    q9_response as "Dues Preference",
    COUNT(*) as "Count",
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as "Percentage"
FROM q9_dues_preference
WHERE q9_response IS NOT NULL
GROUP BY q9_response
ORDER BY COUNT(*) DESC;

-- Cost reduction ideas summary
SELECT 
    response_id,
    LEFT(q11_text, 100) || '...' as cost_reduction_idea
FROM q11_cost_reduction
WHERE q11_text IS NOT NULL 
  AND TRIM(q11_text) != ''
  AND TRIM(q11_text) != '-'
ORDER BY response_id;

-- ============================================================
-- 5. EQUIPMENT AND SELF-MAINTENANCE CAPABILITY
-- ============================================================

-- Equipment ownership analysis
SELECT 
    'Lawn Mower' as equipment,
    COUNT(CASE WHEN lawn_mower = 'Yes' THEN 1 END) as "Yes",
    COUNT(CASE WHEN lawn_mower = 'No' THEN 1 END) as "No",
    COUNT(*) as "Total Responses",
    ROUND(COUNT(CASE WHEN lawn_mower = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1) as "% Yes"
FROM q8_equipment_ownership

UNION ALL

SELECT 
    'Trimmer/Edger',
    COUNT(CASE WHEN trimmer = 'Yes' THEN 1 END),
    COUNT(CASE WHEN trimmer = 'No' THEN 1 END),
    COUNT(*),
    ROUND(COUNT(CASE WHEN trimmer = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1)
FROM q8_equipment_ownership

UNION ALL

SELECT 
    'Leaf Blower',
    COUNT(CASE WHEN blower = 'Yes' THEN 1 END),
    COUNT(CASE WHEN blower = 'No' THEN 1 END),
    COUNT(*),
    ROUND(COUNT(CASE WHEN blower = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1)
FROM q8_equipment_ownership

UNION ALL

SELECT 
    'Basic Tools',
    COUNT(CASE WHEN basic_tools = 'Yes' THEN 1 END),
    COUNT(CASE WHEN basic_tools = 'No' THEN 1 END),
    COUNT(*),
    ROUND(COUNT(CASE WHEN basic_tools = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1)
FROM q8_equipment_ownership

UNION ALL

SELECT 
    'Truck/Trailer',
    COUNT(CASE WHEN truck_trailer = 'Yes' THEN 1 END),
    COUNT(CASE WHEN truck_trailer = 'No' THEN 1 END),
    COUNT(*),
    ROUND(COUNT(CASE WHEN truck_trailer = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1)
FROM q8_equipment_ownership

ORDER BY "% Yes" DESC;

-- Self-maintenance readiness score
SELECT 
    r.response_id,
    r.address,
    r.name,
    COALESCE(
        (CASE WHEN q8.lawn_mower = 'Yes' THEN 1 ELSE 0 END) +
        (CASE WHEN q8.trimmer = 'Yes' THEN 1 ELSE 0 END) +
        (CASE WHEN q8.blower = 'Yes' THEN 1 ELSE 0 END) +
        (CASE WHEN q8.basic_tools = 'Yes' THEN 1 ELSE 0 END) +
        (CASE WHEN q8.truck_trailer = 'Yes' THEN 1 ELSE 0 END), 0
    ) as equipment_score,
    q1.q1_preference
FROM responses r
LEFT JOIN q8_equipment_ownership q8 ON r.response_id = q8.response_id
LEFT JOIN q1_q2_preference_rating q1 ON r.response_id = q1.response_id
WHERE q1.q1_preference LIKE '%Opt out%'
ORDER BY equipment_score DESC, r.response_id;

-- ============================================================
-- 6. COMMUNITY ENGAGEMENT ANALYSIS
-- ============================================================

-- Involvement willingness
SELECT 
    q12_response as "Involvement Level",
    COUNT(*) as "Count",
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as "Percentage"
FROM q12_involvement
WHERE q12_response IS NOT NULL
GROUP BY q12_response
ORDER BY COUNT(*) DESC;

-- Group action interest
SELECT 
    q6_group_action as "Group Action Interest",
    COUNT(*) as "Count",
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as "Percentage"
FROM q5_q6_construction_group
WHERE q6_group_action IS NOT NULL
GROUP BY q6_group_action
ORDER BY 
    CASE q6_group_action
        WHEN 'Yes' THEN 1
        WHEN 'Maybe' THEN 2
        WHEN 'No' THEN 3
        ELSE 4
    END;

-- Learning interests analysis
SELECT 
    'Plant Selection' as interest_area,
    COUNT(CASE WHEN plant_selection = 'Yes' THEN 1 END) as interested,
    ROUND(COUNT(CASE WHEN plant_selection = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1) as percentage
FROM q7_interest_areas

UNION ALL

SELECT 
    'Watering/Irrigation',
    COUNT(CASE WHEN watering_irrigation = 'Yes' THEN 1 END),
    ROUND(COUNT(CASE WHEN watering_irrigation = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1)
FROM q7_interest_areas

UNION ALL

SELECT 
    'Fertilizing/Pest Control',
    COUNT(CASE WHEN fertilizing_pest = 'Yes' THEN 1 END),
    ROUND(COUNT(CASE WHEN fertilizing_pest = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1)
FROM q7_interest_areas

UNION ALL

SELECT 
    'Lawn Maintenance',
    COUNT(CASE WHEN lawn_maintenance = 'Yes' THEN 1 END),
    ROUND(COUNT(CASE WHEN lawn_maintenance = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1)
FROM q7_interest_areas

UNION ALL

SELECT 
    'Seasonal Planning',
    COUNT(CASE WHEN seasonal_planning = 'Yes' THEN 1 END),
    ROUND(COUNT(CASE WHEN seasonal_planning = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1)
FROM q7_interest_areas

ORDER BY percentage DESC;

-- ============================================================
-- 7. BIGGEST CONCERNS ANALYSIS
-- ============================================================

-- All biggest concerns (for manual review)
SELECT 
    r.response_id,
    r.address,
    q10.q10_text as biggest_concern,
    q1.q2_service_rating
FROM responses r
LEFT JOIN q10_biggest_concern q10 ON r.response_id = q10.response_id
LEFT JOIN q1_q2_preference_rating q1 ON r.response_id = q1.response_id
WHERE q10.q10_text IS NOT NULL 
  AND TRIM(q10.q10_text) != ''
  AND TRIM(q10.q10_text) != '-'
ORDER BY r.response_id;

-- ============================================================
-- 8. CONSTRUCTION ISSUES ANALYSIS
-- ============================================================

-- Construction-related problems
SELECT 
    q5_construction_issues as "Has Construction Issues",
    COUNT(*) as "Count",
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as "Percentage"
FROM q5_q6_construction_group
WHERE q5_construction_issues IS NOT NULL
GROUP BY q5_construction_issues
ORDER BY COUNT(*) DESC;

-- Construction issue details
SELECT 
    r.response_id,
    r.address,
    q5.q5_construction_issues,
    q5.q5_explanation,
    q5.q6_group_action
FROM responses r
JOIN q5_q6_construction_group q5 ON r.response_id = q5.response_id
WHERE q5.q5_construction_issues = 'Yes - I have photos/documentation'
   OR q5.q5_construction_issues = 'Yes - but no documentation'
ORDER BY r.response_id;

-- ============================================================
-- 9. ANONYMITY AND CONTACT ANALYSIS
-- ============================================================

-- Contact information availability
SELECT 
    CASE 
        WHEN email_contact IS NOT NULL AND TRIM(email_contact) != '' AND TRIM(email_contact) != 'Not provided' THEN 'Has Contact Info'
        ELSE 'No Contact Info'
    END as contact_status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM responses
GROUP BY 
    CASE 
        WHEN email_contact IS NOT NULL AND TRIM(email_contact) != '' AND TRIM(email_contact) != 'Not provided' THEN 'Has Contact Info'
        ELSE 'No Contact Info'
    END;

-- Responses with contact info who want involvement
SELECT 
    r.response_id,
    r.address,
    r.name,
    r.email_contact,
    q12.q12_response,
    q1.q1_preference
FROM responses r
JOIN q12_involvement q12 ON r.response_id = q12.response_id
LEFT JOIN q1_q2_preference_rating q1 ON r.response_id = q1.response_id
WHERE r.email_contact IS NOT NULL 
  AND TRIM(r.email_contact) != '' 
  AND TRIM(r.email_contact) != 'Not provided'
  AND q12.q12_response = 'Yes'
ORDER BY r.response_id;

-- ============================================================
-- 10. COMPLETE PROFILE QUERIES
-- ============================================================

-- High-priority responses (multiple issues, want change, have contact info)
SELECT 
    r.response_id,
    r.address,
    r.name,
    r.email_contact,
    q1.q1_preference,
    q1.q2_service_rating,
    q10.q10_text as biggest_concern
FROM responses r
JOIN q1_q2_preference_rating q1 ON r.response_id = q1.response_id
LEFT JOIN q10_biggest_concern q10 ON r.response_id = q10.response_id
WHERE q1.q2_service_rating IN ('Poor', 'Very Poor')
  AND q1.q1_preference LIKE '%Opt out%'
  AND r.email_contact IS NOT NULL 
  AND TRIM(r.email_contact) != '' 
  AND TRIM(r.email_contact) != 'Not provided'
ORDER BY r.response_id;

-- Get complete data for specific response (change '019' to any response ID)
SELECT * FROM complete_responses 
WHERE response_id = '019';

-- Find similar responses based on preferences and ratings
SELECT 
    r.response_id,
    r.address,
    q1.q1_preference,
    q1.q2_service_rating,
    q9.q9_response
FROM responses r
JOIN q1_q2_preference_rating q1 ON r.response_id = q1.response_id
LEFT JOIN q9_dues_preference q9 ON r.response_id = q9.response_id
WHERE q1.q1_preference = (
    SELECT q1_preference 
    FROM q1_q2_preference_rating 
    WHERE response_id = '019'  -- Change this to compare against different response
)
ORDER BY r.response_id;

-- ============================================================
-- 11. EXPORT QUERIES FOR BOARD PRESENTATIONS
-- ============================================================

-- Summary for board presentation
SELECT 
    'Total Survey Responses' as metric,
    '113' as value
UNION ALL
SELECT 
    'Response Rate (if 113 households)',
    '100%'
UNION ALL
SELECT 
    'Want to Opt Out',
    CAST(COUNT(*) as TEXT) || ' (' || ROUND(COUNT(*) * 100.0 / 113, 1) || '%)'
FROM q1_q2_preference_rating 
WHERE q1_preference LIKE '%Opt out%'
UNION ALL
SELECT 
    'Poor/Very Poor Service Rating',
    CAST(COUNT(*) as TEXT) || ' (' || ROUND(COUNT(*) * 100.0 / 113, 1) || '%)'
FROM q1_q2_preference_rating 
WHERE q2_service_rating IN ('Poor', 'Very Poor')
UNION ALL
SELECT 
    'Have Irrigation Issues',
    CAST(COUNT(*) as TEXT) || ' (' || ROUND(COUNT(*) * 100.0 / 113, 1) || '%)'
FROM q4_landscaping_issues 
WHERE irrigation = 'Yes';

-- Action items for board
SELECT 
    '1. Contact Dissatisfied Residents' as action_item,
    'Follow up with ' || COUNT(*) || ' residents who rated service Poor/Very Poor and provided contact info' as details
FROM responses r
JOIN q1_q2_preference_rating q1 ON r.response_id = q1.response_id
WHERE q1.q2_service_rating IN ('Poor', 'Very Poor')
  AND r.email_contact IS NOT NULL 
  AND TRIM(r.email_contact) != '' 
  AND TRIM(r.email_contact) != 'Not provided'

UNION ALL

SELECT 
    '2. Address Irrigation Issues',
    'Investigate and fix irrigation problems affecting ' || COUNT(*) || ' properties'
FROM q4_landscaping_issues 
WHERE irrigation = 'Yes'

UNION ALL

SELECT 
    '3. Review Landscaping Contract',
    'Consider contract changes based on ' || COUNT(*) || ' responses wanting to opt out'
FROM q1_q2_preference_rating 
WHERE q1_preference LIKE '%Opt out%';