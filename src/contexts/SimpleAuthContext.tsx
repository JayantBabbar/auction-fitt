
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'bidder';
  password_reset_required: boolean;
}

interface AuthContextType {
  user: Profile | null;
  profile: Profile | null;
  session: any;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded users for testing
const TEST_USERS = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@fitt-iitd.in',
    password: 'admin123',
    role: 'admin' as const,
    password_reset_required: false
  },
  {
    id: '2',
    name: 'Abhishek',
    email: 'Abhishek@fitt-iitd.in',
    password: 'J5b|>)Vdn\\cj',
    role: 'bidder' as const,
    password_reset_required: false
  }
];

export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('simple_auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('SimpleAuth signIn called with:', { email, passwordLength: password.length });
    
    const foundUser = TEST_USERS.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const userProfile = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        password_reset_required: foundUser.password_reset_required
      };
      
      setUser(userProfile);
      localStorage.setItem('simple_auth_user', JSON.stringify(userProfile));
      console.log('Login successful:', userProfile);
      return { error: null };
    } else {
      console.log('Login failed: Invalid credentials');
      return { error: { message: 'Invalid login credentials' } };
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log('SimpleAuth signUp called - not implemented for bypass');
    return { error: { message: 'Sign up not available in bypass mode' } };
  };

  const signOut = async () => {
    console.log('SimpleAuth signOut called');
    setUser(null);
    localStorage.removeItem('simple_auth_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile: user,
      session: user ? { user } : null,
      isLoading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSimpleAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
};
