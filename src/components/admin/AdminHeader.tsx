
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gavel, LogOut } from 'lucide-react';

interface AdminHeaderProps {
  userName: string;
  onSignOut: () => void;
}

const AdminHeader = ({ userName, onSignOut }: AdminHeaderProps) => {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-sm">
                <Gavel className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-semibold text-slate-900">Admin Portal</h1>
                <p className="text-sm text-slate-500">Welcome back, {userName}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onSignOut} className="border-slate-200 text-slate-600 hover:bg-slate-50">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
