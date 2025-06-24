# Finalized Marginal Notes Implementation Plan

## Step-by-Step Execution Plan

### **STEP 1: Database Setup** (User Action Required)

**Action**: Copy and paste the following SQL commands into your Supabase SQL Editor:

```sql
-- Create the survey_notes table
CREATE TABLE survey_notes (
    note_id SERIAL PRIMARY KEY,
    response_id TEXT NOT NULL REFERENCES responses(response_id) ON DELETE CASCADE,
    section TEXT NOT NULL, -- 'q1_q2', 'q3', 'q4', 'q5_q6', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'general', 'contact_info'
    question_context TEXT, -- 'margin', 'header', 'q4_irrigation', 'q10_budget', 'service_rating', 'other_issues', etc.
    note_text TEXT NOT NULL,
    note_type TEXT DEFAULT 'margin_note' CHECK (note_type IN ('margin_note', 'clarification', 'follow_up', 'concern', 'suggestion', 'correction')),
    requires_follow_up BOOLEAN DEFAULT FALSE,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    admin_notes TEXT, -- Internal HOA notes about this note
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_survey_notes_response_id ON survey_notes(response_id);
CREATE INDEX idx_survey_notes_section ON survey_notes(section);
CREATE INDEX idx_survey_notes_requires_follow_up ON survey_notes(requires_follow_up);
CREATE INDEX idx_survey_notes_priority ON survey_notes(priority);
CREATE INDEX idx_survey_notes_resolved ON survey_notes(resolved);
CREATE INDEX idx_survey_notes_note_type ON survey_notes(note_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_survey_notes_updated_at
    BEFORE UPDATE ON survey_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE survey_notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on survey_notes" 
ON survey_notes 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Update complete_responses view
DROP VIEW IF EXISTS complete_responses;

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
    q12.involvement_notes,
    
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

-- Create helper view for notes management
CREATE VIEW survey_notes_with_response_info AS
SELECT 
    sn.*,
    r.address,
    r.name,
    r.anonymous,
    r.review_status
FROM survey_notes sn
JOIN responses r ON sn.response_id = r.response_id
ORDER BY sn.priority DESC, sn.created_at DESC;
```

**Expected Result**: You should see "Success. No rows returned" or similar confirmation.

### **STEP 2: Verification** (User Action Required)

Run this verification query to confirm the table was created:

```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'survey_notes' 
ORDER BY ordinal_position;
```

**Expected Result**: Should show 11 columns (note_id, response_id, section, etc.)

### **STEP 3: Claude Automated Extraction** (Claude Action)

**What I'll do next**:
1. **Create extraction script** using the .env credentials to connect directly to Supabase
2. **Systematically process** all 16 transcription files (001-113)
3. **Extract and insert** notes directly into the survey_notes table
4. **Validate data integrity** and provide summary report

**Expected Output**:
- Approximately 150-200 notes imported
- Critical issues flagged with `priority='critical'` and `requires_follow_up=true`
- Complete extraction log for verification

### **STEP 4: UI Integration** (Claude Action)

**What I'll do**:
1. **Update TypeScript interfaces** to include notes data
2. **Add notes section** to survey view component
3. **Create notes editing interface** with add/edit/delete capabilities
4. **Update dashboard metrics** to show notes requiring follow-up

## Success Metrics

- [x] **Database Setup**: survey_notes table created with proper indexes and constraints
- [ ] **Data Import**: All marginal notes extracted and imported (~150-200 records)
- [ ] **Critical Issues Flagged**: Urgent cases marked for immediate follow-up
- [ ] **UI Integration**: Notes visible and editable in survey view
- [ ] **Quality Control**: All notes properly categorized and linked to survey sections

## Risk Mitigation

- **Backup**: All original transcription files preserved in data-archive
- **Validation**: Each import batch will be verified for data integrity
- **Rollback**: If issues occur, can DROP TABLE survey_notes and restart
- **Testing**: Will test on a few responses first before full import

## Timeline

- **Step 1-2**: 5 minutes (user SQL execution)
- **Step 3**: 30-60 minutes (automated extraction and import)
- **Step 4**: 1-2 hours (UI integration and testing)

---

**Ready to proceed?** Once you confirm the database setup is complete, I'll begin the automated extraction and import process.