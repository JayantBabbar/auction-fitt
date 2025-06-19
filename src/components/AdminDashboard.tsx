
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { useAuctions } from '@/hooks/useAuctions';
import { Button } from '@/components/ui/button';
import AdminHeader from './admin/AdminHeader';
import AdminStats from './admin/AdminStats';
import AdminTabs from './admin/AdminTabs';
import { Loader2, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: auctions, isLoading, error } = useAuctions();

  // Add debugging logs
  console.log('AdminDashboard - Current user:', user);
  console.log('AdminDashboard - User role:', user?.role);
  console.log('AdminDashboard - Auctions loading:', isLoading);
  console.log('AdminDashboard - Auctions error:', error);
  console.log('AdminDashboard - Auctions data:', auctions);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Dashboard error details:', error);
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading dashboard</h2>
          <p className="text-slate-600 mb-4">
            {error?.message || 'An unexpected error occurred'}
          </p>
          <div className="space-y-2">
            <Button onClick={() => window.location.reload()} variant="outline">
              Refresh Page
            </Button>
            <Button onClick={() => navigate('/admin-setup')} variant="secondary">
              Go to Role Setup
            </Button>
          </div>
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-slate-500">Error Details</summary>
            <pre className="mt-2 text-xs bg-slate-100 p-2 rounded overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  // Check if user has admin role
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50/30 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-amber-600 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">
            You need admin privileges to access this dashboard.
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Current role: {user?.role || 'No role assigned'}
          </p>
          <Button onClick={() => navigate('/admin-setup')}>
            Set Up Admin Role
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      <AdminHeader userName={user?.name || 'Admin'} onSignOut={signOut} />
      
      <div className="container mx-auto px-6 py-8">
        <AdminStats auctions={auctions} />
        <AdminTabs auctions={auctions} />
      </div>
    </div>
  );
};

export default AdminDashboard;
