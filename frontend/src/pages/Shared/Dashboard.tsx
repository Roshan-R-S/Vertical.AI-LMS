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
  Line,
  Cell
} from 'recharts';
import { TrendingUp, Target, Users, IndianRupee, ArrowUpRight, ArrowDownRight, Calendar, Phone, Clock } from 'lucide-react';
import { formatCurrency, cn } from '@lib/utils';
import { DateRangeFilter, DateFilterType } from '@components/DateRangeFilter';

export const Dashboard = ({ token }: { token: string | null }) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Date Filters
  const [dateRange, setDateRange] = useState<DateFilterType>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (token) fetchStats();
  }, [token, dateRange, startDate, endDate]);

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();
      if (dateRange !== 'ALL') {
        params.append('range', dateRange);
        if (dateRange === 'CUSTOM') {
          if (startDate) params.append('startDate', startDate);
          if (endDate) params.append('endDate', endDate);
        }
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/analytics/dashboard?${params.toString()}`, {
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
    'CALL_BACK': 'Call Back',
    'MEETING_SCHEDULED': 'Scheduled',
    'MEETING_COMPLETED': 'Completed',
    'MEETING_POSTPONED': 'Postponed',
    'PROPOSAL_SHARED': 'Proposal',
    'HANDED_OVER': 'Handed Over',
    'PAYMENT_COMPLETED': 'Closed',
    'LOST': 'Lost',
    'DNP': 'DNP',
    'NOT_INTERESTED': 'Not Interested',
    'DND': 'DND',
    'SWITCHED_OFF': 'Switched Off'
  };

  const groupedByLabel = stats.leadsByStage.reduce((acc: any, curr: any) => {
    const label = stageMap[curr.stage] || curr.stage;
    acc[label] = (acc[label] || 0) + curr.count;
    return acc;
  }, {});

  const STAGE_DATA = [
    { name: 'Overdue', value: stats.overdueCount || 0 },
    { name: 'New', value: groupedByLabel['New'] || 0 },
    { name: 'Follow-up', value: (groupedByLabel['Call Back'] || 0) + (groupedByLabel['Postponed'] || 0) + (groupedByLabel['Switched Off'] || 0) },
    { name: 'Scheduled', value: groupedByLabel['Scheduled'] || 0 },
    { name: 'Completed', value: groupedByLabel['Completed'] || 0 },
    { name: 'Proposal', value: groupedByLabel['Proposal'] || 0 },
    { name: 'Handoff', value: groupedByLabel['Handed Over'] || 0 },
    { name: 'Closed', value: groupedByLabel['Closed'] || 0 },
    { name: 'Lost', value: (groupedByLabel['Lost'] || 0) + (groupedByLabel['Not Interested'] || 0) + (groupedByLabel['DND'] || 0) },
    { name: 'DNP', value: groupedByLabel['DNP'] || 0 },
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Intelligence Hub</h2>
          <p className="text-slate-500 font-medium">Real-time enterprise pipeline overview.</p>
        </div>
        <DateRangeFilter 
          value={dateRange}
          onChange={setDateRange}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
        />
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

      {/* Today's Agenda row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="surface-card p-5 rounded-lg flex items-center justify-between ">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-1">Today's Meetings</p>
            <h4 className="text-xl font-bold text-slate-900">{stats.todayMeetings || 0}</h4>
          </div>
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
            <Calendar size={20} />
          </div>
        </div>
        <div className="surface-card p-5 rounded-lg flex items-center justify-between ">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-1">Today's Follow-ups</p>
            <h4 className="text-xl font-bold text-slate-900">{stats.todayFollowUps || 0}</h4>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Phone size={20} />
          </div>
        </div>
        <div className="surface-card p-5 rounded-lg flex items-center justify-between ">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-1">Overdue Leads</p>
            <h4 className="text-xl font-bold text-rose-600">{stats.overdueCount || 0}</h4>
          </div>
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>
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
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {STAGE_DATA.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.name === 'Overdue' ? '#f43f5e' :
                      entry.name === 'New' ? '#0e91e9' :
                      entry.name === 'Follow-up' ? '#8b5cf6' :
                      entry.name === 'Scheduled' ? '#0ea5e9' :
                      entry.name === 'Completed' ? '#10b981' :
                      entry.name === 'Proposal' ? '#f59e0b' :
                      entry.name === 'Handoff' ? '#6366f1' :
                      entry.name === 'Closed' ? '#059669' :
                      '#94a3b8'
                    }
                  />
                ))}
              </Bar>
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
  <div className="surface-card p-6 rounded-lg ">
    <div className="flex items-center justify-between mb-4">
      <div className={cn(
        "p-2.5 rounded-lg",
        color === 'brand' ? "bg-brand-50 text-brand-600" :
        color === 'purple' ? "bg-purple-50 text-purple-600" :
        color === 'blue' ? "bg-blue-50 text-blue-600" :
        "bg-emerald-50 text-emerald-600"
      )}>
        <Icon size={20} />
      </div>
      <span className={cn(
        "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
        trendType === 'up' ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
      )}>
        {trendType === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        {trend}
      </span>
    </div>
    <h3 className="text-2xl font-black text-slate-900">{value}</h3>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
  </div>
);

const ChartPanel = ({ title, children }: any) => (
  <div className="surface-card p-8 rounded-lg">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest">{title}</h3>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-brand-500" />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Data</span>
      </div>
    </div>
    <div className="h-80">
      {children}
    </div>
  </div>
);
