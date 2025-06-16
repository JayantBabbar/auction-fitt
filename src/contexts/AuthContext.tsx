
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user && mounted) {
          try {
            // Fetch user profile from profiles table
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.error('Error fetching profile:', error);
              // Log security event for failed profile fetch
              await supabase.rpc('log_security_event', {
                p_user_id: session.user.id,
                p_action: 'profile_fetch_failed',
                p_resource_type: 'profile',
                p_success: false,
                p_error_message: error.message
              });
              setUser(null);
            } else if (profile && mounted) {
              setUser({
                id: profile.id,
                email: profile.email,
                role: profile.role as 'admin' | 'bidder',
                name: profile.name,
                passwordResetRequired: profile.password_reset_required || false
              });

              // Log successful login
              await supabase.rpc('log_security_event', {
                p_user_id: profile.id,
                p_action: 'user_login',
                p_resource_type: 'auth',
                p_success: true
              });
            }
          } catch (error) {
            console.error('Auth context error:', error);
            if (mounted) {
              setUser(null);
            }
          }
        } else if (mounted) {
          setUser(null);
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error('Login error:', error.message);
        
        // Log failed login attempt
        await supabase.rpc('log_security_event', {
          p_user_id: null,
          p_action: 'login_failed',
          p_resource_type: 'auth',
          p_success: false,
          p_error_message: `Failed login for email: ${email}`
        });
        
        setIsLoading(false);
        return false;
      }

      console.log('Login successful:', data.user?.email);
      return true;
    } catch (error) {
      console.error('Login exception:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    console.log('Logging out...');
    
    // Log logout event
    if (user) {
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_action: 'user_logout',
        p_resource_type: 'auth',
        p_success: true
      });
    }
    
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
