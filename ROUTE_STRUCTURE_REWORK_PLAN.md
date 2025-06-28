# Route Structure & Permission System Rework Plan

## **Current Problem Analysis**

### **Critical Issue Identified**
New user signup flow breaks at dashboard because:
1. User completes profile setup ✅
2. Gets redirected to dashboard ("/") ❌ 
3. Dashboard shows "Access Restricted" because user has no properties and isn't admin ❌
4. User is stuck with no clear path forward ❌

### **Root Cause: Architectural Mismatch**
The current system was built as an **admin survey platform** but is becoming a **multi-user community portal**. This creates fundamental conflicts:

- **Route protection** assumes binary admin/non-admin access
- **Navigation** assumes users either have property access or are admins
- **Dashboard** requires property access or admin privileges
- **No onboarding flow** for users without property access yet
- **Missing user states** between "new account" and "property access"

## **Current Route Structure Issues**

### **1. Over-Restrictive Route Protection**
```
Current Logic:
- Public: /auth/* only
- Protected: EVERYTHING else
```
**Problem**: No intermediate state for authenticated users without property access

### **2. Dashboard Route Confusion**
```
Current Flow:
Signup → Profile Setup → Dashboard ("/") → Access Restricted ❌
```
**Problem**: Dashboard is the default route but requires property access

### **3. Navigation State Problems**
- Navigation assumes property access exists
- No "onboarding" navigation state
- Admin vs user navigation not properly separated
- No guidance for users in intermediate states

### **4. Permission Structure Inadequacy**
```
Current States:
- Unauthenticated
- Authenticated + Admin
- Authenticated + Property Access
```
**Missing States**:
- Authenticated + No Profile (handled)
- Authenticated + Profile + No Properties (broken!)
- Authenticated + Pending Property Requests
- Authenticated + Multiple Properties

## **Proposed Solution: Four-Tier Route Architecture**

### **Tier 1: Public Routes (No Authentication)**
```
/                           → Landing page explaining the community portal
/auth/login                 → Login page
/auth/signup                → Registration page  
/auth/callback              → Auth callback
/about                      → About the community (optional)
```

### **Tier 2: Onboarding Routes (Auth Required, No Property Access)**
```
/auth/setup-profile         → Complete profile setup
/property-search            → Find and request property access
/getting-started            → Help and guidance for new users
/profile                    → Manage account settings
/help                       → User help and FAQ
```

### **Tier 3: User Routes (Auth + Property Access Required)**
```
/dashboard                  → Main user dashboard (move from "/")
/properties/[id]            → Property details and management
/properties/[id]/invite     → Invite residents (if owner)
/surveys/[id]               → Take surveys
/community                  → Community information and announcements
```

### **Tier 4: Admin Routes (Admin Privileges Required)**
```
/admin/dashboard            → Admin dashboard
/admin/properties           → All properties management
/admin/people               → All people management  
/admin/surveys              → Survey management
/admin/access-requests      → Review access requests
/admin/analytics            → Community analytics
```

## **User State Management Rework**

### **Five User States with Clear Flows**

#### **State 1: Unauthenticated**
- **Routes**: Public only
- **Landing**: `/auth/login` or new landing page
- **Navigation**: Login/Signup buttons only

#### **State 2: Authenticated, No Profile**
- **Routes**: Auth + Onboarding
- **Auto-redirect**: `/auth/setup-profile`
- **Navigation**: Profile setup progress

#### **State 3: Authenticated, Profile Complete, No Properties**
- **Routes**: Auth + Onboarding  
- **Auto-redirect**: `/property-search`
- **Navigation**: Onboarding nav with property search, help
- **Dashboard**: Special "Getting Started" dashboard showing:
  - Welcome message
  - Property search prompt
  - Help resources
  - Account settings

#### **State 4: Authenticated, Has Properties, Not Admin**
- **Routes**: Auth + Onboarding + User
- **Default**: `/dashboard` (renamed from "/")
- **Navigation**: Full user navigation
- **Features**: Property management, surveys, community access

#### **State 5: Admin User**
- **Routes**: All routes
- **Default**: `/admin/dashboard` or `/dashboard`
- **Navigation**: Admin + User navigation

## **Navigation Component Rework**

