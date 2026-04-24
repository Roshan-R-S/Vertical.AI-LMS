import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  Activity, Target, Clock, AlertTriangle, 
  Zap, DollarSign, TrendingUp,
  Filter, Calendar
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

// Mock data removed in favor of live API data

const CYCLE_DATA = [
  { stage: 'New -> First Contact', days: 1.2 },
  { stage: 'Contact -> Qualify', days: 3.5 },
  { stage: 'Qualify -> Demo', days: 5.2 },
  { stage: 'Demo -> Proposal', days: 2.1 },
  { stage: 'Proposal -> Close', days: 8.4 },
];

// Reusable Metric Card
function MetricCard({ title, value, sub, icon: Icon, color, trend }) {
  return (
    <div className="studio-card" style={{ padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05, transform: 'scale(2)' }}>
        <Icon size={100} color={color} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{title}</div>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 300, marginBottom: 8, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
        {trend && (
          <span style={{ color: trend > 0 ? '#10b981' : '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
        <span style={{ color: 'var(--text-muted)' }}>{sub}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('This Month');

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading Intelligence...</div>
    </div>
  );

  if (!data) return <div>Failed to load dashboard.</div>;

  const { kpis, monthlyTrend, sourceData, funnelData } = data;
  const conversionRate = kpis.totalLeads ? Math.round((kpis.wonDeals / kpis.totalLeads) * 100) : 0;


  const COLORS = ['#8ab4f8', '#81c995', '#fdd663', '#f28b82', '#c58aff', '#78d9ec'];

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-subtitle">SALES INTELLIGENCE</div>
          <h1 className="page-title">Executive Dashboard</h1>
        </div>
        
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ width: 'auto' }}>
            <Calendar size={14} className="search-icon" />
            <select className="form-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{ paddingLeft: 36, height: 38, background: 'transparent', border: 'none', fontSize: 13 }}>
              {['Today', 'This Week', 'This Month', 'Last Month', 'Custom Range'].map(opt => <option key={opt}>{opt}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ height: 38, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={14} /> Filters
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="form-grid" style={{ marginBottom: 24 }}>
        <MetricCard title="Total Revenue" value={`₹${(kpis.closedRevenue/1000).toFixed(0)}K`} sub="Current Period" icon={DollarSign} color="#8ab4f8" trend={12} />
        <MetricCard title="Active Leads" value={kpis.activeLeads} sub="Requiring Action" icon={Zap} color="#fdd663" trend={-5} />
        <MetricCard title="Conversion Rate" value={`${conversionRate}%`} sub="Lead to Deal" icon={TrendingUp} color="#81c995" trend={8} />
        <MetricCard title="Avg Deal Size" value="₹45K" sub="Across Tiers" icon={Activity} color="#c58aff" />

      </div>

      {/* Main Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
        <div className="studio-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Revenue Realization</div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)' }}></div> Target
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div> Realized
              </div>
            </div>
          </div>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}L`} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--accent-blue)" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="pipeline" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>

            </ResponsiveContainer>
          </div>
        </div>

        <div className="studio-card">
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 24 }}>Lead Distribution</div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>

                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        
        <div className="studio-card">
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Pipeline Velocity</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {funnelData.map((item, i) => (
              <div key={item.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                  <span style={{ fontWeight: 600 }}>{item.value}</span>
                </div>
                <div style={{ height: 6, background: 'var(--border-default)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(item.value/funnelData[0].value)*100}%`, background: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            ))}

          </div>
        </div>

        <div className="studio-card">
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Sales Cycle (Avg Days)</div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={CYCLE_DATA}>
                <XAxis type="number" hide />
                <YAxis dataKey="stage" type="category" width={100} fontSize={10} stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                <Bar dataKey="days" fill="var(--accent-blue)" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="studio-card">
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Efficiency Alerts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 12, padding: 12, background: '#ef444410', borderRadius: 8, border: '1px solid #ef444420' }}>
              <AlertTriangle size={16} color="#ef4444" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>Stale Leads Detected</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>12 leads haven't been contacted in 48h.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, padding: 12, background: '#f59e0b10', borderRadius: 8, border: '1px solid #f59e0b20' }}>
              <Clock size={16} color="#f59e0b" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>Demo Backlog</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>8 demos scheduled for tomorrow.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--accent-blue)10', borderRadius: 8, border: '1px solid var(--accent-blue)20' }}>
              <Target size={16} color="var(--accent-blue)" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-blue)' }}>High Value Prospects</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>3 leads worth &gt; ₹100K identified.</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
