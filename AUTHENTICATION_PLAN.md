# Authentication & Role Management Implementation Plan

## 🎯 Overview

This document outlines the comprehensive authentication and authorization system for the HOA Survey Dashboard using Supabase Auth. The current system has no authentication (anonymous access) and needs secure, role-based access control.

## 📊 Current State Analysis

**Security Issues:**
- ❌ No authentication - completely public access
- ❌ Anonymous database access with no restrictions
- ❌ No user roles or permissions
- ❌ PDF files accessible to anyone with URLs
- ❌ No audit trail for data changes
- ❌ Anyone can create/edit/delete responses

**Technical Debt:**
- Using `NEXT_PUBLIC_SUPABASE_ANON_KEY` for all operations
- No Row Level Security (RLS) policies
- No protected routes or middleware
- No user session management

## 🏗️ Target Architecture

### SECURITY-FIRST USER ROLES (Phase 1 - Maximum Lockdown)

**🔒 Initial Implementation: "Admin or Nothing" Approach**

| Role | Permissions | How to Get This Role |
|------|-------------|---------------------|
| **No Access** | Can login but sees NOTHING - blank dashboard with "Contact admin for access" | Default for all new signups |
| **Admin** | Full access to current system functionality | Manually promoted in Supabase dashboard by existing admin |

### Phase 1 Permission Matrix (Simplified)

| Action | No Access | Admin |
|--------|-----------|-------|
| View Dashboard | ❌ | ✅ |
| View Responses | ❌ | ✅ |
| Create Responses | ❌ | ✅ |
| Edit Responses | ❌ | ✅ |
| View PDFs | ❌ | ✅ |
| Everything Else | ❌ | ✅ |

**🔒 Security Philosophy:**
- **Default Deny**: New users get ZERO access
- **Manual Approval**: Only existing admins can promote users
- **Complete Isolation**: Non-admins cannot see any survey data
- **Simple Model**: Only two states - locked out or full access

## 🚨 CRITICAL: First Admin Setup

**⚠️ IMPORTANT: Creating the First Admin User**

Since we're implementing maximum security where everyone starts with `no_access`, you need to manually create the first admin BEFORE implementing RLS policies:

```sql
-- Step 1: After setting up auth but BEFORE enabling RLS
-- Go to Supabase Dashboard > Authentication > Users
-- Create a user manually with your email

-- Step 2: Get the user ID from the auth.users table
SELECT id FROM auth.users WHERE email = 'your-email@domain.com';

-- Step 3: Update that user to be admin
UPDATE user_profiles 
SET role = 'admin', updated_at = NOW()
WHERE id = 'your-user-id-from-step-2';

-- Step 4: Verify it worked
SELECT email, role FROM user_profiles 
JOIN auth.users ON user_profiles.id = auth.users.id 
WHERE role = 'admin';

-- Step 5: THEN enable RLS policies
-- Now you have an admin who can access everything and promote other users
```

**🔒 Security Note:** 
- Do this setup IMMEDIATELY after creating the database schema
- Test that you can log in as admin BEFORE enabling RLS
- Keep this admin account secure - it's your master key!

## 🔧 Implementation Plan

### Phase 1: Supabase Auth Setup (Foundation)

#### 1.1 Enable Supabase Authentication
```sql
-- Enable email/password authentication in Supabase Dashboard
-- Configure email templates
-- Set up redirect URLs for localhost:3000 and production domain
```

#### 1.2 Create User Profiles Table (MAXIMUM SECURITY)
```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'no_access' CHECK (role IN ('no_access', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sign_in TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  promoted_by UUID REFERENCES auth.users(id), -- Track who granted admin access
  promoted_at TIMESTAMP WITH TIME ZONE
);

-- Create trigger to auto-create profile on signup with NO ACCESS by default
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'no_access');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Function to promote user to admin (can only be called by existing admin)
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user is admin
  IF (SELECT role FROM user_profiles WHERE id = auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;
  
  -- Promote the user
  UPDATE user_profiles 
  SET role = 'admin', 
      promoted_by = auth.uid(), 
      promoted_at = NOW(),
      updated_at = NOW()
  WHERE id = user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 1.3 Environment Variables Update
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For admin operations
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000  # Update for production
```

