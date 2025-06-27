# Authentication Troubleshooting Guide

**Created**: June 2025  
**Purpose**: Document common authentication issues and proven solutions to prevent recurring problems

## 🚨 Common Authentication Issues & Solutions

This guide documents the authentication patterns that work, common mistakes to avoid, and step-by-step troubleshooting for the most frequent issues we've encountered.

---

## 🔄 **Issue 1: Infinite Loading on Page Refresh**

### **Symptoms**
- User signs in successfully 
- Page refresh causes infinite loading spinner
- User menu shows grey rectangle instead of profile
- Console shows auth state changes but UI never updates
- Works in development but breaks in production

### **Root Cause**
Complex auth contexts that try to handle both authentication AND profile fetching in one hook, causing race conditions and hydration mismatches.

### **❌ What Doesn't Work (Mistakes We Made)**

#### **Mistake 1: Complex Hydration Logic**
```typescript
// DON'T DO THIS - causes more problems than it solves
const [hydrated, setHydrated] = useState(false);
useEffect(() => { setHydrated(true); }, []);
if (!hydrated) return; // Wait for hydration
```

#### **Mistake 2: Combined Auth + Profile Context**
```typescript
// DON'T DO THIS - causes race conditions
const AuthContext = {
  user: User | null,
  userProfile: UserProfile | null,  // ❌ Profile in auth context
  loading: boolean,
  // Profile fetching mixed with auth logic ❌
}
```

#### **Mistake 3: Using getSession() in SSR**
```typescript
// DON'T DO THIS - unreliable in server components
const { data: { session } } = await supabase.auth.getSession();
```

### **✅ The Correct Solution**

#### **1. Separate Auth from Profile**
```typescript
// auth-context-v2.tsx - ONLY handles authentication
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  // NO profile data here
};

// Separate useProfile() hook handles profile independently
export function useProfile() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  // Profile fetching logic here
}
```

#### **2. Use getUser() for Reliability**
```typescript
// DO THIS - more reliable than getSession()
const { data: { user }, error } = await supabase.auth.getUser();
```

#### **3. Clean Component Pattern**
```typescript
// Components use both hooks separately
const { user, loading } = useAuth();           // Auth state only
const { userProfile, isAdmin } = useProfile(); // Profile data only
```

### **Why This Works**
1. **Fast Auth Loading**: Auth state loads immediately without waiting for profile
2. **No Race Conditions**: Profile loads independently after auth is established
3. **Clean Loading States**: Auth loading vs profile loading are separate
4. **Simple Logic**: No complex hydration or caching logic to break

---

## 🔄 **Issue 2: Admin Privileges Not Working**

### **Symptoms**
- User signs in successfully but admin features don't appear
- Console shows `account_type: undefined` or `result: false`
- Navigation doesn't show admin tabs
- Database shows correct `account_type: 'hoa_admin'` but UI doesn't reflect it

### **Root Cause Analysis Checklist**

#### **Step 1: Check RLS Policies**
```sql
-- Run this query to test profile access
SELECT * FROM people WHERE auth_user_id = auth.uid();
```

**Common Issue**: Infinite recursion in RLS policies
```sql
-- ❌ DON'T DO THIS - causes infinite recursion
CREATE POLICY "HOA admins can view all people" ON people
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM people  -- ❌ Queries people table inside people policy
      WHERE auth_user_id = auth.uid() 
      AND account_type = 'hoa_admin'
    )
  );
```

#### **Step 2: Verify Profile Fetching**
```typescript
// Check console for these debug messages
console.log('🔍 isAdmin check:', {
  userProfile: userProfile,
  account_type: userProfile?.account_type,
  result: result
});
```

#### **Step 3: Check Component Integration**
```typescript
// Make sure components use the correct hooks
const { userProfile, isAdmin } = useProfile(); // ✅ Correct
// NOT: const { userProfile } = useAuth();     // ❌ Wrong after separation
```

### **✅ The Solution: Fixed RLS Policies**

#### **Remove Problematic Policies**
```sql
-- Remove infinite recursion policy
DROP POLICY IF EXISTS "HOA admins can view all people" ON people;
```

#### **Use Simple User-Only Policy**
```sql
-- Keep only simple self-access policy
CREATE POLICY "Users can view own profile" ON people
  FOR SELECT USING (auth_user_id = auth.uid());
```

#### **Admin Operations Use Service Key**
Admin functions that need to see all users bypass RLS entirely by using the service key in API routes.

---

## 🔄 **Issue 3: Database Connection Errors**

### **Symptoms**
- `Error fetching user profile: { code: '42P17', message: 'infinite recursion detected' }`
- Profile loading fails entirely
- Authentication works but profile is always null

### **Root Cause**
Row Level Security policies that reference the same table they're protecting.

### **Solution**
Apply the RLS policy fix from `/PHASE_4_RLS_POLICIES_FIX.sql`:

```sql
-- 1. Remove problematic policies
DROP POLICY IF EXISTS "HOA admins can view all people" ON people;

-- 2. Keep simple policies
CREATE POLICY "Users can view own profile" ON people
  FOR SELECT USING (auth_user_id = auth.uid());

-- 3. Admin operations use service key (bypasses RLS)
```

