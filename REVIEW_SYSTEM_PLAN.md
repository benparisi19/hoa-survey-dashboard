# Review System Implementation Plan

## Database Schema Changes Required

### 1. Add Review Columns to `responses` table

```sql
-- Add review tracking columns
ALTER TABLE responses 
ADD COLUMN review_status TEXT DEFAULT 'unreviewed',
ADD COLUMN reviewed_by TEXT,
ADD COLUMN reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN review_notes TEXT;

-- Add index for review status filtering
CREATE INDEX idx_responses_review_status ON responses(review_status);

-- Add constraints
ALTER TABLE responses 
ADD CONSTRAINT chk_review_status 
CHECK (review_status IN ('unreviewed', 'in_progress', 'reviewed', 'flagged'));
```

### 2. Update Views

```sql
-- Update complete_responses view to include review fields
DROP VIEW complete_responses;
CREATE VIEW complete_responses AS
SELECT 
    r.*,
    -- Include review fields
    r.review_status,
    r.reviewed_by,
    r.reviewed_at,
    r.review_notes,
    -- ... rest of existing view
FROM responses r
-- ... rest of existing joins
```

## Review System Features

### Review Statuses
- **unreviewed** (default): Not yet reviewed for accuracy
- **in_progress**: Currently being reviewed
- **reviewed**: Completed and verified as accurate
- **flagged**: Needs attention or has issues

### Workflow Features
1. **Mark as Reviewed**: Button to mark response as reviewed
2. **Add Review Notes**: Text field for reviewer comments
3. **Flag for Issues**: Mark responses that need attention
4. **Reviewer Tracking**: Track who reviewed each response
5. **Review Progress**: Dashboard showing review completion status

### UI Components to Add

#### 1. Review Status Badge (in detail view)
```typescript
// Replace placeholder in ResponseDetailPage
<ReviewStatusBadge 
  status={response.review_status}
  reviewedBy={response.reviewed_by}
  reviewedAt={response.reviewed_at}
/>
```

#### 2. Review Controls (in ResponseEditor)
```typescript
<ReviewControls
  responseId={response.response_id}
  currentStatus={response.review_status}
  onStatusChange={handleReviewStatusChange}
  notes={response.review_notes}
  onNotesChange={handleReviewNotesChange}
/>
```

#### 3. Review Filter (in ResponsesTable)
```typescript
// Add to filter options
<select name="reviewStatus">
  <option value="">All Statuses</option>
  <option value="unreviewed">Unreviewed</option>
  <option value="in_progress">In Progress</option>
  <option value="reviewed">Reviewed</option>
  <option value="flagged">Flagged</option>
</select>
```

#### 4. Review Progress Dashboard
```typescript
<ReviewProgress 
  total={totalResponses}
  reviewed={reviewedCount}
  inProgress={inProgressCount}
  flagged={flaggedCount}
/>
```

## Implementation Steps

### Phase 1: Database Updates (Manual via Supabase Dashboard)
1. Add review columns to `responses` table
2. Set all existing responses to 'unreviewed'
3. Update complete_responses view

### Phase 2: UI Components
1. Create ReviewStatusBadge component
2. Create ReviewControls component
3. Add review filtering to ResponsesTable
4. Update ResponseEditor with review workflow

### Phase 3: API Integration
1. Create review status update endpoints
2. Add review notes saving functionality
3. Implement reviewer tracking
4. Add review history logging

### Phase 4: Dashboard Enhancements
1. Add review progress metrics to main dashboard
2. Create reviewer assignment system
3. Add bulk review operations
4. Export reviewed/flagged responses

## Quality Control Benefits

1. **Data Accuracy**: Systematic review ensures transcription accuracy
2. **Issue Tracking**: Flag responses with unclear or problematic data
3. **Progress Monitoring**: Track completion of review process
4. **Audit Trail**: Know who reviewed each response and when
5. **Quality Metrics**: Measure review completion rates

## Current State

- ✅ Response detail view with comprehensive editing interface
- ✅ Clickable response IDs in table
- ✅ Full survey data display and editing
- ✅ Contact information parsing and display
- ⏳ Review system (requires database schema updates)

All responses currently default to "Unreviewed" status until database schema is updated.