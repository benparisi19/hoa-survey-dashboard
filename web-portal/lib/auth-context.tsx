'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, Session } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  userProfile: UserProfile | null;
  refreshProfile: () => Promise<void>;
};

export type UserProfile = {
  person_id: string;
  first_name: string;
  last_name: string;
  email: string;
  account_status: string;
  account_type: string;
  verification_method?: string;
  accessible_properties: PropertyAccess[];
};

export type PropertyAccess = {
  property_id: string;
  address: string;
  hoa_zone: string;
  access_type: 'owner' | 'resident' | 'manager';
  permissions: string[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const supabase = createClientComponentClient<Database>();

  // Fetch user profile and accessible properties
  const fetchUserProfile = async (userId: string) => {
    try {
      // Get user's profile from people table
      const { data: profile, error: profileError } = await supabase
        .from('people')
        .select('*')
        .eq('auth_user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      if (!profile) {
        console.log('No profile found for user:', userId);
        return null;
      }

      // Get user's accessible properties using the database function
      const { data: properties, error: propertiesError } = await supabase
        .rpc('get_user_accessible_properties', { user_auth_id: userId });

      if (propertiesError) {
        console.error('Error fetching accessible properties:', propertiesError);
        return {
          ...profile,
          accessible_properties: []
        };
      }

      return {
        ...profile,
        accessible_properties: properties || []
      };

    } catch (error) {
      console.error('Unexpected error fetching user profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          
          // Fetch user profile
          const profile = await fetchUserProfile(initialSession.user.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile when user signs in
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        } else {
          // Clear profile when user signs out
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signOut,
    userProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to check if user has specific permission for a property
export function hasPropertyPermission(
  userProfile: UserProfile | null,
  propertyId: string,
  permission: string
): boolean {
  if (!userProfile) return false;
  
  // HOA admins have all permissions
  if (userProfile.account_type === 'hoa_admin') return true;
  
  const propertyAccess = userProfile.accessible_properties.find(
    p => p.property_id === propertyId
  );
  
  if (!propertyAccess) return false;
  
  // Owners have all permissions for their properties
  if (propertyAccess.access_type === 'owner') return true;
  
  // Check specific permissions
  return propertyAccess.permissions.includes(permission);
}

// Helper function to get all accessible property IDs
export function getAccessiblePropertyIds(userProfile: UserProfile | null): string[] {
  if (!userProfile) return [];
  return userProfile.accessible_properties.map(p => p.property_id);
}

// Legacy compatibility - maintain the old interface for existing components
export interface UserProfile_Legacy {
  id: string;
  email: string;
  full_name: string | null;
  role: 'no_access' | 'admin';
  is_active: boolean;
  created_at: string;
  last_sign_in: string | null;
}

export function useProfile() {
  const { userProfile, loading } = useAuth();
  
  // Map new profile format to legacy format for backwards compatibility
  const legacyProfile: UserProfile_Legacy | null = userProfile ? {
    id: userProfile.person_id,
    email: userProfile.email,
    full_name: `${userProfile.first_name} ${userProfile.last_name}`,
    role: userProfile.account_type === 'hoa_admin' ? 'admin' : 'no_access',
    is_active: userProfile.account_status === 'verified',
    created_at: new Date().toISOString(), // Placeholder
    last_sign_in: null // Placeholder
  } : null;

  const isAdmin = () => userProfile?.account_type === 'hoa_admin';

  return { 
    profile: legacyProfile, 
    loading, 
    isAdmin 
  };
}