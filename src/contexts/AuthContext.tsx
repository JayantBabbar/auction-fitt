
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType } from '@/types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    console.log('🔧 AuthProvider: Setting up auth state listener');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'No user');
        setSession(session);
        
        if (session?.user && mounted) {
          try {
            console.log('👤 Fetching user profile for:', session.user.email);
            
            // Fetch user profile from profiles table
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.error('❌ Error fetching profile:', error);
              console.log('🔍 Profile query details:', {
                userId: session.user.id,
                userEmail: session.user.email
              });
              if (mounted) setUser(null);
            } else if (profile && mounted) {
              console.log('✅ Profile loaded:', profile);
              setUser({
                id: profile.id,
                email: profile.email,
                role: profile.role as 'admin' | 'bidder',
                name: profile.name,
                passwordResetRequired: profile.password_reset_required || false
              });
            }
          } catch (error) {
            console.error('🔥 Profile fetch exception:', error);
            if (mounted) setUser(null);
          }
        } else if (mounted) {
          console.log('🚪 No session, clearing user');
          setUser(null);
        }
        
        if (mounted) {
          console.log('⏱️ Setting loading to false');
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('🔍 Checking for existing session...');
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Session check error:', error);
        } else {
          console.log('📋 Initial session result:', existingSession?.user?.email || 'No existing session');
        }
        
        if (!existingSession && mounted) {
          console.log('⚡ No existing session, setting loading to false immediately');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('🔥 Auth initialization exception:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      console.log('🧹 AuthProvider: Cleaning up');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Login attempt for:', email);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error('❌ Login error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          details: error
        });
        
        setIsLoading(false);
        return false;
      }

      console.log('✅ Login successful for:', data.user?.email);
      return true;
    } catch (error) {
      console.error('🔥 Login exception:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    console.log('👋 Logging out...');
    
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
