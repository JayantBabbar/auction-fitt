
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Gavel, 
  Users, 
  TrendingUp, 
  DollarSign,
  Activity
} from 'lucide-react';

interface AdminStatsProps {
  auctions?: any[];
}

const AdminStats = ({ auctions = [] }: AdminStatsProps) => {
  const activeAuctions = auctions.filter(a => a.status === 'active').length;
  const totalRevenue = auctions.reduce((sum, auction) => {
    return sum + (auction.current_bid || 0);
  }, 0);

  const stats = [
    {
      title: 'Active Auctions',
      value: activeAuctions,
      icon: Gavel,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Total Auctions',
      value: auctions.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+8.2%',
      changeType: 'positive'
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-auction-gold',
      bgColor: 'bg-yellow-50',
      change: '+23.1%',
      changeType: 'positive'
    },
    {
      title: 'Avg Bid Value',
      value: `₹${auctions.length > 0 ? Math.round(totalRevenue / auctions.length).toLocaleString() : '0'}`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+2.3%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="flex items-center gap-1 text-xs">
                <Activity className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-600 font-medium">{stat.change}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;
