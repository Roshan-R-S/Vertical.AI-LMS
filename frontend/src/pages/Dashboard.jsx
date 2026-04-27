import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContextCore';
import {
  TrendingUp, Activity, Users, Target, Clock, AlertTriangle,
  Zap, PieChart as PieChartIcon, DollarSign, BarChart2,
  PhoneCall, Filter, Calendar, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
const CYCLE_STAGE_LABELS = [
  'New -> First Contact',
  'Contact -> Qualify',
  'Qualify -> Demo',
  'Demo -> Proposal',
  'Proposal -> Close',
];

const EMPTY_DASHBOARD = {
  kpis: {
    totalRevenue: 0,
    closedRevenue: 0,
    totalPipelineValue: 0,
    weightedExpected: 0,
    totalLeads: 0,
    activeLeads: 0,
    wonDeals: 0,
    lostDeals: 0,
    staleLeads: 0,
    activePipeline: 0,
    pendingTasks: 0,
    overdueFollowUps: 0,
    avgDealSize: 0,
    highValueProspects: 0,
  },
  trends: {
    totalRevenuePct: 0,
    closedRevenuePct: 0,
    pipelinePct: 0,
    weightedExpectedPct: 0,
    callsPct: 0,
    avgDealSizePct: 0,
    momentumPct: 0,
  },
  conversionActivity: {
    leadToQualifiedPct: 0,
    demoToProposalPct: 0,
    totalCalls: 0,
    meetingsBooked: 0,
    avgDealSize: 0,
  },
  teamExecution: {
    winRatePct: 0,
    priorityCoveragePct: 0,
    staleLeadCount: 0,
    momentumScorePct: 0,
  },
  funnelData: [],
  sourceData: [],
  sourceInsight: {
    topSource: null,
    text: 'No source data is available for the selected filters.',
  },
  monthlyTrend: [],
  cycleData: CYCLE_STAGE_LABELS.map((stage) => ({ stage, days: 0 })),
  cycleSummary: {
    avgTimeToCloseDays: 0,
  },
};

const PERIOD_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this-week' },
  { label: 'This Month', value: 'this-month' },
  { label: 'This Quarter', value: 'current-quarter' },
  { label: 'YTD', value: 'current-year' },
  { label: 'All Time', value: 'all-time' },
  { label: 'Custom', value: 'custom' },
];

function formatLakhs(value) {
  return `₹${((value || 0) / 100000).toFixed(1)} L`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-IN');
}

