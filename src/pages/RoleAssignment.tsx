
import React from 'react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { useAuth } from '@/contexts/ClerkAuthContext';
import LoginForm from '@/components/ClerkLoginForm';
import AdminLogin from '@/components/AdminLogin';

const RoleAssignment = () => {
  const { isLoading } = useAuth();

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
        <AdminLogin />
      </SignedIn>
    </>
  );
};

export default RoleAssignment;
