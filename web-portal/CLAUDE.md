# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production (always run before commits)
npm run type-check   # TypeScript validation without building
npm run lint         # ESLint validation
npm run bulk-update-pdfs  # Bulk link PDFs in storage to database records
```

### Environment Setup
```bash
cp .env.example .env # Copy environment template
# Edit .env with Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
```

### Database Management
```bash
# Test Supabase connection (from parent directory)
cd ../scripts && python test_connection.py

# Run schema setup (if needed)
# Execute ../database/supabase_schema.sql in Supabase dashboard

# Utility scripts for data management
node scripts/check-response-ids.js       # Check response ID formats
node scripts/check-specific-response.js  # Debug specific response data
node scripts/verify_notes_import.js      # Verify notes extraction results
```

### Database Interaction Pattern
When structural changes or data updates are needed:

1. **For schema changes**: Provide SQL commands for user to execute in Supabase dashboard
   ```sql
   -- Example: Adding new columns
   ALTER TABLE responses ADD COLUMN new_field TEXT;
   ```

2. **For data manipulation**: Use environment variables to connect and update data programmatically
   - Read `.env` file to get Supabase credentials
   - Connect using service key for write operations
   - Execute data updates/corrections as needed
   - Always explain what changes will be made before executing

## Architecture Overview

### Core Technology Stack
- **Next.js 14** with App Router and TypeScript
- **Supabase** for PostgreSQL database with normalized survey schema
- **Tailwind CSS** for styling with custom design system
- **Recharts** for data visualizations
- **Lucide React** for icons

### Database Architecture
The survey data is stored in **11 normalized tables** representing different question sections:
- `responses` - Main response metadata with review workflow columns
- `q1_q2_preference_rating` - Landscaping preferences and service ratings
- `q3_opt_out_reasons` - Reasons for opting out of HOA service
- `q4_landscaping_issues` - Specific problems experienced
- `q5_q6_construction_group` - Construction issues and group action interest
- `q7_interest_areas` - Learning interests for landscaping topics
- `q8_equipment_ownership` - Landscaping equipment ownership
- `q9_dues_preference` - Dues reduction preferences
- `q10_biggest_concern` - Open-ended concerns about HOA finances
- `q11_cost_reduction` - Ideas for reducing costs
- `q12_involvement` - Interest in helping find solutions

Key views: `complete_responses` joins all tables for comprehensive data access.

### Review Workflow System
Implements a quality control system for survey transcription validation:
- **Unreviewed** responses automatically enter edit mode for data entry/correction
- **Reviewed** responses are locked but can be re-edited if needed
- **Flagged** responses require attention for data quality issues
- Review status tracked in `responses` table with `review_status`, `reviewed_by`, `reviewed_at`

### Component Architecture

#### Core Layout
- `app/layout.tsx` - Main application shell with navigation
- `app/page.tsx` - Dashboard with metrics and charts
- `app/responses/page.tsx` - Response browser with filtering
- `app/responses/[id]/page.tsx` - Individual response detail view

#### Data Presentation
- `SurveyFormView` - Displays responses in original paper survey format with editing capabilities and PDF viewer integration
- `ResponsesTable` - Filterable table with export functionality and review status management
- `MetricCard` - Reusable metric display with color coding by type (success/warning/error/info)
- Charts: `ServiceRatingChart`, `IssuesOverview`, `ContactOverview`

#### PDF Management System
- `PDFViewer` - Integrated PDF display with drag-and-drop upload functionality when editing
- `PDFUpload` - Standalone upload component (deprecated in favor of integrated PDFViewer upload)
- Supabase storage integration with public bucket "survey-pdfs"
- Database tracking via `pdf_file_path`, `pdf_storage_url`, `pdf_uploaded_at` columns
- Side-by-side layout: survey form and PDF viewer with full-width header

#### Review System
- `ReviewControls` - Simplified workflow with Mark Reviewed and Flag buttons
- Auto-editing for unreviewed responses, manual editing for reviewed responses
- Status tracking with database persistence

#### Notes Management System  
- `NotesSection` - Advanced marginal notes extraction and management
- Database tables: `survey_notes` with priority levels, follow-up tracking, admin notes
- Automated extraction from handwritten survey margins using structured analysis
- Priority classification: low/medium/high/critical with color-coded display

### Data Processing Utilities

#### Contact Information Parser (`lib/utils.ts`)
Sophisticated parsing system for mixed contact data:
```typescript
parseContactInfo(contact: string): ContactInfo
// Extracts emails, phones, preferences from freeform text
// Returns structured data with type classification
```

#### Service Rating Normalizer
Conservative approach for handling multiple/ambiguous ratings:
```typescript
normalizeServiceRating(rating: string): string
// Uses worst rating when multiple selections found
// Handles edge cases like "Not marked", contextual ratings
```

### Supabase Integration (`lib/supabase.ts`)
- Type-safe client with database schema types
- Error handling utilities
- Combined response types for complex joins
- No authentication (read-only dashboard for admins)

### Key Design Patterns

#### Server Components with Suspense
Pages use async server components for data fetching with loading states:
```typescript
async function PageContent() {
  const data = await fetchData();
  return <Component data={data} />;
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PageContent />
    </Suspense>
  );
}
```

#### Progressive Enhancement
- Base functionality works without JavaScript
- Client components only for interactive features (editing, filtering)
- Graceful degradation for chart components

#### Responsive Design System
- Mobile-first approach with Tailwind breakpoints
- Custom color system for survey data types
- Consistent spacing and typography scales

## Important Development Notes

### Data Integrity
- Always validate with `npm run build` before commits - TypeScript errors will fail deployment
- Survey data represents **113 real responses** - treat with care
- Review status changes persist immediately to database
- Contact parsing handles real-world messy data - test edge cases

### Supabase Specifics
- Database uses Row Level Security (RLS) but currently allows anonymous access for admin dashboard
- `complete_responses` view may not include latest schema changes - use manual joins when needed
- Environment variables must be configured in both local `.env` and Vercel deployment
- **Service key** required for direct database writes - read from `.env` file when needed
- **Anonymous key** used for frontend read operations only
- **Storage bucket** "survey-pdfs" configured for public access with 50MB file limit (free tier)
- PDF files named with 3-digit response IDs (001.pdf, 002.pdf, etc.)

### Review Workflow Rules
- Unreviewed responses = auto-edit mode enabled
- Reviewed responses = locked but can be unlocked with "Edit Response"  
- Flagged responses = need attention (data quality, follow-up required)
- Only one person should review responses to avoid conflicts
- PDF viewer auto-shows when editing responses, hides when viewing read-only
- Drag-and-drop PDF upload only available when in editing mode

### Performance Considerations
- Dashboard metrics calculated server-side for speed
- Large response table uses client-side filtering/sorting
- Charts optimized for 113 response dataset size
- Responsive design tested down to mobile screens

### Styling Standards
- Use Tailwind utility classes, avoid custom CSS
- Color system: green=good, red=poor, yellow=warning, blue=info
- Icons from Lucide React only
- Consistent spacing: `space-y-6` for sections, `space-y-4` for groups

## Reference Documentation

- **`DATABASE_SCHEMA.md`** - Complete current database schema with all 11 tables, constraints, and views
- **`SURVEY_CONTENT.md`** - Original survey questions and content for data validation reference  
- **`NEXT_STEPS.md`** - Planned enhancements including comprehensive notes/ticketing system for advanced quality control workflows