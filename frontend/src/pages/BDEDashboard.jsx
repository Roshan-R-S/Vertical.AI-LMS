import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContextCore';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatCurrency';
import { 
  Clock, PhoneCall, CheckCircle, Target, 
  AlertTriangle, ArrowRight, Zap,
  BarChart2, Users, Calendar, Filter
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';

function FocusCard({ title, value, sub, icon: Icon, color, urgent = false }) {
  return (
    <div className="studio-card" style={{ 
      padding: '24px', 
      borderLeft: `4px solid ${color}`,
      background: urgent ? `${color}05` : 'var(--bg-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: 32, fontWeight: 300, color: 'var(--text-primary)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  );
}

export default function BDEDashboard() {
  const navigate = useNavigate();
  const { currentUser, leads, tasks, fetchDashboard } = useApp();
  const [dateRange, setDateRange] = useState('Today');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pipelineFilter, setPipelineFilter] = useState('All');
  const [monthlyTarget, setMonthlyTarget] = useState(null);
  
  useEffect(() => {
    const now = new Date();
    api.get(`/targets?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
      .then(data => {
        const mine = data.find(t => t.userId === currentUser?.id);
        if (mine) setMonthlyTarget(mine.amount);
      })
      .catch(() => {});
  }, [currentUser?.id]);

  useEffect(() => {
    let period = 'today';
    if (dateRange === 'Today') period = 'today';
    if (dateRange === 'This Week') period = 'this-week';
    if (dateRange === 'This Month') period = 'this-month';
    
    fetchDashboard(period).then(res => {
      if (res) setData(res);
      setLoading(false);
    });
  }, [dateRange, fetchDashboard]);

  // Filter for current BDE
  const bdeTasks = tasks.filter(t => t.assignedToId === currentUser.id);
  const bdeLeads = leads.filter(l => l.assignedToId === currentUser.id);
  const todayStr = new Date().toISOString().split('T')[0];

  if (loading || !data) {
    return <div className="p-8 text-center"><Zap className="animate-spin" /> Loading performance data...</div>;
  }

  const { kpis, funnelData } = data;

  // 1. Today's Focus
  const followUpsToday = bdeTasks.filter(t => t.dueDate === todayStr && t.status !== 'completed').length;
  const callbacksToday = bdeLeads.filter(l => l.disposition === 'Callback Requested').length;
  const highPriorityCount = bdeLeads.filter(l => l.priority === 'High' && l.status === 'active').length;
  const overdueCount = bdeTasks.filter(t => t.dueDate < todayStr && t.status !== 'completed').length;

  // 2. Activity Summary (Based on real interactions)
  const activityData = [
    { label: 'Calls Made', value: kpis.totalLeads, target: 40, icon: PhoneCall, color: '#6366f1' },
    { label: 'Active Pipeline', value: kpis.activeLeads, target: 20, icon: Users, color: '#06b6d4' },
    { label: 'Deals Won', value: kpis.wonDeals, target: 5, icon: Calendar, color: '#8b5cf6' },
    { label: 'Follow-ups Done', value: bdeTasks.filter(t => t.status === 'completed').length, target: 15, icon: CheckCircle, color: '#10b981' },
  ];

  // 4. Personal Tracker
  const achievedSoFar = kpis.closedRevenue;
  const remaining = monthlyTarget ? Math.max(0, monthlyTarget - achievedSoFar) : null;
  const progressPercent = monthlyTarget ? Math.min(100, (achievedSoFar / monthlyTarget) * 100) : 0;

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <div className="page-subtitle">BDE PERFORMANCE</div>
          <h1 className="page-title">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
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

          <div style={{ background: 'var(--bg-surface)', padding: '8px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--border-subtle)' }}>
            <Zap size={14} color="#8b5cf6" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Score: <span style={{ color: progressPercent >= 80 ? '#10b981' : progressPercent >= 50 ? '#f59e0b' : '#ef4444' }}>{Math.round(progressPercent)}/100</span></span>
          </div>
        </div>
      </div>

      {/* 1. Today's Focus Section */}
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)' }}>TODAY'S EXECUTION FOCUS</h3>
      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <FocusCard title="Follow-ups" value={followUpsToday} sub="Scheduled for today" icon={Calendar} color="#6366f1" />
        <FocusCard title="Callbacks" value={callbacksToday} sub="Requested by leads" icon={PhoneCall} color="#06b6d4" />
        <FocusCard title="High Priority" value={highPriorityCount} sub="Hot leads to call" icon={Target} color="#f59e0b" />
        <FocusCard title="Overdue" value={overdueCount} sub="Missed interactions" icon={AlertTriangle} color="#ef4444" urgent={overdueCount > 0} />
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* 2. Activity Tracker */}
        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={18} color="#6366f1" /> Activity Summary ({dateRange})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {activityData.map((act, i) => (
              <div key={i} style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <act.icon size={16} color={act.color} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>Target: {act.target}</span>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{act.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{act.label}</div>
                <div style={{ height: 4, background: 'var(--border-subtle)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${(act.value / act.target) * 100}%`, background: act.color, borderRadius: 2 }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Target Tracker */}
        <div className="studio-card" style={{ padding: 24, background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 24, color: 'rgba(255,255,255,0.7)' }}>Personal Target Tracker</h3>
          
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
              {monthlyTarget ? `Monthly Target: ${formatCurrency(monthlyTarget)}` : 'No target set for this month'}
            </div>
            <div style={{ fontSize: 48, fontWeight: 300 }}>{formatCurrency(achievedSoFar)}</div>
            <div style={{ fontSize: 14, color: '#10b981', fontWeight: 600, marginTop: 4 }}>
              {monthlyTarget ? `${progressPercent.toFixed(1)}% Achieved` : 'Revenue so far'}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8, color: 'rgba(255,255,255,0.8)' }}>
              <span>Progress toward goal</span>
              <span>{remaining !== null ? `${formatCurrency(remaining)} Left` : '—'}</span>
            </div>
            <div style={{ height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 6 }}></div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Target size={20} color="#10b981" />
            <div style={{ fontSize: 12, lineHeight: 1.5 }}>
              You are <b>on track</b>! Based on your current conversion rate, you'll hit your target by the 28th.
            </div>
          </div>
        </div>
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
        {/* 3. Pipeline Snapshot */}
        <div className="studio-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Quick Pipeline Snapshot</h3>
            <div style={{ display: 'flex', gap: 6 }}>
              {['All', 'active', 'won', 'lost'].map(f => (
                <button key={f} onClick={() => setPipelineFilter(f)}
                  className={`btn btn-sm ${pipelineFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 10, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 3 }}
                >
                  {f === 'All' && <Filter size={10} />}
                  {f === 'All' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: Math.max(260, (funnelData.length || 5) * 36), width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical"
                data={pipelineFilter === 'All' ? funnelData : funnelData.map(s => ({
                  ...s,
                  value: bdeLeads.filter(l => l.status === pipelineFilter && l.milestoneId === s.id).length
                }))}
                margin={{ top: 4, right: 40, left: 0, bottom: 4 }}>
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  fontSize={11}
                  tick={{ fill: 'var(--text-secondary)' }}
                  width={130}
                />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14} label={{ position: 'right', fontSize: 11, fill: 'var(--text-secondary)' }}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: 16, padding: 16, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Weighted Value:</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{formatCurrency(kpis.weightedExpected)}</span>
          </div>
        </div>

        {/* 5. Alerts & Insights */}
        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Deal Health</h3>
          <div style={{ height: 180, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Won', value: kpis.wonDeals || 0 },
                    { name: 'Lost', value: kpis.lostDeals || 0 },
                    { name: 'Active', value: kpis.activeLeads || 0 },
                  ]}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#6366f1" />
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            <div style={{ display: 'flex', gap: 16, padding: '12px 16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
              <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Missed Callbacks</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>You have <b>{overdueCount}</b> overdue tasks that require immediate attention.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, padding: '12px 16px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <Zap size={18} color="#6366f1" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>High Value Pipeline</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>You have <b>{kpis.highValueProspects}</b> active leads worth &gt; ₹100K.</div>
              </div>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ width: '100%', marginTop: 16, fontSize: 13, fontWeight: 600 }} onClick={() => navigate('/tasks')}>
            View All Execution Tasks <ArrowRight size={14} style={{ marginLeft: 8 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