---

## 📋 **Troubleshooting Checklist**

### **When Auth Issues Occur:**

#### **1. Check Browser Console**
Look for these specific messages:
- `🔍 isAdmin check:` - Shows profile loading status
- `🔄 Profile loaded for user:` - Confirms profile fetch
- `Auth state changed:` - Shows auth transitions
- Any SQL errors or RLS policy errors

#### **2. Verify Database State**
```sql
-- Check if user exists in auth.users
SELECT id, email FROM auth.users WHERE email = 'user@example.com';

-- Check if profile exists and is linked
SELECT person_id, auth_user_id, account_type FROM people 
WHERE email = 'user@example.com';

-- Test RLS policies
SELECT * FROM people WHERE auth_user_id = auth.uid();
```

#### **3. Test Component Integration**
```typescript
// Add temporary debug logging
const { user, loading } = useAuth();
const { userProfile, isAdmin } = useProfile();

console.log('Debug state:', { user: !!user, userProfile, isAdmin: isAdmin() });
```

#### **4. Check Hook Usage**
Ensure all components import and use the correct hooks:
```typescript
// ✅ Correct pattern after auth/profile separation
import { useAuth, useProfile } from '@/lib/auth-context-v2';

const { user, loading } = useAuth();
const { userProfile, isAdmin } = useProfile();
```

---

## 🏗️ **Architecture Pattern That Works**

### **File Structure**
```
lib/
├── auth-context-v2.tsx     # Simple auth context (user, loading, sign in/out)
├── supabase/
│   ├── client.ts           # Browser client
│   ├── server.ts           # Server client  
│   └── middleware.ts       # Middleware client
```

### **Context Separation**
```typescript
// AuthProvider - ONLY authentication
export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Uses getUser() for reliability
  // Simple auth state management
  // NO profile fetching here
}

// useProfile() - ONLY profile data
export function useProfile() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Fetches profile when user changes
  // Independent of auth loading
  // Clean error handling
}
```

### **Component Pattern**
```typescript
// Clean component integration
export default function MyComponent() {
  const { user, loading } = useAuth();           // Auth status
  const { userProfile, isAdmin } = useProfile(); // Profile data
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;
  if (!userProfile) return <ProfileLoading />;
  
  return (
    <div>
      {isAdmin() && <AdminFeatures />}
      <UserContent userProfile={userProfile} />
    </div>
  );
}
```

---

## 🚀 **Prevention Guidelines**

### **DO's**
1. ✅ **Separate auth from profile** - Use different hooks for different concerns
2. ✅ **Use getUser() over getSession()** - More reliable for server components
3. ✅ **Simple RLS policies** - Avoid referencing the same table in policy conditions
4. ✅ **Service key for admin operations** - Bypass RLS when you need system-wide access
5. ✅ **Debug logging** - Add console.log statements to track state changes
6. ✅ **Test in production** - Auth behaves differently in production vs development

### **DON'Ts**
1. ❌ **Don't mix auth and profile in one context** - Causes race conditions
2. ❌ **Don't add complex hydration logic** - Causes more problems than it solves  
3. ❌ **Don't use getSession() in server components** - Unreliable
4. ❌ **Don't create RLS policies that query the same table** - Causes infinite recursion
5. ❌ **Don't assume development = production** - Always test auth in production environment

### **When You See Issues**
1. 🔍 **Check console first** - Look for specific error patterns
2. 🔍 **Test RLS policies** - Run queries manually in Supabase
3. 🔍 **Verify hook usage** - Make sure components use separated hooks
4. 🔍 **Check browser network tab** - Look for failed API calls
5. 🔍 **Test with different users** - Admin vs regular user behavior

---

## 📚 **Related Documentation**

- **Database Schema**: `/supabase.ts` - Complete table structure and types
- **RLS Policies**: `/PHASE_4_RLS_POLICIES.sql` - Working policies
- **RLS Fix**: `/PHASE_4_RLS_POLICIES_FIX.sql` - Fix for infinite recursion
- **Implementation Guide**: `/PHASE_4_IMPLEMENTATION_GUIDE.md` - Complete Phase 4 overview
- **Test Checklist**: `/PHASE_4_TEST_CHECKLIST.md` - Testing procedures

---

## 🎯 **Quick Reference**

### **Fix Infinite Loading**
1. Separate auth context from profile hook
2. Use getUser() instead of getSession()
3. Remove complex hydration logic

### **Fix Admin Privileges**
1. Check RLS policies for infinite recursion
2. Apply PHASE_4_RLS_POLICIES_FIX.sql
3. Use service key for admin operations

### **Fix Profile Loading Errors**
1. Check console for SQL errors
2. Test RLS policies manually in Supabase
3. Verify auth_user_id linkage in people table

**Remember**: When in doubt, start with the simplest possible auth implementation and add complexity only when absolutely necessary. The pattern documented here has been battle-tested and proven to work in production.