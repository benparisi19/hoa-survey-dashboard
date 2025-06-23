#!/usr/bin/env python3
"""
HOA Survey Data Parser - Converts markdown survey files to structured data formats
"""

import re
import json
import csv
import os
from collections import defaultdict, OrderedDict
from pathlib import Path

class SurveyParser:
    def __init__(self, base_dir):
        self.base_dir = Path(base_dir)
        self.responses = OrderedDict()
        
    def read_file(self, filename):
        """Read a file and return its content"""
        with open(filename, 'r', encoding='utf-8') as f:
            return f.read()
    
    def parse_table_data(self, lines, start_idx, table_type):
        """Parse table data starting from a given index"""
        data = []
        i = start_idx
        
        # Skip header and separator lines
        while i < len(lines) and not lines[i].startswith('|'):
            i += 1
        
        # Skip table header
        if i < len(lines) and lines[i].startswith('|'):
            i += 1  # Skip header row
            if i < len(lines) and lines[i].startswith('|---'):
                i += 1  # Skip separator row
        
        # Parse data rows
        while i < len(lines):
            line = lines[i].strip()
            if not line:
                i += 1
                continue
            if line.startswith('|') and not line.startswith('|---'):
                # This is a data row
                if re.match(r'\| \d+ \|', line):  # Contains response ID
                    data.append(self.parse_table_row(line, table_type))
            elif line.startswith('#'):
                # We've hit a new section
                break
            i += 1
        
        return data
    
    def parse_table_row(self, line, table_type):
        """Parse a single table row based on table type"""
        # Split by | and clean up
        parts = [part.strip() for part in line.split('|')[1:-1]]  # Remove empty first/last
        
        if not parts:
            return None
        
        response_id = parts[0]
        
        # Parse based on table type
        if table_type == 'summary':
            return {
                'response_id': response_id,
                'address': parts[1] if len(parts) > 1 else '',
                'name': parts[2] if len(parts) > 2 else '',
                'email_contact': parts[3] if len(parts) > 3 else '',
                'anonymous': parts[4] if len(parts) > 4 else ''
            }
        elif table_type == 'q1_q2':
            return {
                'response_id': response_id,
                'q1_preference': parts[1] if len(parts) > 1 else '',
                'q2_service_rating': parts[2] if len(parts) > 2 else '',
                'notes': parts[3] if len(parts) > 3 else ''
            }
        elif table_type == 'q3':
            return {
                'response_id': response_id,
                'q3_na': parts[1] if len(parts) > 1 else '',
                'maintain_self': parts[2] if len(parts) > 2 else '',
                'quality': parts[3] if len(parts) > 3 else '',
                'pet_safety': parts[4] if len(parts) > 4 else '',
                'privacy': parts[5] if len(parts) > 5 else '',
                'other_text': parts[6] if len(parts) > 6 else ''
            }
        elif table_type == 'q4':
            return {
                'response_id': response_id,
                'irrigation': parts[1] if len(parts) > 1 else '',
                'poor_mowing': parts[2] if len(parts) > 2 else '',
                'property_damage': parts[3] if len(parts) > 3 else '',
                'missed_service': parts[4] if len(parts) > 4 else '',
                'inadequate_weeds': parts[5] if len(parts) > 5 else '',
                'irrigation_detail': parts[6] if len(parts) > 6 else '',
                'other_issues': parts[7] if len(parts) > 7 else ''
            }
        elif table_type == 'q5_q6':
            return {
                'response_id': response_id,
                'q5_construction_issues': parts[1] if len(parts) > 1 else '',
                'q5_explanation': parts[2] if len(parts) > 2 else '',
                'q6_group_action': parts[3] if len(parts) > 3 else ''
            }
        elif table_type == 'q7':
            return {
                'response_id': response_id,
                'q7_na': parts[1] if len(parts) > 1 else '',
                'plant_selection': parts[2] if len(parts) > 2 else '',
                'watering_irrigation': parts[3] if len(parts) > 3 else '',
                'fertilizing_pest': parts[4] if len(parts) > 4 else '',
                'lawn_maintenance': parts[5] if len(parts) > 5 else '',
                'seasonal_planning': parts[6] if len(parts) > 6 else '',
                'other_interests': parts[7] if len(parts) > 7 else ''
            }
        elif table_type == 'q8':
            return {
                'response_id': response_id,
                'q8_na': parts[1] if len(parts) > 1 else '',
                'lawn_mower': parts[2] if len(parts) > 2 else '',
                'trimmer': parts[3] if len(parts) > 3 else '',
                'blower': parts[4] if len(parts) > 4 else '',
                'basic_tools': parts[5] if len(parts) > 5 else '',
                'truck_trailer': parts[6] if len(parts) > 6 else '',
                'notes': parts[7] if len(parts) > 7 else ''
            }
        elif table_type == 'q9':
            return {
                'response_id': response_id,
                'q9_response': parts[1] if len(parts) > 1 else '',
                'notes': parts[2] if len(parts) > 2 else ''
            }
        elif table_type == 'q10':
            return {
                'response_id': response_id,
                'q10_text': parts[1] if len(parts) > 1 else ''
            }
        elif table_type == 'q11':
            return {
                'response_id': response_id,
                'q11_text': parts[1] if len(parts) > 1 else ''
            }
        elif table_type == 'q12':
            return {
                'response_id': response_id,
                'q12_response': parts[1] if len(parts) > 1 else '',
                'q12_notes': parts[2] if len(parts) > 2 else ''
            }
        
        return None
    
    def parse_markdown_file(self, filename):
        """Parse a single markdown file and extract survey data"""
        content = self.read_file(filename)
        lines = content.split('\n')
        
        tables = {
            'summary': [],
            'q1_q2': [],
            'q3': [],
            'q4': [],
            'q5_q6': [],
            'q7': [],
            'q8': [],
            'q9': [],
            'q10': [],
            'q11': [],
            'q12': []
        }
        
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            
            # Identify table sections
            if line == '## Response Summary Table':
                data = self.parse_table_data(lines, i, 'summary')
                tables['summary'].extend(data)
            elif line == '### Q1: Preference & Q2: Service Rating':
                data = self.parse_table_data(lines, i, 'q1_q2')
                tables['q1_q2'].extend(data)
            elif line == '### Q3: Already Opt-Out Reasons':
                data = self.parse_table_data(lines, i, 'q3')
                tables['q3'].extend(data)
            elif line == '### Q4: Landscaping Issues':
                data = self.parse_table_data(lines, i, 'q4')
                tables['q4'].extend(data)
            elif line.startswith('### Q5 & Q6: Construction Issues'):
                data = self.parse_table_data(lines, i, 'q5_q6')
                tables['q5_q6'].extend(data)
            elif line == '### Q7: Interest Areas':
                data = self.parse_table_data(lines, i, 'q7')
                tables['q7'].extend(data)
            elif line == '### Q8: Equipment Ownership':
                data = self.parse_table_data(lines, i, 'q8')
                tables['q8'].extend(data)
            elif line == '### Q9: Dues Preference':
                data = self.parse_table_data(lines, i, 'q9')
                tables['q9'].extend(data)
            elif line == '### Q10: Biggest Concern':
                data = self.parse_table_data(lines, i, 'q10')
                tables['q10'].extend(data)
            elif line == '### Q11: Cost Reduction Ideas':
                data = self.parse_table_data(lines, i, 'q11')
                tables['q11'].extend(data)
            elif line == '### Q12: Want Involvement':
                data = self.parse_table_data(lines, i, 'q12')
                tables['q12'].extend(data)
            
            i += 1
        
        return tables
    
    def merge_response_data(self, all_tables):
        """Merge all table data by response ID"""
        # First, get all unique response IDs
        response_ids = set()
        for table_type, tables in all_tables.items():
            for table_data in tables:
                for row in table_data:
                    if row and 'response_id' in row:
                        response_ids.add(row['response_id'])
        
        # Sort response IDs numerically
        sorted_ids = sorted(response_ids, key=lambda x: int(x) if x.isdigit() else 999)
        
        # Merge data for each response
        merged_data = []
        for response_id in sorted_ids:
            response_data = {'response_id': response_id}
            
            # Merge data from all tables for this response
            for table_type, tables in all_tables.items():
                for table_data in tables:
                    for row in table_data:
                        if row and row.get('response_id') == response_id:
                            # Merge this row's data, prefixing keys with table type
                            for key, value in row.items():
                                if key != 'response_id':
                                    new_key = f"{table_type}_{key}"
                                    response_data[new_key] = value
                            break
            
            merged_data.append(response_data)
        
        return merged_data
    
    def parse_all_files(self):
        """Parse all survey files and combine the data"""
        all_tables = defaultdict(list)
        
        # Parse the combined file (sets 1-8)
        combined_file = self.base_dir / "hoa_survey_combined.md"
        if combined_file.exists():
            print(f"Parsing combined file: {combined_file}")
            tables = self.parse_markdown_file(combined_file)
            for table_type, data in tables.items():
                all_tables[table_type].append(data)
        
        # Parse individual set files (sets 9-23)
        for set_num in range(9, 24):
            set_file = self.base_dir / f"hoa_survey_data_set{set_num}.md"
            if set_file.exists():
                print(f"Parsing set {set_num}: {set_file}")
                tables = self.parse_markdown_file(set_file)
                for table_type, data in tables.items():
                    all_tables[table_type].append(data)
        
        # Merge all response data
        return self.merge_response_data(all_tables)
    
    def export_to_json(self, data, filename):
        """Export data to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Exported to JSON: {filename}")
    
    def export_to_csv(self, data, filename):
        """Export data to CSV file"""
        if not data:
            print("No data to export")
            return
        
        # Get all unique keys for the CSV header
        all_keys = set()
        for row in data:
            all_keys.update(row.keys())
        
        # Sort keys to have response_id first, then alphabetically
        sorted_keys = ['response_id'] + sorted([k for k in all_keys if k != 'response_id'])
        
        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=sorted_keys)
            writer.writeheader()
            writer.writerows(data)
        
        print(f"Exported to CSV: {filename}")

def main():
    base_dir = "/Users/Shared/Working/Surveys Regrouped"
    parser = SurveyParser(base_dir)
    
    print("Starting survey data parsing...")
    data = parser.parse_all_files()
    
    print(f"\nParsed {len(data)} responses")
    
    # Export to different formats
    output_dir = Path(base_dir)
    
    # Export to JSON
    json_file = output_dir / "hoa_survey_data.json"
    parser.export_to_json(data, json_file)
    
    # Export to CSV
    csv_file = output_dir / "hoa_survey_data.csv"
    parser.export_to_csv(data, csv_file)
    
    # Print summary statistics
    print("\nSummary:")
    print(f"Total responses: {len(data)}")
    if data:
        print(f"Response ID range: {data[0]['response_id']} to {data[-1]['response_id']}")
        print(f"Fields per response: {len(data[0].keys())}")
    
    print("\nFiles created:")
    print(f"- {json_file}")
    print(f"- {csv_file}")

if __name__ == "__main__":
    main()