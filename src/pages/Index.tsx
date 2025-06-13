
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import AdminDashboard from '@/components/AdminDashboard';
import BidderDashboard from '@/components/BidderDashboard';
import PasswordResetForm from '@/components/PasswordResetForm';

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

  if (!user) {
    return <LoginForm />;
  }

  // Check if user needs to reset password
  if (user.passwordResetRequired) {
    return <PasswordResetForm />;
  }

  return user.role === 'admin' ? <AdminDashboard /> : <BidderDashboard />;
};

export default Index;