function MetricCard({ title, value, sub, icon: Icon, color, trend, loading }) {
  return (
    <div className="studio-card" style={{ padding: '20px 24px', position: 'relative', overflow: 'hidden', minHeight: 138 }}>
      <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05, transform: 'scale(2)' }}>
        <Icon size={100} color={color} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</div>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 300, marginBottom: 8, color: 'var(--text-primary)' }}>
        {loading ? 'Loading...' : value}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
        {!loading && trend !== undefined && (
          <span style={{ color: trend >= 0 ? '#10b981' : '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
            {trend >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {Math.abs(trend)}%
          </span>
        )}
        <span style={{ color: 'var(--text-muted)' }}>{sub}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { leads, users, currentUser, fetchDashboard } = useApp();
  const [dateRange, setDateRange] = useState('this-month');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [filterTeam, setFilterTeam] = useState('All');
  const [filterBDE, setFilterBDE] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  const data = dashboardData || EMPTY_DASHBOARD;
  const { 
    kpis = EMPTY_DASHBOARD.kpis, 
    trends = EMPTY_DASHBOARD.trends, 
    conversionActivity = EMPTY_DASHBOARD.conversionActivity, 
    teamExecution = EMPTY_DASHBOARD.teamExecution 
  } = data;

  const isAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'SUPER_ADMIN';
  const isTL = currentUser?.role === 'Team Lead' || currentUser?.role === 'TEAM_LEAD';
  const isBDE = currentUser?.role === 'BDE';

  const teamOptions = useMemo(() => {
    const teams = new Map();
    users.forEach((user) => {
      if (user.teamId && user.team) teams.set(user.teamId, user.team);
    });
    return Array.from(teams, ([id, name]) => ({ id, name }));
  }, [users]);

  const bdeOptions = useMemo(() => {
    return users.filter((user) => {
      const isBdeUser = user.role === 'BDE';
      const matchesTeam = filterTeam === 'All' || user.teamId === filterTeam;
      return isBdeUser && matchesTeam;
    });
  }, [users, filterTeam]);

  const sourceOptions = useMemo(() => {
    return [...new Set(leads.map((lead) => lead.source).filter(Boolean))];
  }, [leads]);

  useEffect(() => {
    if (dateRange === 'custom' && (!customDates.start || !customDates.end)) return;

    let isActive = true;

    const loadData = async () => {
      setDashboardLoading(true);
      setDashboardError('');

      try {
        const res = await fetchDashboard({
          period: dateRange,
          from: dateRange === 'custom' ? customDates.start : undefined,
          to: dateRange === 'custom' ? customDates.end : undefined,
          teamId: filterTeam,
          bdeId: filterBDE,
          source: filterSource,
        });

        if (!isActive) return;

        if (res) {
          setDashboardData(res);
        } else {
          setDashboardData(EMPTY_DASHBOARD);
          setDashboardError('Dashboard analytics could not be loaded.');
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        if (isActive) {
          setDashboardData(EMPTY_DASHBOARD);
          setDashboardError('An error occurred while fetching dashboard data.');
        }
      } finally {
        if (isActive) setDashboardLoading(false);
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [dateRange, customDates.start, customDates.end, filterTeam, filterBDE, filterSource, fetchDashboard]);

  const hasFunnelData = data.funnelData.length > 0;
  const hasSourceData = data.sourceData.length > 0;
  const hasTrendData = data.monthlyTrend.length > 0;
  const cycleData = useMemo(() => {
    const valuesByStage = new Map((data.cycleData || []).map((cycle) => [cycle.stage, cycle]));
    return CYCLE_STAGE_LABELS.map((stage) => ({
      stage,
      days: Number(valuesByStage.get(stage)?.days || 0),
    }));
  }, [data.cycleData]);
  const hasCycleData = cycleData.length > 0;
  const maxCycleDays = Math.max(...cycleData.map((cycle) => cycle.days), 1);

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-subtitle">EXECUTIVE DASHBOARD</div>
          <h1 className="page-title">Intelligence & Analytics</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 0, borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
            <div style={{ padding: '0 12px', borderRight: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', background: 'var(--bg-card)' }}>
              <Calendar size={14} color="var(--text-muted)" />
            </div>
            <select className="form-select" style={{ border: 'none', background: 'transparent', outline: 'none', minWidth: 120, fontSize: 13 }} value={dateRange} onChange={e => setDateRange(e.target.value)}>
              {PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          {dateRange === 'custom' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-card)', padding: '4px 12px', borderRadius: 10, border: '1px solid var(--border-default)' }}>
              <input type="date" className="form-input" style={{ width: 130, height: 32, fontSize: 12, padding: 4 }} value={customDates.start} onChange={e => setCustomDates(p => ({ ...p, start: e.target.value }))} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>to</span>
              <input type="date" className="form-input" style={{ width: 130, height: 32, fontSize: 12, padding: 4 }} value={customDates.end} onChange={e => setCustomDates(p => ({ ...p, end: e.target.value }))} />
            </div>
          )}

          <select className="form-select" style={{ width: 140, background: 'var(--bg-surface)' }} value={filterTeam} onChange={e => { setFilterTeam(e.target.value); setFilterBDE('All'); }} disabled={!isAdmin}>
            <option value="All">All Teams</option>
            {teamOptions.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
          <select className="form-select" style={{ width: 140, background: 'var(--bg-surface)' }} value={filterBDE} onChange={e => setFilterBDE(e.target.value)} disabled={isBDE}>
            <option value="All">All BDEs</option>
            {bdeOptions.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
          <select className="form-select" style={{ width: 140, background: 'var(--bg-surface)' }} value={filterSource} onChange={e => setFilterSource(e.target.value)}>
            <option value="All">All Sources</option>
            {sourceOptions.map((source) => <option key={source} value={source}>{source}</option>)}
          </select>
        </div>
      </div>

      {dashboardError && (
        <div className="studio-card" style={{ marginBottom: 20, padding: 14, borderColor: 'rgba(239,68,68,0.35)', color: '#ef4444' }}>
          {dashboardError}
        </div>
      )}

      <div style={{ background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 16, padding: '20px 24px', marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
          <Zap size={18} color="#8b5cf6" className="animate-pulse" />
          <span style={{ fontWeight: 700, fontSize: 14, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vertical AI Intelligence Engine</span>
        </div>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 0 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>High Probability Momentum</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>You have <b>{kpis.wonDeals}</b> deals won this period. Weighted pipeline of {formatLakhs(kpis.weightedExpected)} shows growth potential.</div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#f59e0b' }}>Deals At Risk</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}><b>{kpis.staleLeads}</b> active deals have gone stale with no activity in &gt;48 hours.</div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#10b981' }}>Optimization Suggestion</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{data.sourceInsight?.text || 'No insights available.'}</div>
          </div>
        </div>
      </div>

      {(isAdmin || isTL) && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, borderLeft: '3px solid var(--brand-primary)', paddingLeft: 12 }}>TEAM EXECUTION (LEADING INDICATORS)</h3>
          <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div className="studio-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>WIN RATE</div>
              <div style={{ fontSize: 24, fontWeight: 300, color: '#10b981' }}>{teamExecution.winRatePct}%</div>
              <div style={{ marginTop: 8, height: 4, background: 'var(--bg-surface)', borderRadius: 2 }}>
                <div style={{ width: `${Math.min(teamExecution.winRatePct, 100)}%`, height: '100%', background: '#10b981', borderRadius: 2 }} />
              </div>
            </div>
            <div className="studio-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>PRIORITY COVERAGE</div>
              <div style={{ fontSize: 24, fontWeight: 300, color: '#6366f1' }}>{teamExecution.priorityCoveragePct}%</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Across selected leads</div>
            </div>
            <div className="studio-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>STALE LEAD COUNT</div>
              <div style={{ fontSize: 24, fontWeight: 300, color: '#ef4444' }}>{teamExecution.staleLeadCount}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Leads &gt; 48h inactive</div>
            </div>
            <div className="studio-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>MOMENTUM SCORE</div>
              <div style={{ fontSize: 24, fontWeight: 300, color: '#f59e0b' }}>{teamExecution.momentumScorePct >= 0 ? '+' : ''}{teamExecution.momentumScorePct}%</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Trend vs previous period</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, borderLeft: '3px solid #6366f1', paddingLeft: 12 }}>Revenue & Pipeline</h3>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <MetricCard title="Total Revenue" value={formatLakhs(kpis.totalRevenue)} sub="Won deals value" icon={DollarSign} color="#10b981" trend={trends.totalRevenuePct} loading={dashboardLoading} />
          <MetricCard title="Closed Revenue" value={formatLakhs(kpis.closedRevenue)} sub={`${kpis.wonDeals} deals won`} icon={Target} color="#10b981" trend={trends.closedRevenuePct} loading={dashboardLoading} />
          <MetricCard title="Total Pipeline" value={formatLakhs(kpis.totalPipelineValue)} sub="Active deals" icon={BarChart2} color="#6366f1" trend={trends.pipelinePct} loading={dashboardLoading} />
          <MetricCard title="Weighted Expected" value={formatLakhs(kpis.weightedExpected)} sub="Probability adjusted" icon={Activity} color="#8b5cf6" trend={trends.weightedExpectedPct} loading={dashboardLoading} />
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, borderLeft: '3px solid #06b6d4', paddingLeft: 12 }}>Conversion & Activity Productivity</h3>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          <MetricCard title="Lead -> Qual %" value={`${conversionActivity.leadToQualifiedPct}%`} sub="Selected period" icon={Filter} color="#06b6d4" loading={dashboardLoading} />
          <MetricCard title="Demo -> Prop %" value={`${conversionActivity.demoToProposalPct}%`} sub="Selected period" icon={PieChartIcon} color="#f59e0b" loading={dashboardLoading} />
          <MetricCard title="Total Calls" value={formatNumber(conversionActivity.totalCalls)} sub="Across selected BDEs" icon={PhoneCall} color="#6366f1" trend={trends.callsPct} loading={dashboardLoading} />
          <MetricCard title="Meetings Booked" value={formatNumber(conversionActivity.meetingsBooked)} sub="Meeting interactions" icon={Users} color="#8b5cf6" loading={dashboardLoading} />
          <MetricCard title="Avg Deal Size" value={formatLakhs(conversionActivity.avgDealSize)} sub="Closed deals" icon={TrendingUp} color="#10b981" trend={trends.avgDealSizePct} loading={dashboardLoading} />
        </div>
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><Filter size={18} color="#6366f1" /> Sales Funnel & Pipeline Health</h3>
          <div style={{ height: 260, width: '100%' }}>
            {hasFunnelData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={data.funnelData} margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: 'var(--text-secondary)' }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {data.funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No funnel data available</div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16 }}>
            <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Top Source</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#6366f1' }}>{data.sourceInsight?.topSource || 'N/A'}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pipeline Health</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#06b6d4' }}>{kpis.staleLeads < 5 ? 'Good' : 'At Risk'}</div>
            </div>
            <div style={{ padding: 12, background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Conversion</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#10b981' }}>{teamExecution.winRatePct}%</div>
            </div>
          </div>
        </div>

        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><PieChartIcon size={18} color="#f59e0b" /> Lead Source ROI</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Distribution and conversion of selected lead sources</p>
          <div style={{ height: 220, width: '100%' }}>
            {hasSourceData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.sourceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {data.sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} />
                  <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No source data available</div>
            )}
          </div>
          <div style={{ fontSize: 12, background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '10px 14px', borderRadius: 8, marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={14} /> {data.sourceInsight?.text || 'Analyzing data sources...'}
          </div>
        </div>
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="studio-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={18} color="#8b5cf6" /> Revenue & Pipeline Trends</h3>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Values in Lakhs (₹)</div>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            {hasTrendData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPipe" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: 'var(--text-muted)' }} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                  <Area type="monotone" name="Pipeline Growth" dataKey="pipeline" stroke="#6366f1" fillOpacity={1} fill="url(#colorPipe)" />
                  <Area type="monotone" name="Realized Revenue" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No trend data available</div>
            )}
          </div>
        </div>

        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} color="#06b6d4" /> Cycle Velocity</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Average days spent in stage</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {hasCycleData ? cycleData.map((cycle, index) => (
              <div key={`${cycle.stage}-${index}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{cycle.stage}</span>
                  <span style={{ fontWeight: 600 }}>{cycle.days} days</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-surface)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min((cycle.days / maxCycleDays) * 100, 100)}%`, background: cycle.days > 5 ? '#f59e0b' : '#06b6d4', borderRadius: 3 }}></div>
                </div>
              </div>
            )) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No cycle data available</div>
            )}
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Avg Time to Close:</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{data.cycleSummary?.avgTimeToCloseDays || 0} Days</span>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, borderLeft: '3px solid #ef4444', paddingLeft: 12 }}>Risk & Interventions</h3>
      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="studio-card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 4 }}>Stale Leads</div>
              <div style={{ fontSize: 24, fontWeight: 300 }}>{kpis.staleLeads}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>No activity in &gt; 48 hours</div>
            </div>
            <AlertTriangle size={24} color="#ef4444" opacity={0.5} />
          </div>
        </div>

        <div className="studio-card" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b', marginBottom: 4 }}>Active Pipeline</div>
              <div style={{ fontSize: 24, fontWeight: 300 }}>{kpis.activePipeline}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Selected active leads</div>
            </div>
            <Clock size={24} color="#f59e0b" opacity={0.5} />
          </div>
        </div>

        <div className="studio-card" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#6366f1', marginBottom: 4 }}>Pending Tasks</div>
              <div style={{ fontSize: 24, fontWeight: 300 }}>{kpis.pendingTasks}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>Unresolved follow-ups</div>
            </div>
            <Users size={24} color="#6366f1" opacity={0.5} />
          </div>
        </div>
      </div>
    </div>
  );
}
