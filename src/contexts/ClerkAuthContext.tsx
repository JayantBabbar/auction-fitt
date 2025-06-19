
import React, { createContext, useContext } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'bidder';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerkAuth();

  // Transform Clerk user to our User type
  const user: User | null = clerkUser ? {
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    name: clerkUser.fullName || clerkUser.firstName || 'User',
    // For now, we'll default to 'bidder'. You can add role logic later
    role: clerkUser.publicMetadata?.role as 'admin' | 'bidder' || 'bidder'
  } : null;

  return (
    <AuthContext.Provider value={{
      user,
      isLoading: !isLoaded,
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
