
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '@/types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin user
const ADMIN_USER: User = {
  id: 'admin-1',
  email: 'admin@auction.com',
  role: 'admin',
  name: 'System Administrator'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on app load
    const storedUser = localStorage.getItem('auction-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Check if admin login
      if (email === ADMIN_USER.email && password === 'admin123') {
        setUser(ADMIN_USER);
        localStorage.setItem('auction-user', JSON.stringify(ADMIN_USER));
        setIsLoading(false);
        return true;
      }
      
      // Check for bidder in localStorage
      const bidders = JSON.parse(localStorage.getItem('auction-bidders') || '[]');
      const foundBidder = bidders.find((b: User) => b.email === email);
      
      if (foundBidder && password === 'bidder123') {
        setUser(foundBidder);
        localStorage.setItem('auction-user', JSON.stringify(foundBidder));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const signUp = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Check if email already exists
      const existingBidders = JSON.parse(localStorage.getItem('auction-bidders') || '[]');
      const emailExists = existingBidders.some((b: User) => b.email === email) || email === ADMIN_USER.email;
      
      if (emailExists) {
        setIsLoading(false);
        return false;
      }
      
      // Create new bidder
      const newBidder: User = {
        id: `bidder-${Date.now()}`,
        email,
        role: 'bidder',
        name
      };
      
      // Save to localStorage
      const updatedBidders = [...existingBidders, newBidder];
      localStorage.setItem('auction-bidders', JSON.stringify(updatedBidders));
      
      // Auto-login the new user
      setUser(newBidder);
      localStorage.setItem('auction-user', JSON.stringify(newBidder));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auction-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout, isLoading }}>
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
