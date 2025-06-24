# Database Schema Reference

This document provides the complete current database schema for the HOA Survey Dashboard.

## Core Tables

### `responses` (Main Response Metadata)
```sql
CREATE TABLE responses (
    response_id TEXT PRIMARY KEY,
    address TEXT,
    name TEXT,
    email_contact TEXT,
    anonymous TEXT CHECK (anonymous IN ('Yes', 'No')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Review workflow columns (added later)
    review_status TEXT DEFAULT 'unreviewed' CHECK (review_status IN ('unreviewed', 'in_progress', 'reviewed', 'flagged')),
    reviewed_by TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT
);

CREATE INDEX idx_responses_review_status ON responses(review_status);
```

### Question-Specific Tables

#### `q1_q2_preference_rating` (Questions 1-2: Preference & Service Rating)
```sql
CREATE TABLE q1_q2_preference_rating (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id),
    q1_preference TEXT, -- "Keep current HOA landscaping", "Opt out and hire my own landscaper", "Opt out and maintain it myself"
    q2_service_rating TEXT, -- "Excellent", "Good", "Fair", "Poor", "Very Poor"
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `q3_opt_out_reasons` (Question 3: Why Opt Out)
```sql
CREATE TABLE q3_opt_out_reasons (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id),
    maintain_self TEXT, -- "Yes"/"No"
    quality TEXT,       -- "Yes"/"No"
    pet_safety TEXT,    -- "Yes"/"No"
    privacy TEXT,       -- "Yes"/"No"
    other_text TEXT,    -- Free text for "Other"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `q4_landscaping_issues` (Question 4: Specific Issues)
```sql
CREATE TABLE q4_landscaping_issues (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id),
    irrigation TEXT,           -- "Yes"/"No"
    poor_mowing TEXT,          -- "Yes"/"No"
    property_damage TEXT,      -- "Yes"/"No"
    missed_service TEXT,       -- "Yes"/"No"
    inadequate_weeds TEXT,     -- "Yes"/"No"
    irrigation_detail TEXT,    -- Details about irrigation problems
    other_issues TEXT,         -- Free text for other issues
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `q5_q6_construction_group` (Questions 5-6: Construction & Group Action)
```sql
CREATE TABLE q5_q6_construction_group (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id),
    q5_construction_issues TEXT, -- "Yes - I have photos/documentation", "Yes - but no documentation", "No construction-related issues", "Not sure"
    q5_explanation TEXT,         -- Free text explanation
    q6_group_action TEXT,        -- "Yes", "Maybe", "No", "Need more information"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `q7_interest_areas` (Question 7: Learning/Work Interest)
```sql
CREATE TABLE q7_interest_areas (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id),
    plant_selection TEXT,        -- "Yes"/"No"
    watering_irrigation TEXT,    -- "Yes"/"No"
    fertilizing_pest TEXT,       -- "Yes"/"No"
    lawn_maintenance TEXT,       -- "Yes"/"No"
    seasonal_planning TEXT,      -- "Yes"/"No"
    other_interests TEXT,        -- Free text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `q8_equipment_ownership` (Question 8: Equipment)
```sql
CREATE TABLE q8_equipment_ownership (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id),
    lawn_mower TEXT,       -- "Yes"/"No"
    trimmer TEXT,          -- "Yes"/"No"
    blower TEXT,           -- "Yes"/"No"
    basic_tools TEXT,      -- "Yes"/"No"
    truck_trailer TEXT,    -- "Yes"/"No"
    equipment_notes TEXT,  -- Additional notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `q9_dues_preference` (Question 9: Dues Preference)
```sql
CREATE TABLE q9_dues_preference (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id),
    dues_preference TEXT,  -- Free text response about opt-out preferences
    dues_notes TEXT,       -- Additional notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `q10_biggest_concern` (Question 10: Financial Concerns)
```sql
CREATE TABLE q10_biggest_concern (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id),
    biggest_concern TEXT,  -- Free text response
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `q11_cost_reduction` (Question 11: Cost Reduction Ideas)
```sql
CREATE TABLE q11_cost_reduction (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id),
    cost_reduction_ideas TEXT,  -- Free text response
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `q12_involvement` (Question 12: Involvement Preference)
```sql
CREATE TABLE q12_involvement (
    response_id TEXT PRIMARY KEY REFERENCES responses(response_id),
    involvement_preference TEXT, -- "Yes", "No"
    involvement_notes TEXT,      -- Additional notes/contact info
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Views

### `complete_responses` (Comprehensive Join)
```sql
CREATE VIEW complete_responses AS
SELECT 
    r.*,
    -- Q1/Q2: Preference and Rating
    q1q2.q1_preference,
    q1q2.q2_service_rating,
    q1q2.notes as q1_q2_notes,
    
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
    
    -- Q8: Equipment
    q8.lawn_mower,
    q8.trimmer,
    q8.blower,
    q8.basic_tools,
    q8.truck_trailer,
    q8.equipment_notes,
    
    -- Q9: Dues preference
    q9.dues_preference,
    q9.dues_notes,
    
    -- Q10: Biggest concern
    q10.biggest_concern,
    
    -- Q11: Cost reduction
    q11.cost_reduction_ideas,
    
    -- Q12: Involvement
    q12.involvement_preference,
    q12.involvement_notes

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
ORDER BY r.response_id;
```

## Data Integrity Notes

- **response_id**: String format "001", "002", etc. (113 total responses)
- **Review Status**: All responses default to 'unreviewed' for quality control workflow
- **Contact Information**: Stored as free text in `email_contact`, parsed by `parseContactInfo()` utility
- **Service Ratings**: Normalized using `normalizeServiceRating()` for edge cases
- **Yes/No Fields**: Stored as "Yes"/"No" strings, not booleans
- **Anonymous Responses**: Identified by `anonymous = 'Yes'` and typically have "Not provided" for name/contact

## Current Status (as of latest update)

- **Total Responses**: 113 
- **Review Status**: All currently 'unreviewed' (ready for quality control)
- **Data Completeness**: All survey responses fully imported and normalized
- **Schema Version**: Includes review workflow columns added for quality control