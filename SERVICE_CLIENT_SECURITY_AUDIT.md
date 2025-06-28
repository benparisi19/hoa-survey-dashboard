# Service Client Security Audit & Guidelines

**Created**: June 2025  
**Priority**: Critical Security Issue  
**Status**: Immediate Action Required

## 🚨 **Critical Security Issue Discovered**

Our application is using `createServiceClient()` extensively throughout the codebase, which **bypasses ALL Row Level Security (RLS) policies**. This creates massive security vulnerabilities.

### **What's Wrong**
- Service client uses the **service key** which has admin privileges
- **ALL RLS policies are bypassed** when using service client
- Users can access data they shouldn't have permission to see
- This defeats the entire purpose of our authentication system

### **Scope of the Problem**
Found **63+ instances** of improper service client usage across:
- Page components (zones, properties, people, surveys, neighborhood)
- API routes (properties, residents, surveys, access requests)
- Server actions (notes, reviews, PDF updates)

---

## 📋 **Service Client Usage Audit**

### **❌ SECURITY VIOLATIONS - Pages Using Service Client**

These pages use service client and allow **any authenticated user** to see **all data**:

#### **Property Management**
- `/app/properties/page.tsx` - **ALL PROPERTIES visible to any user**
- `/app/properties/[id]/page.tsx` - **FIXED** ✅
- `/app/people/page.tsx` - **ALL RESIDENTS visible to any user** 
- `/app/people/[id]/page.tsx` - **ANY PERSON visible to any user**

#### **Zone & Neighborhood**
- `/app/zones/page.tsx` - All zone data exposed
- `/app/zones/[zone]/page.tsx` - All zone details exposed
- `/app/neighborhood/page.tsx` - All neighborhood data exposed

#### **Surveys**
- `/app/surveys/page.tsx` - All surveys exposed
- `/app/surveys/[id]/page.tsx` - Any survey accessible
- `/app/surveys/builder/page.tsx` - Survey builder exposed

### **❌ SECURITY VIOLATIONS - API Routes**

These API routes use service client and have **no access control**:

#### **Property APIs**
- `/api/properties/route.ts` - Returns ALL properties
- `/api/properties/[id]/route.ts` - Any property accessible
- `/api/properties/[id]/residents/route.ts` - All residents accessible
- `/api/properties/[id]/residents/[residentId]/route.ts` - Any resident editable
- `/api/properties/[id]/invite/route.ts` - Anyone can invite to any property
- `/api/properties/search/route.ts` - Full property search exposed

#### **People APIs**
- `/api/people/route.ts` - Returns ALL people data

#### **Survey APIs**
- `/api/surveys/route.ts` - All surveys accessible
- `/api/surveys/[id]/route.ts` - Any survey accessible
- `/api/surveys/create/route.ts` - Anyone can create surveys

### **✅ LEGITIMATE Service Client Usage**

These are appropriate uses (admin operations that should bypass RLS):

#### **Authentication Operations**
- `/api/access-requests/[id]/route.ts` - Admin user creation ✅
- `/api/invitations/accept/route.ts` - Admin user creation ✅

#### **System Operations**
- `/app/api/debug-surveys/route.ts` - Debug endpoint ✅
- Server actions for admin operations (notes, reviews) ✅

---

## 🔧 **Security Fix Guidelines**

### **When to Use Each Client Type**

#### **✅ Use `createClient()` from `@/lib/supabase/server`**
**For: User-specific data that should respect RLS policies**
```typescript
// ✅ CORRECT - Respects user permissions
import { createClient } from '@/lib/supabase/server';

const supabase = createClient();
const { data } = await supabase.from('properties').select('*');
// Returns only properties user has access to
```

#### **⚠️ Use `createServiceClient()` ONLY for Admin Operations**
**For: System operations that need to bypass user restrictions**
```typescript
// ⚠️ USE SPARINGLY - Only for admin operations
import { createServiceClient } from '@/lib/supabase';

// Must verify admin status first!
const { data: { user } } = await supabase.auth.getUser();
const userProfile = await getUserProfile(user.id);
if (userProfile.account_type !== 'hoa_admin') {
  return new Response('Unauthorized', { status: 403 });
}

const adminSupabase = createServiceClient();
// Now can safely use admin privileges
```

