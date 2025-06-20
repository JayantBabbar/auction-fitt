
import React from 'react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import SupabaseLoginForm from '@/components/SupabaseLoginForm';
import AdminDashboard from '@/components/AdminDashboard';
import BidderDashboard from '@/components/BidderDashboard';

const Index = () => {
  const { user, profile, isLoading } = useSupabaseAuth();

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
    return <SupabaseLoginForm />;
  }

  // Show appropriate dashboard based on role
  return profile.role === 'admin' ? <AdminDashboard /> : <BidderDashboard />;
};

export default Index;
