# Survey Caching Strategy

## Overview
The survey management system uses Next.js server-side caching for performance. This document explains how cache revalidation works.

## Cache Revalidation Points

### Automatic Revalidation
Cache is automatically cleared when:

1. **Creating a new survey** - `/api/surveys/create`
   - Revalidates: `/surveys`, `/api/surveys`, new survey pages

2. **Updating a survey** - `/api/surveys/[id]` (PUT)
   - Revalidates: `/surveys`, `/api/surveys`, specific survey pages

3. **Debug operations** - `/api/debug-surveys`
   - Revalidates when creating/deleting test surveys

### Manual Cache Clearing
If data changes outside the app (direct database edits, scripts):
- No automatic revalidation occurs
- User must refresh the page or wait for cache expiry

## Revalidation Utility
Use the centralized utility function for consistency:

```typescript
import { revalidateSurveyCache } from '@/lib/cache-utils';

// After any survey modification
revalidateSurveyCache(surveyId);
```

## Future Considerations
- Add a manual refresh button if needed
- Consider Supabase Realtime for multi-user scenarios
- Monitor if polling or SSE is needed for external updates

## Troubleshooting
If surveys aren't updating:
1. Check browser console for revalidation logs
2. Verify API endpoints are using `revalidateSurveyCache()`
3. Hard refresh with Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Check if changes were made outside the app