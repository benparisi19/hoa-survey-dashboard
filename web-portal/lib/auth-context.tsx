'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

interface UserProfile {
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
  profile: UserProfile | null;
  loading: boolean;
  hydrated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Handle hydration first
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return; // Wait for hydration
    
    let isMounted = true; // Prevent state updates if component unmounts
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('Initial session check (post-hydration):', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          email: session?.user?.email,
          error: error?.message
        });
        
        if (!isMounted) return; // Component was unmounted
        
        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('Fetching profile for user:', session.user.id);
          try {
            await fetchUserProfile(session.user.id);
          } catch (profileError) {
            console.error('Profile fetch failed during initialization:', profileError);
            // If profile fetch fails, still set loading to false
            setProfile(null);
          }
        } else {
          console.log('No user in session, setting profile to null');
          setProfile(null);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return; // Component was unmounted
        
        console.log('Auth state change:', event, session?.user?.email || 'no user');
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            await fetchUserProfile(session.user.id);
          } catch (profileError) {
            console.error('Profile fetch failed during auth state change:', profileError);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [hydrated, supabase.auth]);

  const fetchUserProfile = async (userId: string, force = false) => {
    // Prevent duplicate profile fetches unless forced
    if (!force && fetchingProfile) {
      console.log('Profile fetch already in progress, skipping:', userId);
      return;
    }
    
    // Don't fetch if we already have the profile for this user unless forced
    if (!force && profile && profile.id === userId) {
      console.log('Profile already exists for user, skipping fetch:', userId);
      return;
    }
    
    setFetchingProfile(true);
    
    try {
      console.log('Fetching profile for user ID:', userId);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000); // 10 second timeout
      });
      
      const fetchPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching user profile:', {
          error: error.message,
          code: error.code,
          userId
        });
        
        // If we can't fetch the profile, the user might not have access
        // or there might be an auth issue - sign them out
        if (error.code === 'PGRST116' || error.message.includes('JWT') || error.message.includes('permission')) {
          console.log('Profile fetch failed due to auth/permission issue, signing out user');
          await supabase.auth.signOut();
        }
        setProfile(null);
        setFetchingProfile(false);
        return;
      }
      
      console.log('Profile fetched successfully:', {
        userId: data.id,
        email: data.email,
        role: data.role
      });
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Handle timeout errors specifically
      if (error instanceof Error && error.message === 'Profile fetch timeout') {
        console.log('Profile fetch timed out, clearing auth state');
        await supabase.auth.signOut();
      }
      
      setProfile(null);
    } finally {
      setFetchingProfile(false);
    }
  };

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

  const refreshAuth = async () => {
    console.log('Starting auth refresh - clearing all state first');
    
    // Reset all state first
    setLoading(true);
    setUser(null);
    setProfile(null);
    setFetchingProfile(false);
    
    try {
      // Force a fresh session check
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      console.log('Refresh session result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        error: error?.message
      });
      
      if (error || !session) {
        console.log('No valid session after refresh, signing out');
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setUser(session.user);
      
      // Force fresh profile fetch
      console.log('Forcing fresh profile fetch after auth refresh');
      await fetchUserProfile(session.user.id, true);
    } catch (error) {
      console.error('Error refreshing auth:', error);
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  };

  const isAdmin = () => {
    return profile?.role === 'admin';
  };

  const value = {
    user,
    profile,
    loading: loading || !hydrated, // Still loading if not hydrated
    hydrated,
    signIn,
    signOut,
    refreshAuth,
    isAdmin,
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