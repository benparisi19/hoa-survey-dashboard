# HOA Survey Data - Supabase Setup Guide

## 🎯 Overview

This guide will help you set up your HOA survey data in Supabase, giving you:
- **Professional database** with PostgreSQL power
- **Web dashboard** for easy data exploration
- **Auto-generated API** for future integrations
- **Real-time features** if needed
- **Free tier** perfect for this dataset

## 🚀 Step 1: Create Supabase Project

1. **Go to Supabase**: Visit [https://supabase.com](https://supabase.com)
2. **Sign up/Login**: Create account or sign in
3. **Create New Project**:
   - Click "New project"
   - Organization: Choose or create one
   - Name: `HOA Survey Data` 
   - Database Password: Choose a strong password (save it!)
         $6z%Mq?Se-ZJrTN
   - Region: Choose closest to you
   - Pricing: Select "Free tier"
4. **Wait for setup**: Takes 1-2 minutes to provision

## 🗄️ Step 2: Create Database Schema

1. **Open SQL Editor**:
   - In your project dashboard, click "SQL Editor" in the left sidebar
   - Click "New query"

2. **Run Schema Script**:
   - Copy the entire contents of `supabase_schema.sql`
   - Paste into the SQL editor
   - Click "Run" (or Ctrl/Cmd + Enter)
   - You should see success messages

3. **Verify Tables Created**:
   - Click "Table Editor" in left sidebar
   - You should see 11 tables created:
     - responses
     - q1_q2_preference_rating
     - q3_opt_out_reasons
     - q4_landscaping_issues
     - q5_q6_construction_group
     - q7_interest_areas
     - q8_equipment_ownership
     - q9_dues_preference
     - q10_biggest_concern
     - q11_cost_reduction
     - q12_involvement

## 📊 Step 3: Import Survey Data

1. **New SQL Query**:
   - In SQL Editor, click "New query"
   - Copy the entire contents of `supabase_data_import.sql`
   - Paste into the SQL editor
   - Click "Run"

2. **Verify Data Import**:
   - Should see "113 rows affected" type messages
   - Go to Table Editor → responses table
   - You should see 113 rows (responses 001-113)

## 🎛️ Step 4: Explore Your Data

### Using the Table Editor (Easy Mode)

1. **Browse Tables**:
   - Click "Table Editor" in sidebar
   - Click any table name to see the data
   - Use filters at the top to narrow down results

2. **Filter Examples**:
   - In `q1_q2_preference_rating` table:
     - Filter `q2_service_rating` = "Poor" to see dissatisfied responses
     - Filter `q1_preference` contains "Opt out" to see who wants to leave
   
3. **View Individual Responses**:
   - Click any row to see full details
   - Use the response_id to cross-reference across tables

### Using SQL Queries (Power Mode)

1. **SQL Editor Queries**:
   - Click "SQL Editor" → "New query"
   - Try the example queries below

## 📈 Useful Analysis Queries

### Quick Overview
```sql
-- Get basic statistics
SELECT * FROM survey_summary;
```

### Service Rating Analysis
```sql
-- Count by service rating
SELECT 
    q2_service_rating,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM q1_q2_preference_rating 
WHERE q2_service_rating IS NOT NULL
GROUP BY q2_service_rating
ORDER BY count DESC;
```

### Preference Analysis
```sql
-- What do people want?
SELECT 
    q1_preference,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM q1_q2_preference_rating 
WHERE q1_preference IS NOT NULL
GROUP BY q1_preference
ORDER BY count DESC;
```

### Find Responses with Issues
```sql
-- People reporting landscaping problems
SELECT 
    r.response_id,
    r.address,
    r.name,
    q4.irrigation,
    q4.poor_mowing,
    q4.property_damage,
    q4.other_issues
FROM responses r
JOIN q4_landscaping_issues q4 ON r.response_id = q4.response_id
WHERE q4.irrigation = 'Yes' 
   OR q4.poor_mowing = 'Yes' 
   OR q4.property_damage = 'Yes'
ORDER BY r.response_id;
```

### Equipment Ownership Analysis
```sql
-- Who has landscaping equipment?
SELECT 
    'Lawn Mower' as equipment,
    COUNT(CASE WHEN lawn_mower = 'Yes' THEN 1 END) as owners,
    COUNT(*) as total_responses,
    ROUND(COUNT(CASE WHEN lawn_mower = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1) as percentage
FROM q8_equipment_ownership

UNION ALL

SELECT 
    'Trimmer' as equipment,
    COUNT(CASE WHEN trimmer = 'Yes' THEN 1 END) as owners,
    COUNT(*) as total_responses,
    ROUND(COUNT(CASE WHEN trimmer = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1) as percentage
FROM q8_equipment_ownership

UNION ALL

SELECT 
    'Blower' as equipment,
    COUNT(CASE WHEN blower = 'Yes' THEN 1 END) as owners,
    COUNT(*) as total_responses,
    ROUND(COUNT(CASE WHEN blower = 'Yes' THEN 1 END) * 100.0 / COUNT(*), 1) as percentage
FROM q8_equipment_ownership;
```

### Complete Response View
```sql
-- Get all data for a specific response
SELECT * FROM complete_responses 
WHERE response_id = '019';  -- Change to any response ID
```

### Cross-Reference Analysis
```sql
-- Compare service rating vs preference
SELECT 
    q1.q2_service_rating,
    q1.q1_preference,
    COUNT(*) as count
FROM q1_q2_preference_rating q1
WHERE q1.q2_service_rating IS NOT NULL 
  AND q1.q1_preference IS NOT NULL
GROUP BY q1.q2_service_rating, q1.q1_preference
ORDER BY q1.q2_service_rating, count DESC;
```

## 📱 Step 5: Share Access (Optional)

### For HOA Board Members:

1. **Invite Users**:
   - Go to "Settings" → "Team"
   - Click "Invite a member"
   - Add their email
   - Choose role (Owner/Admin/Developer/Read-only)

2. **Read-Only Access**:
   - For board members who just need to view data
   - They can use Table Editor but not modify data

### Generate Public Links:
- You can create shareable dashboard views
- Use the API to create custom reports
- Export data to Excel/PDF for presentations

## 🔧 Step 6: Advanced Features

### Row Level Security (RLS)
- Uncomment RLS policies in schema if you need access control
- Useful if different people should see different data

### Real-time Subscriptions
- Get notified when data changes
- Useful if you're still collecting responses

### API Access
- Auto-generated REST API for your data
- Useful for building custom dashboards or integrations

## 📋 Maintenance

### Adding New Responses:
```sql
-- If you get more survey responses, insert them like this:
INSERT INTO responses (response_id, address, name, email_contact, anonymous) 
VALUES ('114', '123 New St', 'John Doe', 'john@email.com', 'No');

-- Then add corresponding data to each question table...
```

### Data Export:
```sql
-- Export complete dataset
SELECT * FROM complete_responses;
```
- Copy results and paste into Excel
- Use browser tools to download as CSV

### Backup:
- Supabase handles backups automatically on free tier
- You can also export your schema and data manually

## 🎉 You're Done!

Your HOA survey data is now in a professional database with:
- ✅ **11 normalized tables** with proper relationships
- ✅ **113 survey responses** ready for analysis  
- ✅ **Web dashboard** for easy exploration
- ✅ **SQL queries** for deep analysis
- ✅ **Shareable access** for board members
- ✅ **API access** for future needs

## 🆘 Troubleshooting

**Schema creation fails:**
- Make sure you copied the entire `supabase_schema.sql` file
- Check for any syntax errors in the output

**Data import fails:**
- Run schema first, then data import
- Check that all 113 INSERT statements completed
- Verify response_id format is consistent

**Can't see data:**
- Refresh the page
- Check Table Editor → responses table
- Make sure data import completed successfully

**Need help:**
- Supabase has excellent documentation
- HOA board can share access for collaborative troubleshooting
- Consider hiring a developer for custom features

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQL Tutorial](https://www.w3schools.com/sql/)
- [Supabase Dashboard Guide](https://supabase.com/docs/guides/getting-started)