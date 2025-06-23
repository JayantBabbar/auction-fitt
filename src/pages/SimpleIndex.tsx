
import React from 'react';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import SimpleLoginForm from '@/components/SimpleLoginForm';
import AdminDashboard from '@/components/AdminDashboard';
import BidderDashboard from '@/components/BidderDashboard';

const SimpleIndex = () => {
  const { user, profile, isLoading } = useSimpleAuth();

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

  // Show login form if not authenticated
  if (!user || !profile) {
    return <SimpleLoginForm />;
  }

  // Show appropriate dashboard based on role
  return profile.role === 'admin' ? <AdminDashboard /> : <BidderDashboard />;
};

export default SimpleIndex;