### Phase 2: Database Security (Row Level Security)

#### 2.1 Enable RLS on All Tables
```sql
-- Enable RLS on main tables
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE q1_q2_preference_rating ENABLE ROW LEVEL SECURITY;
ALTER TABLE q3_opt_out_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE q4_landscaping_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE q5_q6_construction_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE q7_interest_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE q8_equipment_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE q9_dues_preference ENABLE ROW LEVEL SECURITY;
ALTER TABLE q10_biggest_concern ENABLE ROW LEVEL SECURITY;
ALTER TABLE q11_cost_reduction ENABLE ROW LEVEL SECURITY;
ALTER TABLE q12_involvement ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

#### 2.2 Create RLS Helper Functions (SIMPLE & SECURE)
```sql
-- Function to check if current user is admin (ONLY function we need!)
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin',
    false
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- That's it! Every policy will just check is_admin()
```

#### 2.3 Implement RLS Policies (MAXIMUM SECURITY - ADMIN ONLY)

**🔒 CRITICAL: ALL policies use the same simple rule - only admins get access!**

**User Profiles Policies:**
```sql
-- Users can view their own profile (so they know they exist)
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Only admins can view other profiles (for user management later)
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (is_admin());

-- Only admins can modify profiles (promote users, etc.)
CREATE POLICY "Admins can manage profiles" ON user_profiles
  FOR ALL USING (is_admin());
```

**Responses Table Policies (LOCKDOWN):**
```sql
-- ONLY ADMINS can see ANY responses
CREATE POLICY "Only admins can view responses" ON responses
  FOR SELECT USING (is_admin());

-- ONLY ADMINS can create responses
CREATE POLICY "Only admins can create responses" ON responses
  FOR INSERT WITH CHECK (is_admin());

-- ONLY ADMINS can update responses
CREATE POLICY "Only admins can update responses" ON responses
  FOR UPDATE USING (is_admin());

-- ONLY ADMINS can delete responses
CREATE POLICY "Only admins can delete responses" ON responses
  FOR DELETE USING (is_admin());
```

**Survey Data Policies (COMPLETE LOCKDOWN - Copy for ALL survey tables):**
```sql
-- Example for q1_q2_preference_rating (REPEAT FOR ALL 11 SURVEY TABLES)
CREATE POLICY "Only admins can access survey data" ON q1_q2_preference_rating
  FOR ALL USING (is_admin());

-- Apply same policy to all survey tables:
-- q1_q2_preference_rating, q3_opt_out_reasons, q4_landscaping_issues,
-- q5_q6_construction_group, q7_interest_areas, q8_equipment_ownership,
-- q9_dues_preference, q10_biggest_concern, q11_cost_reduction, q12_involvement
```

**Notes Policies (ADMIN ONLY):**
```sql
-- ONLY ADMINS can see ANY notes
CREATE POLICY "Only admins can access notes" ON survey_notes
  FOR ALL USING (is_admin());
```

**Complete_Responses View:**
```sql
-- Make sure the view respects RLS
-- Since view inherits from underlying tables, and all tables require is_admin(),
-- the view will automatically be admin-only
```

### Phase 3: Storage Security

#### 3.1 PDF Storage Policies (COMPLETE LOCKDOWN)
```sql
-- In Supabase Storage, create policies for survey-pdfs bucket

-- ONLY ADMINS can view ANY PDFs
CREATE POLICY "Only admins can view PDFs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'survey-pdfs' AND
    is_admin()
  );

-- ONLY ADMINS can upload PDFs
CREATE POLICY "Only admins can upload PDFs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'survey-pdfs' AND
    is_admin()
  );

-- ONLY ADMINS can delete PDFs
CREATE POLICY "Only admins can delete PDFs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'survey-pdfs' AND
    is_admin()
  );

-- ONLY ADMINS can update PDF metadata
CREATE POLICY "Only admins can update PDFs" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'survey-pdfs' AND
    is_admin()
  );
```

### Phase 4: Frontend Authentication

#### 4.1 Install Dependencies
```bash
npm install @supabase/auth-helpers-nextjs @supabase/auth-helpers-react
```

#### 4.2 Create Auth Context
```typescript
// lib/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  hasRole: (roles: string[]) => boolean;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'reviewer' | 'data_entry' | 'viewer';
  is_active: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Implementation here
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

