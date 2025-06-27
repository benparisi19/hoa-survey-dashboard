'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'no_access' | 'admin';
  is_active: boolean;
  created_at: string;
  last_sign_in: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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

    // Listen for auth changes - but prevent redundant updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only respond to meaningful auth events
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          const newUser = session?.user ?? null;
          
          // Only update if user actually changed to prevent unnecessary re-renders
          setUser(currentUser => {
            if (currentUser?.id === newUser?.id) {
              return currentUser; // No change, keep current user object
            }
            return newUser;
          });
        }
        
        // Only set loading to false if we're currently loading
        setLoading(currentLoading => currentLoading ? false : currentLoading);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);


  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    signIn,
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

// Separate hook for user profile - cleaner separation of concerns
export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Don't refetch if we already have the profile for this user
    if (profile && profile.id === user.id) {
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          if (error.code === 'PGRST116' || error.message.includes('JWT')) {
            // Profile doesn't exist or auth issue - sign out
            await supabase.auth.signOut();
          }
          setProfile(null);
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Profile fetch error:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, supabase, profile]);

  const isAdmin = () => profile?.role === 'admin';

  return { profile, loading, isAdmin };
}