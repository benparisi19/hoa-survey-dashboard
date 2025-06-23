#!/usr/bin/env python3
"""
Normalize survey data into separate tables by question, mimicking the original MD structure
"""

import json
import csv
import sqlite3
from pathlib import Path
from collections import defaultdict

class SurveyNormalizer:
    def __init__(self, data_file):
        self.data_file = Path(data_file)
        self.base_dir = self.data_file.parent
        
    def load_data(self):
        """Load the JSON data"""
        with open(self.data_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def normalize_to_tables(self, data):
        """Split the flat data into normalized tables by question"""
        tables = {}
        
        # Response Summary Table
        tables['responses'] = []
        for row in data:
            tables['responses'].append({
                'response_id': row['response_id'],
                'address': row.get('summary_address', ''),
                'name': row.get('summary_name', ''),
                'email_contact': row.get('summary_email_contact', ''),
                'anonymous': row.get('summary_anonymous', '')
            })
        
        # Q1 & Q2: Preference & Service Rating
        tables['q1_q2_preference_rating'] = []
        for row in data:
            tables['q1_q2_preference_rating'].append({
                'response_id': row['response_id'],
                'q1_preference': row.get('q1_q2_q1_preference', ''),
                'q2_service_rating': row.get('q1_q2_q2_service_rating', ''),
                'notes': row.get('q1_q2_notes', '')
            })
        
        # Q3: Already Opt-Out Reasons
        tables['q3_opt_out_reasons'] = []
        for row in data:
            tables['q3_opt_out_reasons'].append({
                'response_id': row['response_id'],
                'q3_na': row.get('q3_q3_na', ''),
                'maintain_self': row.get('q3_maintain_self', ''),
                'quality': row.get('q3_quality', ''),
                'pet_safety': row.get('q3_pet_safety', ''),
                'privacy': row.get('q3_privacy', ''),
                'other_text': row.get('q3_other_text', '')
            })
        
        # Q4: Landscaping Issues
        tables['q4_landscaping_issues'] = []
        for row in data:
            tables['q4_landscaping_issues'].append({
                'response_id': row['response_id'],
                'irrigation': row.get('q4_irrigation', ''),
                'poor_mowing': row.get('q4_poor_mowing', ''),
                'property_damage': row.get('q4_property_damage', ''),
                'missed_service': row.get('q4_missed_service', ''),
                'inadequate_weeds': row.get('q4_inadequate_weeds', ''),
                'irrigation_detail': row.get('q4_irrigation_detail', ''),
                'other_issues': row.get('q4_other_issues', '')
            })
        
        # Q5 & Q6: Construction Issues & Group Action
        tables['q5_q6_construction_group'] = []
        for row in data:
            tables['q5_q6_construction_group'].append({
                'response_id': row['response_id'],
                'q5_construction_issues': row.get('q5_q6_q5_construction_issues', ''),
                'q5_explanation': row.get('q5_q6_q5_explanation', ''),
                'q6_group_action': row.get('q5_q6_q6_group_action', '')
            })
        
        # Q7: Interest Areas
        tables['q7_interest_areas'] = []
        for row in data:
            tables['q7_interest_areas'].append({
                'response_id': row['response_id'],
                'q7_na': row.get('q7_q7_na', ''),
                'plant_selection': row.get('q7_plant_selection', ''),
                'watering_irrigation': row.get('q7_watering_irrigation', ''),
                'fertilizing_pest': row.get('q7_fertilizing_pest', ''),
                'lawn_maintenance': row.get('q7_lawn_maintenance', ''),
                'seasonal_planning': row.get('q7_seasonal_planning', ''),
                'other_interests': row.get('q7_other_interests', '')
            })
        
        # Q8: Equipment Ownership
        tables['q8_equipment_ownership'] = []
        for row in data:
            tables['q8_equipment_ownership'].append({
                'response_id': row['response_id'],
                'q8_na': row.get('q8_q8_na', ''),
                'lawn_mower': row.get('q8_lawn_mower', ''),
                'trimmer': row.get('q8_trimmer', ''),
                'blower': row.get('q8_blower', ''),
                'basic_tools': row.get('q8_basic_tools', ''),
                'truck_trailer': row.get('q8_truck_trailer', ''),
                'notes': row.get('q8_notes', '')
            })
        
        # Q9: Dues Preference
        tables['q9_dues_preference'] = []
        for row in data:
            tables['q9_dues_preference'].append({
                'response_id': row['response_id'],
                'q9_response': row.get('q9_q9_response', ''),
                'notes': row.get('q9_notes', '')
            })
        
        # Q10: Biggest Concern
        tables['q10_biggest_concern'] = []
        for row in data:
            tables['q10_biggest_concern'].append({
                'response_id': row['response_id'],
                'q10_text': row.get('q10_q10_text', '')
            })
        
        # Q11: Cost Reduction Ideas
        tables['q11_cost_reduction'] = []
        for row in data:
            tables['q11_cost_reduction'].append({
                'response_id': row['response_id'],
                'q11_text': row.get('q11_q11_text', '')
            })
        
        # Q12: Want Involvement
        tables['q12_involvement'] = []
        for row in data:
            tables['q12_involvement'].append({
                'response_id': row['response_id'],
                'q12_response': row.get('q12_q12_response', ''),
                'q12_notes': row.get('q12_q12_notes', '')
            })
        
        return tables
    
    def export_tables_to_csv(self, tables):
        """Export each table to a separate CSV file"""
        csv_files = []
        
        for table_name, table_data in tables.items():
            if not table_data:
                continue
                
            csv_filename = self.base_dir / f"table_{table_name}.csv"
            
            # Get all unique keys for the CSV header
            all_keys = set()
            for row in table_data:
                all_keys.update(row.keys())
            
            # Sort keys to have response_id first
            sorted_keys = ['response_id'] + sorted([k for k in all_keys if k != 'response_id'])
            
            with open(csv_filename, 'w', newline='', encoding='utf-8') as f:
                writer = csv.DictWriter(f, fieldnames=sorted_keys)
                writer.writeheader()
                writer.writerows(table_data)
            
            csv_files.append(csv_filename)
            print(f"Created: {csv_filename}")
        
        return csv_files
    
    def create_sqlite_database(self, tables):
        """Create a SQLite database with normalized tables"""
        db_filename = self.base_dir / "hoa_survey.db"
        
        # Remove existing database
        if db_filename.exists():
            db_filename.unlink()
        
        conn = sqlite3.connect(db_filename)
        cursor = conn.cursor()
        
        # Create tables with proper schema
        table_schemas = {
            'responses': '''
                CREATE TABLE responses (
                    response_id TEXT PRIMARY KEY,
                    address TEXT,
                    name TEXT,
                    email_contact TEXT,
                    anonymous TEXT
                )
            ''',
            'q1_q2_preference_rating': '''
                CREATE TABLE q1_q2_preference_rating (
                    response_id TEXT PRIMARY KEY,
                    q1_preference TEXT,
                    q2_service_rating TEXT,
                    notes TEXT,
                    FOREIGN KEY (response_id) REFERENCES responses (response_id)
                )
            ''',
            'q3_opt_out_reasons': '''
                CREATE TABLE q3_opt_out_reasons (
                    response_id TEXT PRIMARY KEY,
                    q3_na TEXT,
                    maintain_self TEXT,
                    quality TEXT,
                    pet_safety TEXT,
                    privacy TEXT,
                    other_text TEXT,
                    FOREIGN KEY (response_id) REFERENCES responses (response_id)
                )
            ''',
            'q4_landscaping_issues': '''
                CREATE TABLE q4_landscaping_issues (
                    response_id TEXT PRIMARY KEY,
                    irrigation TEXT,
                    poor_mowing TEXT,
                    property_damage TEXT,
                    missed_service TEXT,
                    inadequate_weeds TEXT,
                    irrigation_detail TEXT,
                    other_issues TEXT,
                    FOREIGN KEY (response_id) REFERENCES responses (response_id)
                )
            ''',
            'q5_q6_construction_group': '''
                CREATE TABLE q5_q6_construction_group (
                    response_id TEXT PRIMARY KEY,
                    q5_construction_issues TEXT,
                    q5_explanation TEXT,
                    q6_group_action TEXT,
                    FOREIGN KEY (response_id) REFERENCES responses (response_id)
                )
            ''',
            'q7_interest_areas': '''
                CREATE TABLE q7_interest_areas (
                    response_id TEXT PRIMARY KEY,
                    q7_na TEXT,
                    plant_selection TEXT,
                    watering_irrigation TEXT,
                    fertilizing_pest TEXT,
                    lawn_maintenance TEXT,
                    seasonal_planning TEXT,
                    other_interests TEXT,
                    FOREIGN KEY (response_id) REFERENCES responses (response_id)
                )
            ''',
            'q8_equipment_ownership': '''
                CREATE TABLE q8_equipment_ownership (
                    response_id TEXT PRIMARY KEY,
                    q8_na TEXT,
                    lawn_mower TEXT,
                    trimmer TEXT,
                    blower TEXT,
                    basic_tools TEXT,
                    truck_trailer TEXT,
                    notes TEXT,
                    FOREIGN KEY (response_id) REFERENCES responses (response_id)
                )
            ''',
            'q9_dues_preference': '''
                CREATE TABLE q9_dues_preference (
                    response_id TEXT PRIMARY KEY,
                    q9_response TEXT,
                    notes TEXT,
                    FOREIGN KEY (response_id) REFERENCES responses (response_id)
                )
            ''',
            'q10_biggest_concern': '''
                CREATE TABLE q10_biggest_concern (
                    response_id TEXT PRIMARY KEY,
                    q10_text TEXT,
                    FOREIGN KEY (response_id) REFERENCES responses (response_id)
                )
            ''',
            'q11_cost_reduction': '''
                CREATE TABLE q11_cost_reduction (
                    response_id TEXT PRIMARY KEY,
                    q11_text TEXT,
                    FOREIGN KEY (response_id) REFERENCES responses (response_id)
                )
            ''',
            'q12_involvement': '''
                CREATE TABLE q12_involvement (
                    response_id TEXT PRIMARY KEY,
                    q12_response TEXT,
                    q12_notes TEXT,
                    FOREIGN KEY (response_id) REFERENCES responses (response_id)
                )
            '''
        }
        
        # Create tables
        for table_name, schema in table_schemas.items():
            cursor.execute(schema)
        
        # Insert data
        for table_name, table_data in tables.items():
            if not table_data or table_name not in table_schemas:
                continue
                
            # Get column names from first row
            columns = list(table_data[0].keys())
            placeholders = ', '.join(['?' for _ in columns])
            
            insert_sql = f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({placeholders})"
            
            for row in table_data:
                values = [row.get(col, '') for col in columns]
                cursor.execute(insert_sql, values)
        
        conn.commit()
        conn.close()
        
        print(f"Created SQLite database: {db_filename}")
        return db_filename
    
    def create_airtable_import_files(self, tables):
        """Create CSV files optimized for Airtable import with instructions"""
        airtable_dir = self.base_dir / "airtable_import"
        airtable_dir.mkdir(exist_ok=True)
        
        # Create individual CSV files for each table
        for table_name, table_data in tables.items():
            if not table_data:
                continue
                
            csv_filename = airtable_dir / f"{table_name}.csv"
            
            # Clean up field names for Airtable (no special characters)
            clean_data = []
            for row in table_data:
                clean_row = {}
                for key, value in row.items():
                    clean_key = key.replace('_', ' ').title()
                    clean_row[clean_key] = value
                clean_data.append(clean_row)
            
            if clean_data:
                fieldnames = list(clean_data[0].keys())
                with open(csv_filename, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()
                    writer.writerows(clean_data)
                
                print(f"Created Airtable CSV: {csv_filename}")
        
        # Create instructions file
        instructions_file = airtable_dir / "AIRTABLE_IMPORT_INSTRUCTIONS.md"
        instructions = """# Airtable Import Instructions

## Steps to Import:

1. **Create a new Airtable base** called "HOA Survey Data"

2. **Import tables in this order:**
   - Import `responses.csv` first (this will be your main table)
   - Import each question table (q1_q2_preference_rating.csv, q3_opt_out_reasons.csv, etc.)

3. **Set up relationships:**
   - In each question table, convert the "Response Id" field to a "Link to another record" field
   - Link it to the "responses" table
   - This creates the relational structure

4. **Field Types to Consider:**
   - Text fields: Most fields can stay as "Single line text"
   - Long text: Q10, Q11 (concerns and ideas) should be "Long text"
   - Select fields: Consider making Yes/No fields into "Single select" with Yes/No options

## Table Descriptions:

- **responses**: Basic respondent information (address, name, contact)
- **q1_q2_preference_rating**: Landscaping preference and service rating
- **q3_opt_out_reasons**: Reasons for wanting to opt out
- **q4_landscaping_issues**: Specific landscaping problems reported
- **q5_q6_construction_group**: Construction issues and group action interest
- **q7_interest_areas**: Learning interests for landscaping topics
- **q8_equipment_ownership**: What equipment respondents own
- **q9_dues_preference**: Preferences about dues changes
- **q10_biggest_concern**: Open-ended biggest concerns
- **q11_cost_reduction**: Ideas for cost reduction
- **q12_involvement**: Willingness to be involved in solutions

## Benefits of This Structure:
- Easy to filter responses by any criteria
- Can create views for different analysis needs
- Can link related responses across tables
- Easy to generate reports and charts
"""
        
        with open(instructions_file, 'w', encoding='utf-8') as f:
            f.write(instructions)
        
        print(f"Created instructions: {instructions_file}")
        return airtable_dir

def main():
    data_file = "/Users/Shared/Working/Surveys Regrouped/hoa_survey_data.json"
    normalizer = SurveyNormalizer(data_file)
    
    print("Loading survey data...")
    data = normalizer.load_data()
    print(f"Loaded {len(data)} responses")
    
    print("\nNormalizing data into separate tables...")
    tables = normalizer.normalize_to_tables(data)
    
    print(f"Created {len(tables)} tables:")
    for table_name, table_data in tables.items():
        print(f"  {table_name}: {len(table_data)} rows")
    
    print("\n" + "="*60)
    print("CREATING OUTPUT FILES")
    print("="*60)
    
    # Create CSV files for each table
    print("\n1. Creating individual CSV files...")
    csv_files = normalizer.export_tables_to_csv(tables)
    
    # Create SQLite database
    print("\n2. Creating SQLite database...")
    db_file = normalizer.create_sqlite_database(tables)
    
    # Create Airtable import files
    print("\n3. Creating Airtable import files...")
    airtable_dir = normalizer.create_airtable_import_files(tables)
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"✅ Created {len(csv_files)} CSV files (one per question)")
    print(f"✅ Created SQLite database: {db_file}")
    print(f"✅ Created Airtable import folder: {airtable_dir}")
    
    print("\n📊 RECOMMENDED NEXT STEPS:")
    print("• For simple analysis: Use the individual CSV files")
    print("• For database queries: Use the SQLite database")
    print("• For collaborative analysis: Import to Airtable using the airtable_import folder")
    print("• For Google Sheets: You can import individual CSV files, but relationships will be manual")

if __name__ == "__main__":
    main()