#### 4.3 Route Protection Middleware
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protect all routes except login
  if (!session && !req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect authenticated users away from login
  if (session && req.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

#### 4.4 Login Page
```typescript
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  // Implementation with email/password form
  // Password reset functionality
  // Error handling
  // Loading states
}
```

#### 4.5 Navigation Updates
```typescript
// Update existing navigation to include:
// - User profile dropdown
// - Sign out button
// - Role-based menu items
// - User name/role display
```

### Phase 5: Component Updates

#### 5.1 Simple Permission Gate (Admin or Nothing)
```typescript
// components/AdminGate.tsx
interface AdminGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminGate({ children, fallback }: AdminGateProps) {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  if (profile?.role !== 'admin') {
    return fallback || (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Access Restricted</h2>
        <p className="text-gray-600 mb-4">
          You need admin access to view this content.
        </p>
        <p className="text-sm text-gray-500">
          Contact an administrator to request access.
        </p>
      </div>
    );
  }
  
  return <>{children}</>;
}

// Usage: Wrap EVERYTHING in AdminGate
<AdminGate>
  <ResponsesTable responses={responses} />
</AdminGate>
```

#### 5.2 Update All Pages (MAXIMUM SECURITY)
```typescript
// app/page.tsx (Dashboard)
export default function DashboardPage() {
  return (
    <AdminGate>
      {/* All existing dashboard content */}
    </AdminGate>
  );
}

// app/responses/page.tsx
async function ResponsesContent() {
  const responses = await getResponsesData();
  
  return (
    <AdminGate>
      {/* All existing responses content */}
    </AdminGate>
  );
}

// app/responses/[id]/page.tsx
async function ResponseDetailContent({ params }: { params: { id: string } }) {
  const response = await getResponseData(params.id);
  
  return (
    <AdminGate>
      {/* All existing response detail content */}
    </AdminGate>
  );
}

// Result: Non-admin users see "Access Restricted" message on EVERY page
```

### Phase 6: User Management Interface

#### 6.1 Admin Dashboard
```typescript
// app/admin/users/page.tsx
// - List all users
// - Create new users
// - Edit user roles
// - Activate/deactivate users
// - View user activity logs
```

#### 6.2 User Profile Management
```typescript
// app/profile/page.tsx
// - Edit own profile
// - Change password
// - View activity history
```

### Phase 7: Audit Trail & Logging

#### 7.1 Activity Logging Table
```sql
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 7.2 Logging Functions
```typescript
// lib/audit-log.ts
export async function logActivity(
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: any
) {
  // Implementation to log user activities
}
```

## 🚀 SIMPLIFIED Migration Strategy (Security First)

### Phase 1: Lock Everything Down (Day 1-2)
**Goal: Make system completely secure immediately**

1. **Set up Supabase Auth** (30 minutes)
   - Enable email/password in Supabase dashboard
   - Configure redirect URLs

2. **Create Database Schema** (30 minutes)
   - Create `user_profiles` table
   - Add `is_admin()` function
   - Create first admin user manually

3. **Enable RLS Lockdown** (1 hour)
   - Enable RLS on ALL tables
   - Add admin-only policies to ALL tables
   - Test that non-admins see nothing

4. **Test Security** (30 minutes)
   - Create test user (gets `no_access` by default)
   - Verify they can't see any data
   - Verify admin can see everything

### Phase 2: Frontend Integration (Day 3-4)
**Goal: Add login/logout and admin gates**

1. **Install Auth Libraries** (15 minutes)
   - Add Supabase auth helpers

2. **Create Auth System** (2 hours)
   - Auth context
   - Login page
   - Middleware for route protection

3. **Add Admin Gates** (2 hours)
   - Wrap all pages in `<AdminGate>`
   - Test that non-admins see "Access Restricted"

4. **Navigation Updates** (1 hour)
   - Add login/logout
   - Show user info for admins

### Phase 3: User Management (Day 5+)
**Goal: Basic admin tools to promote users**

1. **Simple User List** (optional for now)
   - View pending users
   - Promote to admin button

**🎯 Result: Complete security in 2-4 days max!**

### Zero Data Migration Needed!

**✅ Existing Data Stays Safe:**
- Current 113 responses automatically protected by RLS
- PDFs automatically secured by storage policies  
- No data changes needed - just access control

**✅ Existing Features Work:**
- All current functionality works exactly the same for admins
- Advanced filters, PDF upload, response creation - all unchanged
- Non-admins simply can't access any of it

## 🔒 Security Best Practices

### Authentication Security
- Enforce strong password requirements
- Implement session timeout
- Use secure JWT handling
- Add rate limiting for login attempts

### Database Security
- Use RLS policies consistently
- Regular security audits
- Principle of least privilege
- Secure service role key handling

### Frontend Security
- Client-side route protection
- Secure token storage
- CSRF protection
- Input validation and sanitization

## 🧪 Testing Strategy

### Unit Tests
- Auth helper functions
- Permission checking logic
- RLS policy validation

### Integration Tests
- Login/logout flow
- Role-based access
- Database operations with different users

### Security Tests
- Unauthorized access attempts
- Data isolation between users
- Storage access validation

## 📈 Monitoring & Analytics

### Metrics to Track
- Login success/failure rates
- User activity patterns
- Permission denials
- System performance with auth

### Alerts
- Failed login attempts
- Unauthorized access attempts
- System errors
- Performance degradation

## 💰 Cost Implications

**Supabase Auth Pricing:**
- Auth is included in Supabase free tier (up to 50,000 monthly active users)
- Should not impact current costs significantly

**Additional Resources:**
- User profiles table (minimal storage)
- Activity logs (consider retention policy)
- Slightly increased database queries due to RLS

## 🔄 Future Enhancements

### Post-MVP Features
- Two-factor authentication (2FA)
- Single Sign-On (SSO) integration
- Advanced audit reporting
- Bulk user import/export
- API key management for external integrations
- Advanced permission granularity

### Advanced Security
- IP whitelisting
- Device management
- Session management dashboard
- Advanced threat detection

## 📋 Implementation Checklist

### Pre-Implementation
- [ ] Review current system access requirements
- [ ] Define user roles and permissions
- [ ] Plan migration strategy
- [ ] Set up development environment

### Supabase Setup
- [ ] Enable authentication in Supabase dashboard
- [ ] Configure email templates
- [ ] Set up redirect URLs
- [ ] Create user profiles table
- [ ] Set up RLS policies

### Frontend Implementation
- [ ] Install auth dependencies
- [ ] Create auth context
- [ ] Implement middleware
- [ ] Create login page
- [ ] Update navigation
- [ ] Add permission gates
- [ ] Update existing components

### Testing & Deployment
- [ ] Test authentication flow
- [ ] Verify role-based access
- [ ] Test data isolation
- [ ] Performance testing
- [ ] Security testing
- [ ] Production deployment

### Post-Deployment
- [ ] Monitor system performance
- [ ] User training/documentation
- [ ] Ongoing security audits
- [ ] Feature enhancement planning

## 🎯 SUMMARY: Maximum Security Implementation

**🔒 What You Get:**
- **Immediate Lockdown**: All survey data completely protected from day 1
- **Simple Admin Model**: Only admins can see anything, everyone else gets "Access Restricted"
- **Zero Complexity**: No complex roles to manage initially
- **No Data Migration**: Existing 113 responses stay exactly where they are
- **Easy Expansion**: Can add more roles later when needed

**👤 User Experience:**
- **New Users**: Can create accounts but see nothing until promoted
- **Admins**: Full access to everything exactly as it works today
- **Promotion**: Manual process via Supabase dashboard (super secure)

**🛡️ Security Guarantees:**
- No anonymous access to any data
- No accidental data exposure
- Complete database-level protection via RLS
- PDF files locked down at storage level
- Route-level protection at application level

**📈 Future-Proof:**
- Easy to add more granular roles later
- Foundation supports complex permissions when needed
- Audit trail ready for expansion
- User management UI can be added incrementally

**⚡ Quick Implementation:**
- 2-4 days to complete lockdown
- No complex planning needed
- Can be done incrementally
- Immediate security benefits

This security-first approach ensures your HOA survey data is completely protected while maintaining all existing functionality for authorized users.