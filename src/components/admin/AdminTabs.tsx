
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp } from 'lucide-react';
import AuctionsList from './AuctionsList';

interface AdminTabsProps {
  auctions?: any[];
}

const AdminTabs = ({ auctions }: AdminTabsProps) => {
  return (
    <Tabs defaultValue="auctions" className="space-y-6">
      <div className="flex items-center justify-between">
        <TabsList className="grid grid-cols-3 lg:w-[400px] bg-white border border-slate-200">
          <TabsTrigger value="auctions" className="data-[state=active]:bg-slate-100">Auctions</TabsTrigger>
          <TabsTrigger value="bidders" className="data-[state=active]:bg-slate-100">Bidders</TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-slate-100">Reports</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="auctions" className="space-y-6">
        <AuctionsList auctions={auctions} />
      </TabsContent>

      <TabsContent value="bidders" className="space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-slate-900">Bidder Management</h2>
          <p className="text-slate-600 mt-1">Monitor and manage bidder activities</p>
        </div>
        <Card className="border-slate-200/60 bg-white/70">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Bidder management features coming soon...</p>
            <p className="text-sm text-slate-400 mt-1">Advanced user analytics and management tools</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reports" className="space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-slate-900">Analytics & Reports</h2>
          <p className="text-slate-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <Card className="border-slate-200/60 bg-white/70">
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Advanced reporting features coming soon...</p>
            <p className="text-sm text-slate-400 mt-1">Real-time analytics and detailed performance reports</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