### **Current Navigation Problems**
- Single navigation for all user types
- Assumes property access exists
- No onboarding guidance
- Admin features mixed with user features

### **Proposed Navigation States**

#### **Public Navigation**
```tsx
- Logo/Home
- "Sign In" button
- "Create Account" button
```

#### **Onboarding Navigation**
```tsx
- Logo → /property-search (or getting-started)
- "Find Property" → /property-search
- "Help" → /help
- "Profile" → /profile
- "Sign Out"
```

#### **User Navigation**
```tsx
- Logo → /dashboard
- "Dashboard" → /dashboard
- "My Properties" → /properties (user's properties)
- "Community" → /community
- "Add Property" → /property-search
- "Profile" → /profile
- "Sign Out"
```

#### **Admin Navigation**
```tsx
- Logo → /dashboard or /admin/dashboard
- "Dashboard" → /dashboard
- "Admin Panel" → /admin/dashboard
  - Dropdown: Properties, People, Surveys, Access Requests
- "My Properties" → /properties (if admin also has properties)
- "Community" → /community
- "Profile" → /profile
- "Sign Out"
```

## **Implementation Plan**

### **Phase 1: Route Structure Foundation**
1. **Create route protection middleware with four tiers**
2. **Add user state detection utility functions**
3. **Implement proper redirect logic for each state**
4. **Create "Getting Started" dashboard for users without properties**

### **Phase 2: Navigation System Overhaul**
1. **Create navigation components for each user state**
2. **Implement dynamic navigation switching**
3. **Add breadcrumbs and user state indicators**
4. **Create onboarding progress indicators**

### **Phase 3: Route Reorganization**
1. **Move dashboard from "/" to "/dashboard"**
2. **Create proper landing page at "/"**  
3. **Reorganize admin routes under "/admin"**
4. **Update all internal links and redirects**

### **Phase 4: User Experience Enhancements**
1. **Create "Getting Started" guides**
2. **Add user state help text and guidance**
3. **Implement proper error states and messaging**
4. **Add user onboarding tooltips and tours**

## **Immediate Fix for Current Issue**

### **Quick Solution**
```typescript
// In middleware or dashboard
if (authenticated && profile && properties.length === 0) {
  redirect('/property-search');
}
```

### **Proper Solution**
Implement the user state detection and routing system described above.

## **Database Schema Considerations**

### **Additional Fields Needed**
```sql
-- Track user onboarding state
ALTER TABLE people ADD COLUMN onboarding_completed boolean DEFAULT false;
ALTER TABLE people ADD COLUMN last_activity_at timestamp;

-- Track property request status
-- (already exists in property_access_requests)
```

## **Benefits of This Approach**

### **User Experience**
- **Clear progression**: Every user state has obvious next steps
- **No dead ends**: Users never get stuck with "Access Restricted"
- **Proper onboarding**: Guided experience for new users
- **Multiple properties**: Easy to add more properties later

### **Developer Experience**
- **Clear separation of concerns**: Each tier has specific purpose
- **Easier testing**: Each user state can be tested independently
- **Better organization**: Features grouped by access level
- **Scalable**: Easy to add new user types or features

### **Security**
- **Proper access control**: Each tier enforces appropriate permissions
- **Clear boundaries**: No confusion about what users can access
- **Audit trail**: User progression through states is trackable

## **Migration Strategy**

### **Backward Compatibility**
- Keep existing routes working during transition
- Gradual migration of features to new structure
- User communication about changes

### **Deployment Plan**
- Deploy route protection changes first
- Update navigation incrementally
- Move dashboard route last (with redirects)

## **Success Metrics**

### **User Onboarding**
- **Completion rate**: % of users who complete property search after signup
- **Time to property access**: How long from signup to first property access
- **Drop-off points**: Where users get stuck in the flow

### **User Engagement**
- **Return visits**: Do users come back after initial property access?
- **Feature usage**: Which parts of the platform get used most?
- **Support requests**: Reduction in confusion-related support tickets

## **Next Steps**

1. **Validate this plan** with stakeholders
2. **Create detailed technical specifications** for each phase
3. **Set up user state detection utilities**
4. **Implement quick fix** for immediate issue
5. **Begin Phase 1 implementation**

---

**This rework transforms the platform from an admin tool into a proper community portal with clear user journeys and appropriate access controls for each user type.**