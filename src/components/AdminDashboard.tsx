
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { Button } from '@/components/ui/button';
import AdminHeader from './admin/AdminHeader';
import AdminStats from './admin/AdminStats';
import AdminTabs from './admin/AdminTabs';
import { Loader2, AlertCircle, Plus } from 'lucide-react';

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Add debugging logs
  console.log('AdminDashboard - Current user:', user);
  console.log('AdminDashboard - User role:', user?.role);

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

  // Mock auction data for demo purposes since we're not using Supabase
  const mockAuctions = [
    {
      id: '1',
      title: 'Sample Auction 1',
      status: 'active',
      current_bid: 1500,
      starting_bid: 1000,
      end_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'Sample Auction 2',
      status: 'completed',
      current_bid: 2500,
      starting_bid: 2000,
      end_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      title: 'Sample Auction 3',
      status: 'active',
      current_bid: 750,
      starting_bid: 500,
      end_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/30">
      <AdminHeader userName={user?.name || 'Admin'} onSignOut={signOut} />
      
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

        <AdminStats auctions={mockAuctions} />
        <AdminTabs auctions={mockAuctions} />
      </div>
    </div>
  );
};

export default AdminDashboard;
