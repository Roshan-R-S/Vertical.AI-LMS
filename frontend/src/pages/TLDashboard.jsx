import {
    Activity,
    AlertTriangle,
    ArrowRight,
    BarChart2,
    Briefcase,
    Calendar, CheckCircle,
    Clock,
    DollarSign,
    Filter,
    Phone,
    PhoneCall,
    Target,
    Timer,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Area,
    AreaChart,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';
import { useApp } from '../context/AppContextCore';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function TLDashboard() {
  const navigate = useNavigate();
  const { currentUser, users, tasks, leads, fetchDashboard } = useApp();
  const [dateRange, setDateRange] = useState('This Month');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [selectedBDE, setSelectedBDE] = useState('All');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  const teamBDEs = users.filter(u => {
    if (u.role !== 'BDE') return false;
    if (currentUser?.role === 'Super Admin') return true;
    if (!currentUser?.teamId) return !u.teamId;
    return u.teamId === currentUser.teamId;
  });

  // Build teamMap: count BDEs per team
  const teamMap = {};
  users.filter(u => u.role === 'TL').forEach(tl => {
    teamMap[tl.team] = users.filter(u => u.teamId === tl.teamId && u.role === 'BDE').length;
  });

  // Live work queue stats from tasks context
  const teamBDEIds = teamBDEs.map(u => u.id);
  const teamTasks = tasks.filter(t => teamBDEIds.includes(t.assignedToId));
  const today = new Date().toISOString().split('T')[0];
  const scheduledToday = teamTasks.filter(t => t.dueDate === today).length;
  const completedToday = teamTasks.filter(t => t.status === 'completed' && t.updatedAt?.startsWith(today)).length;
  const pendingToday = teamTasks.filter(t => t.dueDate === today && t.status !== 'completed').length;

  // Live pipeline health stats from leads context
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const teamLeads = leads.filter(l => teamBDEIds.includes(l.assignedToId) && l.status === 'active');
  const stuckDeals = teamLeads.filter(l => l.updatedAt && new Date(l.updatedAt).toISOString() < sevenDaysAgo).length;
  const closingThisWeek = teamLeads.filter(l => l.expectedClose && l.expectedClose <= oneWeekFromNow && l.expectedClose >= today);
  const closingThisWeekValue = closingThisWeek.reduce((s, l) => s + (l.value || 0), 0);

  // Live performance insight for Section G
  const getPerformanceInsight = () => {
    if (!data?.bdePerformance?.length) return 'Add more activity data to see performance insights.';
    const sorted = [...data.bdePerformance].sort((a, b) => b.calls - a.calls);
    const topCaller = sorted[0];
    const topDealer = [...data.bdePerformance].sort((a, b) => b.deals - a.deals)[0];
    if (topCaller?.id === topDealer?.id) {
      return `${topCaller.name} leads both in calls (${topCaller.calls}) and deals closed (${topCaller.deals}) — strong activity-to-close correlation.`;
    }
    return `${topCaller?.name || '—'} has the most calls (${topCaller?.calls || 0}). ${topDealer?.name || '—'} leads in deals closed (${topDealer?.deals || 0}).`;
  };

  useEffect(() => {
    let period = 'this-month';
    if (dateRange === 'Today') period = 'today';
    if (dateRange === 'This Week') period = 'this-week';
    if (dateRange === 'This Month') period = 'this-month';
    
    fetchDashboard(period, selectedBDE).then(res => {
      if (res) setData(res);
      setLoading(false);
    });
  }, [dateRange, selectedBDE, fetchDashboard]);

  if (loading || !data) {
    return <div className="p-8 text-center"><Activity className="animate-spin" /> Loading team analytics...</div>;
  }

  const { kpis, monthlyTrend, bdePerformance, funnelData, teamExecution } = data;

  return (
    <div className="animate-fadeIn">
      {/* Header & Filters */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-subtitle">TEAM PERFORMANCE CONTROL PANEL</div>
          <h1 className="page-title">{currentUser.team} Performance Overview</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 0, borderRadius: 10, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
            <div style={{ padding: '0 12px', borderRight: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', background: 'var(--bg-card)' }}>
              <Calendar size={14} color="var(--text-muted)" />
            </div>
            <select className="form-select" style={{ border: 'none', background: 'transparent', outline: 'none', minWidth: 120, fontSize: 13 }} value={dateRange} onChange={e => { setLoading(true); setDateRange(e.target.value); }}>
              {['Today', 'This Week', 'This Month', 'Custom'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          {dateRange === 'Custom' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-card)', padding: '4px 12px', borderRadius: 10, border: '1px solid var(--border-default)' }}>
              <input type="date" className="form-input" style={{ width: 130, height: 32, fontSize: 12, padding: 4 }} value={customDates.start} onChange={e => setCustomDates(p => ({ ...p, start: e.target.value }))} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>to</span>
              <input type="date" className="form-input" style={{ width: 130, height: 32, fontSize: 12, padding: 4 }} value={customDates.end} onChange={e => setCustomDates(p => ({ ...p, end: e.target.value }))} />
            </div>
          )}

          <select className="form-select" style={{ width: 160, background: 'var(--bg-surface)' }} value={selectedBDE} onChange={e => { setLoading(true); setSelectedBDE(e.target.value); }}>
            <option value="All">All BDEs</option>
            {teamBDEs.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      {/* SECTION A: Leading Indicators (60% Focus) */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, borderLeft: '3px solid #6366f1', paddingLeft: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            A. Leading Indicators (Effort & Activity)
          </h3>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Real-time Team Productivity</span>
        </div>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <div className="studio-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <PhoneCall size={16} color="#6366f1" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 300 }}>{kpis.activeLeads}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>ACTIVE LEADS</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Active leads in pipeline</div>
          </div>
          
          <div className="studio-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Users size={16} color="#8b5cf6" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 300 }}>{kpis.wonDeals}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>DEALS CLOSED</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Deals closed this period</div>
          </div>

          <div className="studio-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Timer size={16} color="#06b6d4" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 300 }}>{kpis.overdueFollowUps}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>OVERDUE TASKS</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Tasks past due date</div>
          </div>

          <div className="studio-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <CheckCircle size={16} color="#10b981" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 300 }}>{kpis.staleLeads}</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>STALE LEADS (&gt;7d)</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>No activity &gt; 7 days</div>
          </div>
        </div>
      </div>

      {/* SECTION B & C: Lagging & Pipeline (40% Focus) */}
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Lagging Indicators */}
        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, borderLeft: '3px solid #10b981', paddingLeft: 12, textTransform: 'uppercase' }}>B. Lagging Indicators (Outcomes)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                <TrendingUp size={12} color="#10b981" /> CLOSED REVENUE ({dateRange.toUpperCase()})
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#10b981' }}>₹{kpis.closedRevenue.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{kpis.wonDeals} Deals Closed</div>
            </div>
            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                <TrendingUp size={12} color="#10b981" /> WIN RATE %
              </div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>
                {kpis.wonDeals + kpis.lostDeals > 0 
                  ? Math.round((kpis.wonDeals / (kpis.wonDeals + kpis.lostDeals)) * 100) 
                  : 0}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Ratio: {kpis.wonDeals}:{kpis.lostDeals}</div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>CONVERSION FUNNEL</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {funnelData.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                  <span style={{ fontWeight: 700, color: c.fill }}>{c.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pipeline Health */}
        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, borderLeft: '3px solid #f59e0b', paddingLeft: 12, textTransform: 'uppercase' }}>C. Pipeline Health</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                <DollarSign size={12} color="#f59e0b" /> TOTAL PIPELINE
              </div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#f59e0b' }}>₹{(kpis.totalPipelineValue / 100000).toFixed(1)} L</div>
            </div>
            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                <Clock size={12} color="#06b6d4" /> WEIGHTED VALUE
              </div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>₹{(kpis.weightedExpected / 100000).toFixed(1)} L</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Probability Adjusted</div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>DEAL DISTRIBUTION</div>
            <div style={{ display: 'flex', gap: 4, height: 32, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
              {funnelData.map((stage, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    flex: stage.value || 1, 
                    background: stage.fill, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 9, 
                    color: 'white',
                    minWidth: 40
                  }}
                >
                  {stage.name.split(' ')[0]}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={12} /> <b>{stuckDeals} Stuck Deal{stuckDeals !== 1 ? 's' : ''}</b> (No movement &gt; 7 days)
              </div>
              <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={12} /> <b>{closingThisWeek.length} Deal{closingThisWeek.length !== 1 ? 's' : ''} Closing This Week</b> {closingThisWeekValue > 0 ? `(Value: ₹${(closingThisWeekValue / 100000).toFixed(1)}L)` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION D & E: Monitoring & Discipline */}
      <div className="form-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Team Activity Visibility */}
        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, borderLeft: '3px solid #06b6d4', paddingLeft: 12, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={16} color="#06b6d4" /> D. Team Activity Visibility
          </h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {['all', 'active', 'inactive'].map(f => (
              <button key={f} onClick={() => setActivityFilter(f)}
                className={`btn btn-sm ${activityFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 11, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {f === 'all' && <Filter size={11} />} {f === 'all' ? 'All BDEs' : f === 'active' ? 'Active Only' : 'Inactive Only'}
              </button>
            ))}
          </div>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>BDE</th>
                  <th style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} /> Calls</th>
                  <th>Meetings</th>
                  <th style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={11} /> Follow-ups</th>
                  <th>Last Activity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bdePerformance
                  .filter(bde => activityFilter === 'all' ? true : activityFilter === 'active' ? bde.isActive : !bde.isActive)
                  .map(bde => (
                  <tr 
                    key={bde.id} 
                    onClick={() => { setLoading(true); setSelectedBDE(bde.id); }}
                    style={{ cursor: 'pointer' }}
                    className="hover-row"
                  >
                    <td>
                      <div style={{ fontWeight: 600 }}>{bde.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>BDE</div>
                    </td>
                    <td>{bde.calls}</td>
                    <td>{bde.meetings}</td>
                    <td>{bde.deals}</td>
                    <td>{bde.lastActivity || '—'}</td>
                    <td><span className={`badge ${bde.isActive ? 'badge-success' : 'badge-neutral'}`}>{bde.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-surface)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Priority coverage: <b>{teamExecution?.priorityCoveragePct ?? '—'}%</b> | Team size: <b>{teamMap[currentUser.team] || 0} BDEs</b></div>
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ fontSize: 11 }}
              onClick={() => navigate('/leads?filter=Untouched')}
            >
              View Untouched Leads <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* Work Queue Health */}
        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, borderLeft: '3px solid #8b5cf6', paddingLeft: 12, textTransform: 'uppercase' }}>E. Work Queue Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                <span>Scheduled Today</span>
                <span style={{ fontWeight: 700 }}>{scheduledToday}</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-surface)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${scheduledToday > 0 ? (completedToday / scheduledToday) * 100 : 0}%`, background: '#8b5cf6', borderRadius: 4 }}></div>
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>{completedToday} Completed / {pendingToday} Pending</div>
            </div>

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 10, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>{kpis.overdueFollowUps}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>OVERDUE</div>
              </div>
              <div style={{ padding: 12, background: 'rgba(245, 158, 11, 0.05)', borderRadius: 10, border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{kpis.staleLeads}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>STALE LEADS</div>
              </div>
            </div>

            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>High-Priority Action Required</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                <b>{kpis.highValueProspects}</b> high-value leads (&gt;₹100K) are currently pending action.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION F & G: Risks & Trends */}
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1.5fr', gap: 24, marginBottom: 32 }}>
        {/* Alerts & Risk Indicators */}
        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, borderLeft: '3px solid #ef4444', paddingLeft: 12, textTransform: 'uppercase' }}>F. Alerts & Risks</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 12, display: 'flex', gap: 12 }}>
              <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>Stale Leads</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}><b>{kpis.staleLeads}</b> leads have had no activity in &gt; 7 days.</div>
              </div>
            </div>
            <div style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 12, display: 'flex', gap: 12 }}>
              <Zap size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>Overdue Tasks</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}><b>{kpis.overdueFollowUps}</b> tasks are past their due date.</div>
              </div>
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, display: 'flex', gap: 12 }}>
              <Users size={18} color="#6366f1" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>High Value Prospects</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}><b>{kpis.highValueProspects}</b> active leads worth &gt; ₹100K need attention.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, borderLeft: '3px solid #8b5cf6', paddingLeft: 12, textTransform: 'uppercase' }}>G. Performance Trends</h3>
          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis fontSize={12} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Area type="monotone" name="Revenue (L)" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#colorCalls)" />
                <Area type="monotone" name="Pipeline (L)" dataKey="pipeline" stroke="#10b981" fillOpacity={1} fill="rgba(16, 185, 129, 0.1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {bdePerformance.length > 0 && (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, margin: '16px 0 8px', color: 'var(--text-secondary)' }}>BDE CALLS vs DEALS (THIS PERIOD)</div>
              <div style={{ height: 120, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bdePerformance} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 11 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" name="Calls" dataKey="calls" stroke="#6366f1" dot={{ r: 3 }} strokeWidth={2} />
                    <Line type="monotone" name="Deals" dataKey="deals" stroke="#10b981" dot={{ r: 3 }} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            💡 {getPerformanceInsight()}
          </div>
        </div>
      </div>
    </div>
  );
}
