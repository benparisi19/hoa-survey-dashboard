'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<{ error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

export type UserProfile = {
  person_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  preferred_contact_method?: 'email' | 'phone' | 'text' | 'mail';
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
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    // Get initial user (more reliable than getSession)
    const getInitialUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setUser(session?.user ?? null);
        if (!session?.user) {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

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
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signInWithPassword,
    signUp,
    signOut,
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

// Separate hook for profile data - prevents auth/profile race conditions
export function useProfile() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch user profile and accessible properties
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
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
      setLoading(true);
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
      setLoading(false);
    }
  };

  const isAdmin = () => {
    return userProfile?.account_type === 'hoa_admin';
  };

  // Fetch profile when user changes
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchUserProfile(user.id).then((profile) => {
        setUserProfile(profile);
        setLoading(false);
      });
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, [user?.id]);

  return {
    userProfile,
    loading,
    refreshProfile,
    isAdmin,
    // Legacy compatibility
    profile: userProfile ? {
      id: userProfile.person_id,
      email: userProfile.email,
      full_name: `${userProfile.first_name} ${userProfile.last_name}`,
      role: userProfile.account_type === 'hoa_admin' ? 'admin' as const : 'no_access' as const,
      is_active: userProfile.account_status === 'verified',
      created_at: new Date().toISOString(),
      last_sign_in: null
    } : null
  };
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