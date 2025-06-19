
import React from 'react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { useAuth } from '@/contexts/ClerkAuthContext';
import LoginForm from '@/components/ClerkLoginForm';
import AdminDashboard from '@/components/AdminDashboard';
import BidderDashboard from '@/components/BidderDashboard';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <LoginForm />
      </SignedOut>
      <SignedIn>
        {user?.role === 'admin' ? <AdminDashboard /> : <BidderDashboard />}
      </SignedIn>
    </>
  );
};

export default Index;
