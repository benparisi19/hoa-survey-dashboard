#!/usr/bin/env python3
"""
Generate SQL INSERT statements for Supabase from survey JSON data
"""

import json
import re
from pathlib import Path

class SupabaseDataGenerator:
    def __init__(self, json_file):
        self.json_file = Path(json_file)
        self.base_dir = self.json_file.parent
        
    def load_data(self):
        """Load the JSON data"""
        with open(self.json_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def escape_sql_string(self, value):
        """Escape a string for SQL insertion"""
        if value is None:
            return 'NULL'
        
        # Convert to string and handle empty values
        str_value = str(value).strip()
        if not str_value or str_value == '-':
            return 'NULL'
        
        # Escape single quotes by doubling them
        escaped = str_value.replace("'", "''")
        
        # Wrap in single quotes
        return f"'{escaped}'"
    
    def generate_insert_statements(self, data):
        """Generate SQL INSERT statements for all tables"""
        
        sql_statements = []
        
        # Header comment
        sql_statements.append("-- HOA Survey Data Import for Supabase")
        sql_statements.append("-- Generated from survey_parser.py output")
        sql_statements.append("-- Run this after creating the schema")
        sql_statements.append("")
        sql_statements.append("BEGIN;")
        sql_statements.append("")
        
        # 1. Insert into responses table first (parent table)
        sql_statements.append("-- ============================================================")
        sql_statements.append("-- INSERT RESPONSES (Main respondent information)")
        sql_statements.append("-- ============================================================")
        sql_statements.append("")
        
        for row in data:
            response_id = self.escape_sql_string(row['response_id'])
            address = self.escape_sql_string(row.get('summary_address', ''))
            name = self.escape_sql_string(row.get('summary_name', ''))
            email_contact = self.escape_sql_string(row.get('summary_email_contact', ''))
            anonymous = self.escape_sql_string(row.get('summary_anonymous', ''))
            
            sql = f"""INSERT INTO responses (response_id, address, name, email_contact, anonymous) 
VALUES ({response_id}, {address}, {name}, {email_contact}, {anonymous});"""
            sql_statements.append(sql)
        
        sql_statements.append("")
        
        # 2. Q1 & Q2: Preference & Service Rating
        sql_statements.append("-- ============================================================")
        sql_statements.append("-- INSERT Q1 & Q2: PREFERENCE & SERVICE RATING")
        sql_statements.append("-- ============================================================")
        sql_statements.append("")
        
        for row in data:
            response_id = self.escape_sql_string(row['response_id'])
            q1_preference = self.escape_sql_string(row.get('q1_q2_q1_preference', ''))
            q2_service_rating = self.escape_sql_string(row.get('q1_q2_q2_service_rating', ''))
            notes = self.escape_sql_string(row.get('q1_q2_notes', ''))
            
            sql = f"""INSERT INTO q1_q2_preference_rating (response_id, q1_preference, q2_service_rating, notes) 
VALUES ({response_id}, {q1_preference}, {q2_service_rating}, {notes});"""
            sql_statements.append(sql)
        
        sql_statements.append("")
        
        # 3. Q3: Opt-out reasons
        sql_statements.append("-- ============================================================")
        sql_statements.append("-- INSERT Q3: OPT-OUT REASONS")
        sql_statements.append("-- ============================================================")
        sql_statements.append("")
        
        for row in data:
            response_id = self.escape_sql_string(row['response_id'])
            q3_na = self.escape_sql_string(row.get('q3_q3_na', ''))
            maintain_self = self.escape_sql_string(row.get('q3_maintain_self', ''))
            quality = self.escape_sql_string(row.get('q3_quality', ''))
            pet_safety = self.escape_sql_string(row.get('q3_pet_safety', ''))
            privacy = self.escape_sql_string(row.get('q3_privacy', ''))
            other_text = self.escape_sql_string(row.get('q3_other_text', ''))
            
            sql = f"""INSERT INTO q3_opt_out_reasons (response_id, q3_na, maintain_self, quality, pet_safety, privacy, other_text) 
VALUES ({response_id}, {q3_na}, {maintain_self}, {quality}, {pet_safety}, {privacy}, {other_text});"""
            sql_statements.append(sql)
        
        sql_statements.append("")
        
        # 4. Q4: Landscaping issues
        sql_statements.append("-- ============================================================")
        sql_statements.append("-- INSERT Q4: LANDSCAPING ISSUES")
        sql_statements.append("-- ============================================================")
        sql_statements.append("")
        
        for row in data:
            response_id = self.escape_sql_string(row['response_id'])
            irrigation = self.escape_sql_string(row.get('q4_irrigation', ''))
            poor_mowing = self.escape_sql_string(row.get('q4_poor_mowing', ''))
            property_damage = self.escape_sql_string(row.get('q4_property_damage', ''))
            missed_service = self.escape_sql_string(row.get('q4_missed_service', ''))
            inadequate_weeds = self.escape_sql_string(row.get('q4_inadequate_weeds', ''))
            irrigation_detail = self.escape_sql_string(row.get('q4_irrigation_detail', ''))
            other_issues = self.escape_sql_string(row.get('q4_other_issues', ''))
            
            sql = f"""INSERT INTO q4_landscaping_issues (response_id, irrigation, poor_mowing, property_damage, missed_service, inadequate_weeds, irrigation_detail, other_issues) 
VALUES ({response_id}, {irrigation}, {poor_mowing}, {property_damage}, {missed_service}, {inadequate_weeds}, {irrigation_detail}, {other_issues});"""
            sql_statements.append(sql)
        
        sql_statements.append("")
        
        # 5. Q5 & Q6: Construction & Group Action
        sql_statements.append("-- ============================================================")
        sql_statements.append("-- INSERT Q5 & Q6: CONSTRUCTION & GROUP ACTION")
        sql_statements.append("-- ============================================================")
        sql_statements.append("")
        
        for row in data:
            response_id = self.escape_sql_string(row['response_id'])
            q5_construction_issues = self.escape_sql_string(row.get('q5_q6_q5_construction_issues', ''))
            q5_explanation = self.escape_sql_string(row.get('q5_q6_q5_explanation', ''))
            q6_group_action = self.escape_sql_string(row.get('q5_q6_q6_group_action', ''))
            
            sql = f"""INSERT INTO q5_q6_construction_group (response_id, q5_construction_issues, q5_explanation, q6_group_action) 
VALUES ({response_id}, {q5_construction_issues}, {q5_explanation}, {q6_group_action});"""
            sql_statements.append(sql)
        
        sql_statements.append("")
        
        # 6. Q7: Interest areas
        sql_statements.append("-- ============================================================")
        sql_statements.append("-- INSERT Q7: INTEREST AREAS")
        sql_statements.append("-- ============================================================")
        sql_statements.append("")
        
        for row in data:
            response_id = self.escape_sql_string(row['response_id'])
            q7_na = self.escape_sql_string(row.get('q7_q7_na', ''))
            plant_selection = self.escape_sql_string(row.get('q7_plant_selection', ''))
            watering_irrigation = self.escape_sql_string(row.get('q7_watering_irrigation', ''))
            fertilizing_pest = self.escape_sql_string(row.get('q7_fertilizing_pest', ''))
            lawn_maintenance = self.escape_sql_string(row.get('q7_lawn_maintenance', ''))
            seasonal_planning = self.escape_sql_string(row.get('q7_seasonal_planning', ''))
            other_interests = self.escape_sql_string(row.get('q7_other_interests', ''))
            
            sql = f"""INSERT INTO q7_interest_areas (response_id, q7_na, plant_selection, watering_irrigation, fertilizing_pest, lawn_maintenance, seasonal_planning, other_interests) 
VALUES ({response_id}, {q7_na}, {plant_selection}, {watering_irrigation}, {fertilizing_pest}, {lawn_maintenance}, {seasonal_planning}, {other_interests});"""
            sql_statements.append(sql)
        
        sql_statements.append("")
        
        # 7. Q8: Equipment ownership
        sql_statements.append("-- ============================================================")
        sql_statements.append("-- INSERT Q8: EQUIPMENT OWNERSHIP")
        sql_statements.append("-- ============================================================")
        sql_statements.append("")
        
        for row in data:
            response_id = self.escape_sql_string(row['response_id'])
            q8_na = self.escape_sql_string(row.get('q8_q8_na', ''))
            lawn_mower = self.escape_sql_string(row.get('q8_lawn_mower', ''))
            trimmer = self.escape_sql_string(row.get('q8_trimmer', ''))
            blower = self.escape_sql_string(row.get('q8_blower', ''))
            basic_tools = self.escape_sql_string(row.get('q8_basic_tools', ''))
            truck_trailer = self.escape_sql_string(row.get('q8_truck_trailer', ''))
            notes = self.escape_sql_string(row.get('q8_notes', ''))
            
            sql = f"""INSERT INTO q8_equipment_ownership (response_id, q8_na, lawn_mower, trimmer, blower, basic_tools, truck_trailer, notes) 
VALUES ({response_id}, {q8_na}, {lawn_mower}, {trimmer}, {blower}, {basic_tools}, {truck_trailer}, {notes});"""
            sql_statements.append(sql)
        
        sql_statements.append("")
        
        # 8. Q9: Dues preference
        sql_statements.append("-- ============================================================")
        sql_statements.append("-- INSERT Q9: DUES PREFERENCE")
        sql_statements.append("-- ============================================================")
        sql_statements.append("")
        
        for row in data:
            response_id = self.escape_sql_string(row['response_id'])
            q9_response = self.escape_sql_string(row.get('q9_q9_response', ''))
            notes = self.escape_sql_string(row.get('q9_notes', ''))
            
            sql = f"""INSERT INTO q9_dues_preference (response_id, q9_response, notes) 
VALUES ({response_id}, {q9_response}, {notes});"""
            sql_statements.append(sql)
        
        sql_statements.append("")
        
        # 9. Q10: Biggest concern
        sql_statements.append("-- ============================================================")
        sql_statements.append("-- INSERT Q10: BIGGEST CONCERN")
        sql_statements.append("-- ============================================================")
        sql_statements.append("")
        
        for row in data:
            response_id = self.escape_sql_string(row['response_id'])
            q10_text = self.escape_sql_string(row.get('q10_q10_text', ''))
            
            sql = f"""INSERT INTO q10_biggest_concern (response_id, q10_text) 
VALUES ({response_id}, {q10_text});"""
            sql_statements.append(sql)
        
        sql_statements.append("")
        
        # 10. Q11: Cost reduction
        sql_statements.append("-- ============================================================")
        sql_statements.append("-- INSERT Q11: COST REDUCTION IDEAS")
        sql_statements.append("-- ============================================================")
        sql_statements.append("")
        
        for row in data:
            response_id = self.escape_sql_string(row['response_id'])
            q11_text = self.escape_sql_string(row.get('q11_q11_text', ''))
            
            sql = f"""INSERT INTO q11_cost_reduction (response_id, q11_text) 
VALUES ({response_id}, {q11_text});"""
            sql_statements.append(sql)
        
        sql_statements.append("")
        
        # 11. Q12: Involvement
        sql_statements.append("-- ============================================================")
        sql_statements.append("-- INSERT Q12: INVOLVEMENT")
        sql_statements.append("-- ============================================================")
        sql_statements.append("")
        
        for row in data:
            response_id = self.escape_sql_string(row['response_id'])
            q12_response = self.escape_sql_string(row.get('q12_q12_response', ''))
            q12_notes = self.escape_sql_string(row.get('q12_q12_notes', ''))
            
            sql = f"""INSERT INTO q12_involvement (response_id, q12_response, q12_notes) 
VALUES ({response_id}, {q12_response}, {q12_notes});"""
            sql_statements.append(sql)
        
        sql_statements.append("")
        sql_statements.append("COMMIT;")
        sql_statements.append("")
        sql_statements.append("-- Data import completed!")
        sql_statements.append(f"-- Imported {len(data)} survey responses")
        sql_statements.append("-- You can now query your data using the Supabase dashboard or API")
        
        return sql_statements
    
    def save_sql_file(self, sql_statements, filename):
        """Save SQL statements to a file"""
        with open(filename, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sql_statements))

def main():
    json_file = "/Users/Shared/Working/Surveys Regrouped/hoa_survey_data.json"
    generator = SupabaseDataGenerator(json_file)
    
    print("Loading survey data...")
    data = generator.load_data()
    print(f"Loaded {len(data)} survey responses")
    
    print("Generating SQL INSERT statements...")
    sql_statements = generator.generate_insert_statements(data)
    
    # Save to file
    output_file = generator.base_dir / "supabase_data_import.sql"
    generator.save_sql_file(sql_statements, output_file)
    
    print(f"✅ Generated SQL import file: {output_file}")
    print(f"📊 Contains {len(data)} responses across 11 tables")
    print("\n🚀 Next steps:")
    print("1. Create a new Supabase project at https://supabase.com")
    print("2. Run supabase_schema.sql in the SQL Editor to create tables")
    print("3. Run supabase_data_import.sql to populate the data")
    print("4. Use the Supabase dashboard to explore your data!")

if __name__ == "__main__":
    main()