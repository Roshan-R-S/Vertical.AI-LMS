import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContextCore';
import { formatCurrency } from '../../utils/formatCurrency';
import { Clock, CheckCircle, Target, TrendingUp, AlertTriangle, Zap, Calendar, Filter } from 'lucide-react';
import { api } from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

function FocusCard({ title, value, sub, icon: Icon, color, urgent = false }) {
  return (
    <div className="studio-card" style={{ padding: 24, borderLeft: `4px solid ${color}`, background: urgent ? `${color}05` : 'var(--bg-card)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</div>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: 32, fontWeight: 300, color: 'var(--text-primary)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  );
}

export default function CPDashboard() {
  const { currentUser, leads, tasks, fetchDashboard } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthlyTarget, setMonthlyTarget] = useState(null);
  const [pipelineFilter, setPipelineFilter] = useState('All');

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
    fetchDashboard('today').then(res => { if (res) setData(res); setLoading(false); });
  }, [fetchDashboard]);

  const myTasks = tasks.filter(t => t.assignedToId === currentUser.id);
  const myLeads = leads.filter(l => l.assignedToId === currentUser.id);
  const todayStr = new Date().toISOString().split('T')[0];

  if (loading || !data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading dashboard...</div>
    </div>
  );

  const { kpis, funnelData } = data;
  const followUpsToday = myTasks.filter(t => t.dueDate === todayStr && t.status !== 'completed').length;
  const overdueCount = myTasks.filter(t => t.dueDate < todayStr && t.status !== 'completed').length;
  const highPriority = myLeads.filter(l => l.priority === 'High' && l.status === 'active').length;
  const achieved = kpis.closedRevenue;
  const progress = monthlyTarget ? Math.min(100, (achieved / monthlyTarget) * 100) : 0;

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <div className="page-subtitle">CHANNEL PARTNER</div>
          <h1 className="page-title">Welcome, {currentUser.name.split(' ')[0]}!</h1>
        </div>
        <div style={{ background: 'var(--bg-surface)', padding: '8px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--border-subtle)' }}>
          <Zap size={14} color="#8b5cf6" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Partner Portal</span>
        </div>
      </div>

      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-secondary)' }}>TODAY'S FOCUS</h3>
      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <FocusCard title="Follow-ups" value={followUpsToday} sub="Scheduled for today" icon={Calendar} color="#6366f1" />
        <FocusCard title="High Priority" value={highPriority} sub="Hot leads to call" icon={Target} color="#f59e0b" />
        <FocusCard title="Overdue" value={overdueCount} sub="Missed interactions" icon={AlertTriangle} color="#ef4444" urgent={overdueCount > 0} />
        <FocusCard title="Active Leads" value={kpis.activeLeads} sub="In your pipeline" icon={TrendingUp} color="#10b981" />
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Activity Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Total Leads', value: kpis.totalLeads, icon: TrendingUp, color: '#6366f1' },
              { label: 'Deals Won', value: kpis.wonDeals, icon: CheckCircle, color: '#10b981' },
              { label: 'Tasks Done', value: myTasks.filter(t => t.status === 'completed').length, icon: CheckCircle, color: '#06b6d4' },
              { label: 'Stale Leads', value: kpis.staleLeads, icon: Clock, color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
                <item.icon size={16} color={item.color} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 24, fontWeight: 700 }}>{item.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="studio-card" style={{ padding: 24, background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 24, color: 'rgba(255,255,255,0.7)' }}>Revenue Tracker</h3>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
              {monthlyTarget ? `Monthly Target: ${formatCurrency(monthlyTarget)}` : 'No target set for this month'}
            </div>
            <div style={{ fontSize: 40, fontWeight: 300 }}>{formatCurrency(achieved)}</div>
            <div style={{ fontSize: 14, color: '#10b981', fontWeight: 600, marginTop: 4 }}>
              {monthlyTarget ? `${progress.toFixed(1)}% Achieved` : 'Revenue so far'}
            </div>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* Pipeline Snapshot + Deal Health */}
      <div className="form-grid" style={{ gridTemplateColumns: '1fr 1.2fr', gap: 24, marginTop: 24 }}>
        {/* Pipeline Snapshot */}
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
                  value: myLeads.filter(l => l.status === pipelineFilter && l.milestoneId === s.id).length
                }))}
                margin={{ top: 4, right: 40, left: 0, bottom: 4 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={11} tick={{ fill: 'var(--text-secondary)' }} width={130} />
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

        {/* Deal Health */}
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
            <div style={{ display: 'flex', gap: 16, padding: '12px 16px', background: 'rgba(239,68,68,0.05)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.1)' }}>
              <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>Missed Callbacks</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>You have <b>{overdueCount}</b> overdue tasks that require immediate attention.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, padding: '12px 16px', background: 'rgba(99,102,241,0.05)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.1)' }}>
              <Zap size={18} color="#6366f1" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>High Value Pipeline</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>You have <b>{kpis.highValueProspects}</b> active leads worth &gt; ₹100K.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
