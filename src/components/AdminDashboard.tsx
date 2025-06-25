
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useAuctions } from '@/hooks/useAuctions';
import { Button } from '@/components/ui/button';
import AdminHeader from './admin/AdminHeader';
import AdminStats from './admin/AdminStats';
import AdminTabs from './admin/AdminTabs';
import { Loader2, AlertCircle, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const { profile, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const { data: auctions = [], isLoading, error } = useAuctions();

  // Add debugging logs
  console.log('AdminDashboard - Current profile:', profile);
  console.log('AdminDashboard - User role:', profile?.role);
  console.log('AdminDashboard - Auctions data:', auctions);

  // Check if user has admin role
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-amber-600 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">
            You need admin privileges to access this dashboard.
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Current role: {profile?.role || 'No role assigned'}
          </p>
          <Button onClick={() => navigate('/admin-setup')}>
            Set Up Admin Role
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading auctions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Auctions</h2>
          <p className="text-slate-600 mb-4">
            There was an error loading the auction data.
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      <AdminHeader userName={profile?.name || 'Admin'} onSignOut={signOut} />
      
      <div className="container mx-auto px-6 py-8">
        {/* Create Auction Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">Dashboard Overview</h1>
            <p className="text-slate-600 mt-1">Manage your auctions and monitor performance</p>
          </div>
          <Button 
            onClick={() => navigate('/create-auction')}
            className="bg-primary hover:bg-primary/90 shadow-lg"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Auction
          </Button>
        </div>

        <AdminStats auctions={auctions} />
        <AdminTabs auctions={auctions} />
      </div>
    </div>
  );
};

export default AdminDashboard;
