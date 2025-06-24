# Original Survey Content

This document contains the complete original survey that residents filled out, for reference during development and data validation.

## Survey Header

**Movado Greens COMMUNITY FEEDBACK SURVEY**

Dear Neighbors (homeowners and renters),

As your soon-to-be HOA board member, I am independently seeking your feedback to better represent your needs and explore cost-saving solutions for our community.

This year we are currently projected to spend nearly **$290,000 on landscaping**; 2024-2025 has seen a significant increase in our expenses compared to 2022-2023, however the current expense (~$290,000) works out to approximately **$24 per week per house**.

I am requesting that you consider whether this cost is reasonable for the service you are receiving and share your feedback on what path forward seems most desirable.

**$24 per week is $312 per quarter**, meaning if we stay the course, we must increase dues.

Your responses to this survey will help shape our approach to the financial challenges we're facing; it's best if you answer them in order. Thank you for your time and consideration.

**Best,  
Ben Parisi**

---

## Section 1: Current Landscaping Experience

### Question 1
**If you had to choose today, which option would you prefer?**
- ☐ Keep current HOA landscaping service (knowing dues would increase)
- ☐ Opt out and hire my own landscaper (and receive dues reduction)
- ☐ Opt out and maintain it myself (and receive dues reduction)

### Question 2
**How would you rate the current landscaping services?**
- ☐ Excellent
- ☐ Good
- ☐ Fair
- ☐ Poor
- ☐ Very Poor

### Question 3
**If you already "opt-out" with no fee reduction by locking your gate, why? (Check all that apply)**
- ☐ Prefer to maintain it myself
- ☐ Quality concerns
- ☐ Pet safety
- ☐ Privacy
- ☐ Other: _______________

### Question 4
**What specific landscaping issues have you experienced, if any? (Check all that apply)**
- ☐ Irrigation/sprinkler problems (circle: Too much water. | Not enough water.)
- ☐ Poor mowing quality
- ☐ Damage to personal property
- ☐ Missed service dates
- ☐ Inadequate weed control
- ☐ Other (describe in the available space): _______________

### Question 5
**Do you have documented irrigation/landscaping issues caused by construction?**
- ☐ Yes - I have photos/documentation
- ☐ Yes - but no documentation
- ☐ No construction-related issues
- ☐ Not sure (please explain): _______________

### Question 6
**Would you participate in a group action to address builder defects?**
- ☐ Yes
- ☐ Maybe
- ☐ No
- ☐ Need more information

---

## Section 2: Resources & Interest

**One potential solution to our landscaping costs is a resident-owned cooperative that could provide part-time employment for neighbors while significantly reducing expenses. This section will help us gauge community interest and resources.**

### Question 7
**Would you be interested in any of the following? (Check all that apply)**
- ☐ Part-time paid landscaping work/management for the HOA
- ☐ Volunteering for community beautification projects
- ☐ Joining a landscaping equipment co-op (shared tools)
- ☐ Sharing and learning skills through community mentorship
- ☐ Managing a specific area near your home

### Question 8
**Do you own any of the following? (Check all that apply)**
- ☐ Lawn mower
- ☐ Weed trimmer/edger
- ☐ Leaf blower
- ☐ Basic landscaping tools
- ☐ Truck/trailer for hauling

### Question 9
**If opting out of HOA landscaping reduced your dues proportionally, would you:**
- ☐ Still use HOA landscaping even if dues increase to cover the full cost
- ☐ Use HOA landscaping only if it's significantly cheaper than private options
- ☐ Opt out and hire my own landscaper with the savings
- ☐ Opt out and do it myself with the savings
- ☐ Depends on how much the dues reduction would be

---

## Section 3: Additional Feedback

### Question 10
**What's your biggest concern about HOA finances?**
_[Free text response field]_

### Question 11
**Other ideas for reducing landscaping costs?**
_[Free text response field]_

### Question 12
**Would you like to be involved in finding solutions?**
- ☐ Yes - contact me at: _______________
- ☐ No - just keep me informed

---

## Contact Information Section

**Name (optional):** _______________

**Address (optional):** _______________

**Best contact method:** _______________

*Just leave this section blank if you wish to have your feedback anonymized.*

---

**Thank you for your input!  
- Ben**

## Survey Distribution Notes

- **Distribution Method**: Door-to-door collection
- **Collection Instructions**: "Please leave on your doorstep on Wednesday evening (6/18); I'll be walking around to collect them around 7pm."
- **Total Responses**: 113 completed surveys
- **Community**: Movado Greens HOA
- **Survey Period**: June 2024

## Data Mapping Notes for Developers

### Question Mapping to Database Tables

- **Questions 1-2**: `q1_q2_preference_rating` table
- **Question 3**: `q3_opt_out_reasons` table
- **Question 4**: `q4_landscaping_issues` table  
- **Questions 5-6**: `q5_q6_construction_group` table
- **Question 7**: `q7_interest_areas` table (NOTE: Original Q7 was about interest areas, not part-time work)
- **Question 8**: `q8_equipment_ownership` table
- **Question 9**: `q9_dues_preference` table
- **Question 10**: `q10_biggest_concern` table
- **Question 11**: `q11_cost_reduction` table
- **Question 12**: `q12_involvement` table
- **Contact Info**: `responses` table (name, address, email_contact, anonymous)

### Data Quality Considerations

- **Handwritten responses**: Transcribed manually, may contain errors requiring review
- **Multiple selections**: Some residents checked multiple options where only one was expected
- **Edge cases**: "Not marked", partial responses, unclear handwriting noted in data
- **Contact information**: Free-form text requiring parsing (emails, phones, preferences mixed)
- **Anonymous responses**: ~47% chose to remain anonymous

This survey content serves as the source of truth for validating transcribed data during the review process.