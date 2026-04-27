import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContextCore';
import { Clock, CheckCircle, Target, TrendingUp, AlertTriangle, Zap, Calendar } from 'lucide-react';

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

  const { kpis } = data;
  const followUpsToday = myTasks.filter(t => t.dueDate === todayStr && t.status !== 'completed').length;
  const overdueCount = myTasks.filter(t => t.dueDate < todayStr && t.status !== 'completed').length;
  const highPriority = myLeads.filter(l => l.priority === 'High' && l.status === 'active').length;
  const monthlyTarget = 500000;
  const achieved = kpis.closedRevenue;
  const progress = Math.min(100, (achieved / monthlyTarget) * 100);

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
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Monthly Target: ₹{(monthlyTarget / 100000).toFixed(1)}L</div>
            <div style={{ fontSize: 40, fontWeight: 300 }}>₹{(achieved / 100000).toFixed(2)}L</div>
            <div style={{ fontSize: 14, color: '#10b981', fontWeight: 600, marginTop: 4 }}>{progress.toFixed(1)}% Achieved</div>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 4 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
