# Marginal Notes Extraction Plan

## Project Overview
Extract and systematically organize all marginal notes, annotations, and handwritten comments from the original survey transcriptions to prevent data loss and enable proper follow-up workflows.

## Data Sources Overview
- **Combined File**: `hoa_survey_combined.md` (Sets 1-8, Responses 001-040)
- **Individual Files**: `hoa_survey_data_set[9-23].md` (Responses 041-113)
- **Total Scope**: 113 survey responses across 16 files

## Note Types Found (Preliminary Analysis)

### 1. **Response Annotations** 
Examples found:
- `"I consider this to mean For my individual mowing, weeding, trimming, home & sprinkler maintenance, & blow out. common grounds"` (ID: 031)
- `"LACK OF ATTENTION TO DETAIL - TOO RUSHED"` (ID: 032) 
- `"(So it would go from $302.50 to $312/quarter?) I would be fine with a $10 increase..."` (ID: 037)

### 2. **Multiple Selection Clarifications**
Examples found:
- `Good/Fair (marked both)` with annotations
- `Poor/Very Poor (marked both)` with context

### 3. **Write-in Responses**
Examples found:
- `Find replacement or reduce service (write-in)` (ID: 026)
- Custom responses in "Other" fields

### 4. **Extensive Note References**
Examples found:
- `Survey has extensive handwritten notes` (ID: 040)
- `Complex annotation about costs` (ID: 042)

### 5. **Detailed Issue Descriptions**
Examples found:
- `"holes in front & back lawns - meaning no green - just dirt. Looks terrible."` (ID: 042)
- `"edging bad - lots of rocks thrown from flower beds into grass. Too late on pre emergent - too many dandilions and crab grass"` (ID: 043)

## File Structure Pattern

Each transcription file follows this structure:
1. **Response Summary Table** - Basic contact info
2. **Q1 & Q2: Preference & Service Rating** - Core responses with annotations
3. **Q3: Already Opt-Out Reasons** - Multiple choice with other text
4. **Q4: Landscaping Issues** - Detailed issues with descriptions
5. **Q5 & Q6: Construction Issues & Group Action** - Construction problems
6. **Q7: Interest Areas** - Learning/work interests
7. **Q8: Equipment Ownership** - Equipment lists with notes
8. **Q9: Dues Preference** - Complex written responses
9. **Q10: Biggest Concern** - Free text responses
10. **Q11: Cost Reduction Ideas** - Free text responses  
11. **Q12: Involvement** - Contact preferences with notes

## Extraction Strategy

### Phase 1: Structure Analysis and Pattern Recognition
- [x] Analyze combined file structure (hoa_survey_combined.md)
- [x] Analyze individual file structure (hoa_survey_data_set9.md)
- [ ] Document all note patterns and locations
- [ ] Create regex patterns for automated extraction

### Phase 2: Manual High-Value Note Identification
- [ ] Scan all files for explicit note references:
  - "Survey has extensive handwritten notes"
  - "Complex annotation about costs" 
  - "Extensive margin notes"
  - "(see margin comments)"
  - "Multiple issues documented (see notes)"
- [ ] Extract direct quotes in annotation fields
- [ ] Identify follow-up requirements

### Phase 3: Systematic Extraction Script Development
- [ ] Build automated extraction tool for:
  - Quoted annotations within table cells
  - Multi-selection clarifications
  - "Other_Text" fields with substantial content
  - Complex written responses that reference additional notes
- [ ] Section-specific extraction rules
- [ ] Note categorization and priority assignment

### Phase 4: Database Population
- [ ] Create survey_notes table in Supabase
- [ ] Import extracted notes with proper context
- [ ] Link notes to specific survey sections and questions
- [ ] Validate data integrity

### Phase 5: UI Integration
- [ ] Add notes display to survey view
- [ ] Enable note editing and addition
- [ ] Implement follow-up workflow

## Expected Note Categories

### By Section:
- **Q1/Q2**: Service quality clarifications, cost concerns, rating explanations
- **Q3**: Opt-out reasoning details
- **Q4**: Detailed problem descriptions, specific incidents
- **Q5/Q6**: Construction damage documentation, group action hesitations
- **Q7**: Interest qualifications and limitations
- **Q8**: Equipment sharing willingness, condition notes
- **Q9**: Complex dues preference explanations
- **Q10**: Detailed financial concerns beyond basic response
- **Q11**: Specific cost reduction suggestions with details
- **Q12**: Contact method preferences, availability notes

### By Type:
- **margin_note**: Handwritten additions around questions
- **clarification**: Explanations of unclear responses
- **follow_up**: Notes indicating need for resident contact
- **concern**: Issues requiring HOA attention
- **suggestion**: Specific improvement recommendations

### By Priority:
- **high**: Notes requiring immediate board action or follow-up
- **medium**: Important context for decision-making
- **low**: Helpful clarifications but not action-required

## Risk Assessment

### Data Loss Risks:
- **Critical**: Some notes may only exist in original paper surveys
- **High**: Transcription may have condensed or summarized complex notes
- **Medium**: Context loss when notes span multiple sections

### Extraction Challenges:
- **Inconsistent formatting** across transcription files
- **Embedded quotes vs. annotations** distinction needed
- **Multi-part notes** spanning different sections
- **Unclear handwriting references** without original context

## Success Criteria

### Quantitative:
- [ ] 100% of survey files analyzed
- [ ] All explicit note references extracted and categorized
- [ ] Database populated with structured note data
- [ ] Notes linked to correct response IDs and sections

### Qualitative:
- [ ] No valuable resident feedback lost
- [ ] Follow-up requirements clearly identified
- [ ] Board-relevant insights properly flagged
- [ ] Context preserved for future reference

## Implementation Tracking

### Files Analyzed: 1/16
- [x] hoa_survey_combined.md (001-040) - **67 notes extracted, 5 CRITICAL issues found**
- [ ] hoa_survey_data_set9.md (041-045)
- [ ] hoa_survey_data_set10.md (046-050)
- [ ] hoa_survey_data_set11.md (051-055)
- [ ] hoa_survey_data_set12.md (056-060)
- [ ] hoa_survey_data_set13.md (061-065)
- [ ] hoa_survey_data_set14.md (066-070)
- [ ] hoa_survey_data_set15.md (071-075)
- [ ] hoa_survey_data_set16.md (076-080)
- [ ] hoa_survey_data_set17.md (081-085)
- [ ] hoa_survey_data_set18.md (086-090)
- [ ] hoa_survey_data_set19.md (091-095)
- [ ] hoa_survey_data_set20.md (096-100)
- [ ] hoa_survey_data_set21.md (101-105)
- [ ] hoa_survey_data_set22.md (106-110)
- [ ] hoa_survey_data_set23.md (111-113)

### Notes Extracted: 67/estimated 150-200 (revised estimate based on findings)
### Database Records Created: 0
### Follow-up Items Identified: 0

## Next Steps

1. **Immediate**: Begin systematic analysis of hoa_survey_combined.md
2. **Day 1-2**: Complete manual scanning of all files for high-value notes
3. **Day 3-4**: Build and test extraction scripts
4. **Day 5-7**: Database creation and population
5. **Week 2**: UI integration and testing

---

**Last Updated**: Initial creation
**Status**: Planning phase - ready to begin systematic analysis