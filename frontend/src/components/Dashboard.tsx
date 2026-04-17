import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, Target, Users, IndianRupee, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency, cn } from '@lib/utils';

export const Dashboard = ({ token }: { token: string | null }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchStats();
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Map backend stages to chart-friendly names
  const stageMap: Record<string, string> = {
    'DEFAULT': 'Overdue',
    'YET_TO_CALL': 'New',
    'MEETING_SCHEDULED': 'Interested',
    'MEETING_POSTPONED': 'Interested',
    'PROPOSAL_SHARED': 'Proposal',
    'PAYMENT_COMPLETED': 'Closed',
    'LOST': 'Lost',
    'DNP': 'DNP',
    'NOT_INTERESTED': 'Not Interested'
  };

  const groupedByLabel = stats.leadsByStage.reduce((acc: any, curr: any) => {
    const label = stageMap[curr.stage] || curr.stage;
    acc[label] = (acc[label] || 0) + curr.count;
    return acc;
  }, {});

  const STAGE_DATA = [
    { name: 'Overdue', value: stats.overdueCount || 0 },
    { name: 'New', value: groupedByLabel['New'] || 0 },
    { name: 'Interested', value: groupedByLabel['Interested'] || 0 },
    { name: 'Proposal', value: groupedByLabel['Proposal'] || 0 },
    { name: 'Closed', value: groupedByLabel['Closed'] || 0 },
    { name: 'Lost', value: groupedByLabel['Lost'] || 0 },
    { name: 'DNP', value: groupedByLabel['DNP'] || 0 },
    { name: 'Not Interested', value: groupedByLabel['Not Interested'] || 0 },
  ].filter(d => d.value > 0);

  const revenue = stats.totalRevenue || 0;
  const pipelineValue = stats.totalValue || 0;
  const conversionRate = stats.totalLeads ? ((groupedByLabel['Closed'] || 0) / stats.totalLeads * 100).toFixed(1) : 0;
  const activeLeadsCount = stats.totalLeads - (groupedByLabel['Closed'] || 0) - (groupedByLabel['Lost'] || 0) - (groupedByLabel['Not Interested'] || 0);

  const REVENUE_DATA = [
    { month: 'Oct', revenue: 400000 },
    { month: 'Nov', revenue: 600000 },
    { month: 'Dec', revenue: 800000 },
    { month: 'Jan', revenue: 1200000 },
    { month: 'Feb', revenue: 1700000 },
    { month: 'Mar', revenue: revenue || 2100000 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Info */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Intelligence Hub</h2>
        <p className="text-slate-500 font-medium">Real-time enterprise pipeline overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={IndianRupee} 
          label="Total Revenue" 
          value={formatCurrency(revenue)} 
          trend="+12.5%" 
          trendType="up" 
          color="brand"
        />
        <StatCard 
          icon={Target} 
          label="Conversion Rate" 
          value={`${conversionRate}%`} 
          trend="+4.2%" 
          trendType="up" 
          color="purple"
        />
        <StatCard 
          icon={Users} 
          label="Active Leads" 
          value={activeLeadsCount.toString()} 
          trend="-2.1%" 
          trendType="down" 
          color="blue"
        />
        <StatCard 
          icon={TrendingUp} 
          label="Pipeline Value" 
          value={formatCurrency(pipelineValue)} 
          trend="+18.7%" 
          trendType="up" 
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartPanel title="Leads by Stage">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={STAGE_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
              />
              <Bar dataKey="value" fill="#0e91e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel title="Revenue Growth">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#0e91e9" strokeWidth={3} dot={{ r: 4, fill: '#0e91e9', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, trend, trendType, color }: any) => (
  <div className="glass-card p-6 rounded-2xl border border-slate-200/50 relative overflow-hidden group hover:border-brand-500/30 transition-all">
    <div className="flex items-center justify-between mb-4 relative z-10">
      <div className={cn(
        "p-2.5 rounded-xl transition-colors",
        color === 'brand' ? "bg-brand-500/10 text-brand-500" :
        color === 'purple' ? "bg-purple-500/10 text-purple-500" :
        color === 'blue' ? "bg-blue-500/10 text-blue-500" :
        "bg-emerald-500/10 text-emerald-500"
      )}>
        <Icon size={20} />
      </div>
      <span className={cn(
        "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
        trendType === 'up' ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
      )}>
        {trendType === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        {trend}
      </span>
    </div>
    <h3 className="text-2xl font-bold text-slate-900 relative z-10">{value}</h3>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 relative z-10">{label}</p>
    
    {/* Decorative light effect */}
    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-500/5 rounded-full blur-3xl group-hover:bg-brand-500/10 transition-colors" />
  </div>
);

const ChartPanel = ({ title, children }: any) => (
  <div className="glass-card p-8 rounded-2xl border border-slate-200/50 shadow-sm">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(14,145,233,0.3)]" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Insight</span>
      </div>
    </div>
    <div className="h-80">
      {children}
    </div>
  </div>
);
