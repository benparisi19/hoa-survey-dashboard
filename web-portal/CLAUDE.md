# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production (always run before commits)
npm run type-check   # TypeScript validation without building
npm run lint         # ESLint validation
```

### Environment Setup
```bash
cp .env.example .env # Copy environment template
# Edit .env with credentials:
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
# NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN (for map integration)
```

### Database Setup
```bash
# Execute RLS policies in Supabase SQL Editor:
# ../PHASE_4_RLS_POLICIES.sql (authentication and security policies)

# Utility scripts for data management
node scripts/geocode-properties.js       # Geocode property addresses for map display
node scripts/geocode-properties.js stats # Show geocoding statistics
```

## Architecture Overview

### Platform Status
This is a **comprehensive HOA Community Management Platform** with:
- 232 properties with complete resident management
- Supabase authentication with property-based access control
- Interactive mapping with zone visualization
- Multi-survey platform with flexible JSONB schema
- 6-tab navigation: Neighborhood → Zones → Properties → People → Responses → Dashboard

### Core Technology Stack
- **Next.js 14** with App Router and TypeScript
- **Supabase** for PostgreSQL database, authentication, and storage
- **Supabase Auth** with magic link authentication and Row Level Security
- **Mapbox GL JS** for interactive property mapping
- **Tailwind CSS** for styling with responsive design system
- **Recharts** for data visualizations

### Database Architecture
**Schema Reference**: See `/supabase.ts` for complete TypeScript types and table definitions.

**Core Tables**:
- `people` - Residents with Supabase Auth integration (`auth_user_id`)
- `properties` - 232 properties with geocoding (lat/lng) and zone data
- `property_residents` - Property-person relationships with permissions
- `property_ownership` - Ownership verification and management
- `property_invitations` - Invitation system for property access
- `property_access_requests` - Public access request workflow
- `property_access_audit` - Complete audit trail for security
- `survey_definitions` - Flexible survey schemas (JSONB)
- `property_surveys` - Survey responses linked to properties (JSONB)

**Key Views**:
- `property_directory` - Properties with owner information
- `verified_property_residents` - Active residents with property details
- `property_ownership_summary` - Ownership aggregation by property

### Authentication System (Phase 4 Complete)
**Magic Link Flow**:
1. User enters email at `/auth/login`
2. Supabase sends magic link email
3. User clicks link → redirected to `/auth/callback`
4. Session established → redirected to `/dashboard`

**Access Control**:
- **Property-based permissions**: Users see only their accessible properties
- **Row Level Security**: Database policies using `auth.uid()`
- **Multi-property support**: Owners can manage multiple properties
- **Invitation system**: Property owners invite residents via `/properties/[id]/invite`
- **Access requests**: Public form at `/request-access` for claiming property access

**User Types**:
- `resident` - Basic property access and survey participation
- `owner` - Property management and resident invitation rights
- `property_manager` - Multi-property management for professionals
- `hoa_admin` - System-wide access and ownership verification

### Application Structure

#### Navigation Hierarchy (6 Tabs)
1. **Neighborhood** (`/neighborhood`) - Executive dashboard and community metrics
2. **Zones** (`/zones`) - Zone management with interactive Mapbox mapping
3. **Properties** (`/properties`) - Property directory with filtering and detail views
4. **People** (`/people`) - Resident management and relationship tracking
5. **Responses** (`/responses`) - Survey analysis (legacy landscaping + flexible surveys)
6. **Dashboard** (`/`) - Main dashboard with overview metrics

#### Authentication Routes
- `/auth/login` - Magic link authentication
- `/auth/callback` - Supabase auth callback handler
- `/dashboard` - User property dashboard (post-login)
- `/request-access` - Public property access request form
- `/invitations/accept` - Invitation acceptance flow
- `/admin/access-requests` - HOA admin request management

#### Core Components

**Layout & Navigation**:
- `AuthProvider` - Supabase auth context with session management
- `Navigation` - 6-tab responsive navigation with auth state
- `ProtectedFooter` - Authenticated user footer

**Property Management**:
- `PropertyMap` - Interactive Mapbox map with zone-colored markers
- `PropertyDirectory` - Filterable table of all 232 properties
- `PropertyDetail` - Individual property page with residents and survey history
- `ResidentManagement` - Add/edit residents and property relationships

**Authentication Components**:
- `AuthProvider` - Session management and user profile loading
- `PropertyAccessForm` - Public access request form
- `InvitationFlow` - Property owner invitation system
- `AccessRequestManagement` - HOA admin approval workflow

**Survey System**:
- `SurveyBuilder` - Google Forms-style survey creation (Phase 3A complete)
- `FlexibleSurveyView` - Dynamic survey rendering based on JSONB schema
- `SurveyAnalytics` - Charts and analytics for any survey type
- Legacy: `SurveyFormView` - Original landscaping survey display

### Data Flow Patterns

#### Server Components with Auth
```typescript
// Standard pattern for authenticated pages
async function PageContent() {
  const supabase = createServiceClient();
  const { data } = await supabase.from('table').select('*');
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

#### Client Components for Interactivity
```typescript
'use client';
// Use for: forms, filtering, maps, real-time updates
```

#### API Route Pattern
```typescript
// Standard Supabase integration with error handling
export async function GET/POST/PUT/DELETE(request: Request) {
  const supabase = createServiceClient(); // Server-side
  // For auth operations: createAdminClient()
  
  try {
    const { data, error } = await supabase.from('table').select();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Message' }, { status: 500 });
  }
}
```

### Supabase Integration Patterns

#### Client Types & Security Guidelines

**🚨 CRITICAL SECURITY WARNING: Service Client Usage**

```typescript
// ❌ DANGEROUS - Bypasses ALL security (RLS policies)
createServiceClient()    // Use ONLY for admin operations after auth check

// ✅ SECURE - Respects user permissions and RLS policies  
createClient()           // From @/lib/supabase/server - USE THIS FOR USER DATA

// ✅ ADMIN ONLY - For Supabase Auth admin operations
createAdminClient()      // Auth admin operations (create users)

// ✅ CLIENT - For browser/client-side operations
createBrowserClient()    // Client-side operations (anon key)
```

**Security Rules:**
1. **NEVER use `createServiceClient()` for user-facing data** - bypasses all RLS
2. **ALWAYS use `createClient()` for pages and APIs** - respects user permissions
3. **ONLY use `createServiceClient()` after verifying admin status**
4. **Test with non-admin users** to verify data isolation works

#### RLS Policy Structure
All tables use Row Level Security with `auth.uid()`:
- Users see only their accessible properties
- HOA admins have system-wide access
- Service key operations bypass all RLS

#### Data Relationships
- Properties ← Property Residents → People (many-to-many)
- People ← Auth Users (auth_user_id foreign key)
- Properties → Survey Responses (property-centric)
- Survey Definitions → Property Surveys (flexible schema)

### Key Design Patterns

#### Property-Centric Access Control
All data access filtered by user's accessible properties:
```typescript
const { data } = await supabase
  .rpc('get_user_accessible_properties', { user_auth_id: user.id })
```

#### Flexible Survey Schema
Survey definitions use JSONB for infinite flexibility:
```typescript
response_schema: {
  sections: [
    { questions: [{ id, type, text, options, validation }] }
  ]
}
```

#### Progressive Enhancement
- Base functionality without JavaScript
- Enhanced interactivity with client components
- Mobile-first responsive design

## Important Development Notes

### Authentication Requirements
- All protected routes require Supabase session
- Use `createAdminClient()` for user creation operations
- RLS policies must be executed: `../PHASE_4_RLS_POLICIES.sql`
- Magic links logged to console in development

### Data Integrity
- 232 real properties with geocoded coordinates
- 113 legacy survey responses preserved
- Review status workflow maintained
- Property-resident relationships with history tracking

### Performance Considerations
- Server-side filtering for large datasets
- Mapbox optimized for 232 property markers
- JSONB indexes for survey response queries
- Client-side filtering for responsive tables

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Public anon key (frontend)
SUPABASE_SERVICE_KEY=             # Service key (backend operations)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=  # Mapbox for property mapping
NEXT_PUBLIC_APP_URL=              # Base URL for invitation links
```

### Database Interaction Patterns
1. **Schema changes**: Provide SQL for user to execute in Supabase dashboard
2. **Data updates**: Use service key with explanation of changes
3. **User operations**: Use admin client for auth.users modifications
4. **Always validate**: `npm run build` before commits

## Reference Documentation

- **`/supabase.ts`** - Canonical database schema with TypeScript types
- **`README.md`** - Project overview and current platform status
- **`NEXT_STEPS.md`** - Development roadmap and future features
- **`PHASE_4_RLS_POLICIES.sql`** - Row Level Security policies for authentication