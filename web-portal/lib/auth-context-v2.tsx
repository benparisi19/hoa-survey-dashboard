'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  isAdmin: () => boolean;
  refreshProfile: () => Promise<void>;
  forceAuthRefresh: () => Promise<void>;
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  // Fetch user profile and accessible properties
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      // Get user's profile from people table - FORCE NO CACHE
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

      // Get user's accessible properties
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
      console.log('🔄 Manually refreshing profile for user:', user.id);
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
      console.log('✅ Profile refreshed:', profile?.account_type);
    }
  };

  // Force a complete auth refresh to clear any cached state
  const forceAuthRefresh = async () => {
    console.log('🚀 FORCING COMPLETE AUTH REFRESH');
    setLoading(true);
    try {
      // Force get fresh user data
      const { data: { user: freshUser }, error } = await supabase.auth.getUser();
      if (freshUser && !error) {
        setUser(freshUser);
        const profile = await fetchUserProfile(freshUser.id);
        setUserProfile(profile);
        console.log('✅ Complete auth refresh done:', profile?.account_type);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!mounted) return;
      
      if (session?.user) {
        setUser(session.user);
        const profile = await fetchUserProfile(session.user.id);
        if (mounted) {
          setUserProfile(profile);
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          setUser(session.user);
          // FORCE FRESH PROFILE FETCH - don't use cached data
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            setUserProfile(profile);
            console.log('🔄 Fresh profile loaded:', profile?.account_type);
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
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

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
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

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
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
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAdmin = () => {
    return userProfile?.account_type === 'hoa_admin';
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signInWithPassword,
    signUp,
    signOut,
    isAdmin,
    refreshProfile,
    forceAuthRefresh,
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

// Legacy compatibility for existing components
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
  const { userProfile, loading, isAdmin } = useAuth();
  
  // Map new profile format to legacy format
  const legacyProfile: UserProfile_Legacy | null = userProfile ? {
    id: userProfile.person_id,
    email: userProfile.email,
    full_name: `${userProfile.first_name} ${userProfile.last_name}`,
    role: userProfile.account_type === 'hoa_admin' ? 'admin' : 'no_access',
    is_active: userProfile.account_status === 'verified',
    created_at: new Date().toISOString(),
    last_sign_in: null
  } : null;

  return { 
    profile: legacyProfile, 
    loading, 
    isAdmin 
  };
}