
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuctionsList from './AuctionsList';
import UserCreation from './UserCreation';
import TempPasswordManager from './TempPasswordManager';
import { BarChart3, Gavel, Users, Key } from 'lucide-react';

interface AdminTabsProps {
  auctions: any[];
}

const AdminTabs = ({ auctions }: AdminTabsProps) => {
  return (
    <Tabs defaultValue="auctions" className="space-y-6">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="auctions" className="flex items-center gap-2">
          <Gavel className="h-4 w-4" />
          Auctions
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          User Management
        </TabsTrigger>
        <TabsTrigger value="passwords" className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          Temp Passwords
        </TabsTrigger>
      </TabsList>

      <TabsContent value="auctions">
        <AuctionsList auctions={auctions} />
      </TabsContent>

      <TabsContent value="analytics">
        <Card>
          <CardHeader>
            <CardTitle>Analytics & Reports</CardTitle>
            <CardDescription>
              Detailed insights and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="users">
        <UserCreation />
      </TabsContent>

      <TabsContent value="passwords">
        <TempPasswordManager />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
