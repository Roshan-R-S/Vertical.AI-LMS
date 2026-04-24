import { useState } from 'react';
import { useApp } from '../context/AppContextCore';
import { 
  TrendingUp, Activity, Users, Target, Clock, AlertTriangle, 
  Zap, PieChart as PieChartIcon, ArrowRight, DollarSign, 
  BarChart2, PhoneCall, Filter, Calendar, CheckCircle, 
  Phone, Briefcase, ChevronDown, ChevronRight, Timer
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function TLDashboard() {
  const { currentUser, leads, tasks, users } = useApp();
  const [dateRange, setDateRange] = useState('Today');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [selectedBDE, setSelectedBDE] = useState('All');

  // Filter team-specific data
  const teamBDEs = users.filter(u => u.team === currentUser.team && u.role === 'BDE');
  const teamLeads = leads.filter(l => l.assignedTL === currentUser.name);
  const teamTasks = tasks.filter(t => teamBDEs.some(b => b.name === t.bde));

  // Mock data for trends
  const TREND_DATA = [
    { name: 'Mon', calls: 120, meetings: 12, conversion: 5 },
    { name: 'Tue', calls: 145, meetings: 15, conversion: 8 },
    { name: 'Wed', calls: 130, meetings: 10, conversion: 4 },
    { name: 'Thu', calls: 160, meetings: 22, conversion: 12 },
    { name: 'Fri', calls: 175, meetings: 25, conversion: 15 },
  ];

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
            <select className="form-select" style={{ border: 'none', background: 'transparent', outline: 'none', minWidth: 120, fontSize: 13 }} value={dateRange} onChange={e => setDateRange(e.target.value)}>
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

          <select className="form-select" style={{ width: 160, background: 'var(--bg-surface)' }} value={selectedBDE} onChange={e => setSelectedBDE(e.target.value)}>
            <option value="All">All BDEs</option>
            {teamBDEs.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
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
              <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>+12% vs Yesterday</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 300 }}>185</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>TOTAL CALLS MADE</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Connect Rate: <b>62%</b></div>
          </div>
          
          <div className="studio-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Users size={16} color="#8b5cf6" />
              <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>{dateRange === 'Today' ? '4 Done' : '24 Done'}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 300 }}>12</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>MEETINGS SCHEDULED</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Completion Rate: <b>78%</b></div>
          </div>

          <div className="studio-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <Timer size={16} color="#06b6d4" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 300 }}>14m</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>AVG RESPONSE TIME</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Target SLA: 10m</div>
          </div>

          <div className="studio-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <CheckCircle size={16} color="#10b981" />
            </div>
            <div style={{ fontSize: 28, fontWeight: 300 }}>88%</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>TASK COMPLIANCE</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}><b>42/48</b> Tasks Done</div>
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
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>REVENUE CLOSED (MTD)</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#10b981' }}>₹42,50,000</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>8 Deals Closed</div>
            </div>
            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>WIN RATE %</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>24%</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Avg Win/Loss: 1:3</div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>CONVERSION FUNNEL</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Lead → Qualified', value: '42%' },
                { label: 'Qualified → Demo', value: '38%' },
                { label: 'Demo → Proposal', value: '64%' },
                { label: 'Proposal → Won', value: '18%' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{c.label}</span>
                  <span style={{ fontWeight: 700, color: '#6366f1' }}>{c.value}</span>
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
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>TOTAL VALUE</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#f59e0b' }}>₹1.8 Cr</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>42 Active Deals</div>
            </div>
            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>WEIGHTED VALUE</div>
              <div style={{ fontSize: 24, fontWeight: 600 }}>₹62 L</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Probability Adjusted</div>
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12 }}>DEAL DISTRIBUTION</div>
            <div style={{ display: 'flex', gap: 4, height: 32, borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ flex: 4, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white' }}>EARLY (40%)</div>
              <div style={{ flex: 3, background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white' }}>MID (30%)</div>
              <div style={{ flex: 3, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white' }}>LATE (30%)</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={12} /> <b>12 Stuck Deals</b> (No movement &gt; 7 days)
              </div>
              <div style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={12} /> <b>5 Deals Closing This Week</b> (Value: ₹18L)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION D & E: Monitoring & Discipline */}
      <div className="form-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Team Activity Visibility */}
        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, borderLeft: '3px solid #06b6d4', paddingLeft: 12, textTransform: 'uppercase' }}>D. Team Activity Visibility</h3>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table" style={{ fontSize: 12 }}>
              <thead>
                <tr>
                  <th>BDE</th>
                  <th>Calls</th>
                  <th>Meetings</th>
                  <th>Follow-ups</th>
                  <th>Last Activity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {teamBDEs.map(bde => (
                  <tr key={bde.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{bde.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{bde.territory}</div>
                    </td>
                    <td>24</td>
                    <td>2</td>
                    <td>15</td>
                    <td>4m ago</td>
                    <td><span className="badge badge-success">ACTIVE</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-surface)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}><b>82%</b> of assigned leads touched today</div>
            <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>View Untouched Leads <ArrowRight size={12} /></button>
          </div>
        </div>

        {/* Work Queue Health */}
        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, borderLeft: '3px solid #8b5cf6', paddingLeft: 12, textTransform: 'uppercase' }}>E. Work Queue Health</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                <span>Scheduled Today</span>
                <span style={{ fontWeight: 700 }}>42</span>
              </div>
              <div style={{ height: 8, background: 'var(--bg-surface)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '65%', background: '#8b5cf6', borderRadius: 4 }}></div>
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>28 Completed / 14 Pending</div>
            </div>
            
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 10, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#ef4444' }}>6</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>OVERDUE</div>
              </div>
              <div style={{ padding: 12, background: 'rgba(245, 158, 11, 0.05)', borderRadius: 10, border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>14</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>CALLBACKS</div>
              </div>
            </div>

            <div style={{ padding: 16, background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>High-Priority Action Required</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                <b>8 leads</b> with high intent scores are currently pending action for &gt;4 hours.
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
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>SLA Breach (Contact Time)</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>5 new leads assigned &gt; 30m ago with zero contact.</div>
              </div>
            </div>
            <div style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 12, display: 'flex', gap: 12 }}>
              <Zap size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>Low Activity Alert</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}><b>Akash Patel</b> has recorded only 4 calls in the last 3 hours.</div>
              </div>
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, display: 'flex', gap: 12 }}>
              <Users size={18} color="#6366f1" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Stuck Proposals</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>8 proposals have no client engagement in &gt; 48 hours.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trends */}
        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20, borderLeft: '3px solid #8b5cf6', paddingLeft: 12, textTransform: 'uppercase' }}>G. Performance Trends</h3>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis fontSize={12} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
                <Area type="monotone" name="Agent Activity (Calls)" dataKey="calls" stroke="#6366f1" fillOpacity={1} fill="url(#colorCalls)" />
                <Area type="monotone" name="Conversion Result" dataKey="conversion" stroke="#10b981" fillOpacity={1} fill="rgba(16, 185, 129, 0.1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Positive 0.82 correlation between high morning activity and evening closures.
          </div>
        </div>
      </div>
    </div>
  );
}
