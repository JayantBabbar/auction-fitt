
import React from 'react';
import { Button } from '@/components/ui/button';
import { Gavel, LogOut } from 'lucide-react';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

interface BidderHeaderProps {
  userName?: string;
}

const BidderHeader = ({ userName }: BidderHeaderProps) => {
  const { signOut } = useSupabaseAuth();

  return (
    <header className="border-b bg-card/50 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary rounded-lg">
              <Gavel className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-semibold">Bidder Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {userName}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => signOut()} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default BidderHeader;
