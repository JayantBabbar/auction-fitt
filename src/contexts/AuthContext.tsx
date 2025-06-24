
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'bidder';
  password_reset_required: boolean;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    console.log('Fetching profile for user:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    console.log('Profile fetched:', data);
    return data;
  };

  useEffect(() => {
    let mounted = true;

    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && mounted) {
          try {
            const profileData = await fetchProfile(session.user.id);
            if (mounted) {
              setProfile(profileData);
            }
          } catch (error) {
            console.error('Profile fetch error:', error);
            if (mounted) setProfile(null);
          }
        } else if (mounted) {
          setProfile(null);
        }
        
        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session check error:', error);
        } else {
          console.log('Initial session check:', existingSession?.user?.email || 'No session');
        }
        
        if (!existingSession && mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for email:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    
    console.log('Sign in result:', { error });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log('Attempting sign up for email:', email);
    
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name
        }
      }
    });
    
    console.log('Sign up result:', { error });
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out...');
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      isLoading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