#### **✅ Use `createAdminClient()` for Auth Operations**
**For: Creating/managing Supabase Auth users**
```typescript
// ✅ CORRECT - For auth.admin operations only
import { createAdminClient } from '@/lib/supabase';

const adminClient = createAdminClient();
const { data } = await adminClient.auth.admin.createUser({
  email: 'user@example.com'
});
```

### **Security Patterns**

#### **Page Components**
```typescript
// ✅ SECURE Pattern for pages
async function SecurePage() {
  const supabase = createClient(); // Uses auth context + RLS
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  
  // This query respects RLS - user sees only their data
  const { data } = await supabase.from('properties').select('*');
  
  return <Component data={data} />;
}
```

#### **API Routes**
```typescript
// ✅ SECURE Pattern for API routes
export async function GET(request: Request) {
  const supabase = createClient(); // Uses auth context + RLS
  
  // Verify authentication
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // This query respects RLS automatically
  const { data, error: queryError } = await supabase
    .from('properties')
    .select('*');
    
  if (queryError) {
    return new Response('Error', { status: 500 });
  }
  
  return Response.json(data);
}
```

#### **Admin-Only Operations**
```typescript
// ✅ SECURE Pattern for admin operations
export async function AdminOperation(request: Request) {
  const supabase = createClient();
  
  // First verify user is authenticated and admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  
  const { data: profile } = await supabase
    .from('people')
    .select('account_type')
    .eq('auth_user_id', user.id)
    .single();
    
  if (profile?.account_type !== 'hoa_admin') {
    return new Response('Forbidden', { status: 403 });
  }
  
  // NOW we can use service client for admin operations
  const adminSupabase = createServiceClient();
  const { data } = await adminSupabase.from('all_data').select('*');
  
  return Response.json(data);
}
```

---

## 🚨 **Immediate Action Required**

### **Phase 1: Critical Security Fixes** (This Week)
1. **Properties Pages** - Fix to use authenticated client
2. **People Pages** - Fix to use authenticated client  
3. **Property APIs** - Add proper authentication
4. **People APIs** - Add proper authentication

### **Phase 2: Secondary Fixes** (Next Week)
1. **Zone Pages** - Determine if admin-only or user-accessible
2. **Survey Pages** - Implement proper access control
3. **Neighborhood Page** - Determine access requirements

### **Phase 3: Testing & Verification**
1. Test with non-admin user accounts
2. Verify data isolation works properly
3. Confirm admin users retain full access
4. Performance testing with RLS enabled

---

## 📝 **Development Guidelines Going Forward**

### **❌ NEVER DO THIS**
```typescript
// ❌ WRONG - Bypasses all security
const supabase = createServiceClient();
const { data } = await supabase.from('user_data').select('*');
```

### **✅ ALWAYS DO THIS**
```typescript
// ✅ CORRECT - Respects user permissions
const supabase = createClient();
const { data } = await supabase.from('user_data').select('*');
```

### **Code Review Checklist**
- [ ] Is `createServiceClient()` used only for legitimate admin operations?
- [ ] Is admin status verified before using service client?
- [ ] Are user-facing pages using authenticated client?
- [ ] Are API routes properly checking authentication?
- [ ] Would this allow unauthorized data access?

### **Testing Requirements**
- Always test with non-admin user accounts
- Verify RLS policies are working as expected
- Check that unauthorized access returns appropriate errors
- Confirm admin users retain necessary access

---

## 🎯 **Next Steps**

1. **Apply RLS Security Fix** - Run `PHASE_4_RLS_SECURITY_FIX.sql`
2. **Fix Critical Pages** - Update properties and people pages
3. **Fix Critical APIs** - Update property and people APIs  
4. **Add Guidelines to CLAUDE.md** - Prevent future security issues
5. **Code Review All Changes** - Ensure proper patterns

**Remember: Service client = Admin privileges. Use only when absolutely necessary and after verifying admin status.**