import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { ChevronDown, ChevronRight, Activity, Users, Target, Phone } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function TeamPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTLs, setExpandedTLs] = useState({});
  const [expandedBDEs, setExpandedBDEs] = useState({});
  const [monthFilter, setMonthFilter] = useState('April 2026');

  useEffect(() => {
    api.get('/analytics/team-performance')
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Assembling performance metrics...</div>
    </div>
  );

  if (!data) return <div>Failed to load performance data.</div>;

  const performance = data;


  const toggleTL = (id) => {
    setExpandedTLs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBDE = (id) => {
    setExpandedBDEs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-subtitle">MANAGEMENT OVERVIEW</div>
          <h1 className="page-title">Team Performance</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <select className="form-select" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
            {['February 2026', 'March 2026', 'April 2026'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {performance.map(team => {
          const isExpanded = expandedTLs[team.tl.id];
          const teamRevenue = team.teamRevenue;
          const teamTarget = team.teamTarget;
          const pct = team.pct;

          
          return (
            <div key={team.tlId} className="studio-card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* TL Header Row */}
              <div
                style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', cursor: 'pointer', background: isExpanded ? 'var(--bg-surface)' : 'transparent', borderBottom: isExpanded ? '1px solid var(--border-default)' : 'none' }}
                onClick={() => toggleTL(team.tl.id)}

              >
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16 }}>
                  {isExpanded ? <ChevronDown size={20} color="var(--text-muted)" /> : <ChevronRight size={20} color="var(--text-muted)" />}
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>
                    {team.tlAvatar}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{team.tl.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>TEAM LEAD &bull; {team.tl.team?.toUpperCase()}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 32, alignItems: 'center', textAlign: 'right' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>ACTUAL VS TARGET</div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>
                      <span style={{ color: pct >= 100 ? 'var(--color-success)' : 'var(--text-primary)' }}>₹{(teamRevenue/1000).toFixed(0)}K</span>{' '}
                      <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ ₹{(teamTarget/1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  <div style={{ width: 120 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                      <span>ACHIEVEMENT</span>
                      <span>{pct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--border-default)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: 'var(--accent-blue)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded TL Panel */}
              {isExpanded && (
                <div style={{ padding: '24px', background: 'var(--bg-page)' }}>

                  {/* Team 3-Month Chart */}
                  <div style={{ marginBottom: 24, padding: 20, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-default)' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>3-Month Performance Trend (Team)</div>
                    <div style={{ height: 160, width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={team.trend}>
                          <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip formatter={(v) => `₹${(v/1000).toFixed(0)}K`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="Target" fill="var(--border-default)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Actual" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* BDE List */}
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 16 }}>REPORTING BDEs</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {team.bdes.map(bde => {
                      const isBdeExpanded = expandedBDEs[bde.id];
                      const bpct = bde.target ? Math.round((bde.revenue / bde.target) * 100) : 0;

                      return (
                        <div key={bde.id} style={{ border: '1px solid var(--border-default)', borderRadius: 12, overflow: 'hidden' }}>
                          {/* BDE Header Row */}
                          <div
                            style={{ padding: '16px', display: 'flex', alignItems: 'center', cursor: 'pointer', background: isBdeExpanded ? 'var(--bg-surface)' : 'var(--bg-card)', borderBottom: isBdeExpanded ? '1px solid var(--border-default)' : 'none' }}
                            onClick={() => toggleBDE(bde.id)}
                          >
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
                              {isBdeExpanded ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
                              <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 11 }}>
                                {bde.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 500 }}>{bde.name}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>INDIVIDUAL CONTRIBUTOR</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 24, paddingRight: 16 }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>₹{(bde.revenue/1000).toFixed(0)}K</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>REVENUE</div>
                              </div>
                              <div style={{ width: 80, textAlign: 'right' }}>
                                <div style={{ fontSize: 14, fontWeight: 600 }}>{bpct}%</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>TARGET</div>
                              </div>
                            </div>
                          </div>

                          {/* Expanded BDE Panel */}
                          {isBdeExpanded && (
                            <div style={{ padding: '24px', background: 'var(--bg-card)' }}>

                              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <Activity size={14} /> Leading Indicators (Daily Execution)
                              </div>

                              {/* Work Queue & Alerts */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 24 }}>
                                <div style={{ padding: 20, background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600 }}>Work Queue Progress</div>
                                    <span style={{ fontSize: 11, background: 'rgba(16,185,129,0.1)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>ON TRACK</span>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                    <div style={{ flex: 1, height: 8, background: 'var(--border-default)', borderRadius: 4, overflow: 'hidden' }}>
                                      <div style={{ height: '100%', width: `${(bde.workQueue.done / bde.workQueue.total) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', borderRadius: 4 }} />
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>{bde.workQueue.done}/{bde.workQueue.total}</span>
                                  </div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Follow-ups &amp; Callbacks completed today</div>
                                </div>

                                <div style={{ padding: 20, background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
                                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Critical Alerts (Needs Attention)</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                                      <span style={{ color: 'var(--text-secondary)' }}><b>{bde.alerts.overdueTasks}</b> Missed Callbacks</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                                      <span style={{ color: 'var(--text-secondary)' }}><b>{bde.alerts.staleLeads}</b> Stale Leads</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* KPI Mini Cards */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                                <div style={{ padding: 16, border: '1px solid var(--border-default)', borderRadius: 12, background: 'var(--bg-card)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Phone size={16} color="#6366f1" />
                                    <span style={{ fontSize: 10, color: 'var(--color-success)', fontWeight: 700 }}>+12%</span>
                                  </div>
                                  <div style={{ fontSize: 24, fontWeight: 400 }}>{bde.calls ?? '—'}</div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>CALLS TODAY</div>
                                </div>

                                <div style={{ padding: 16, border: '1px solid var(--border-default)', borderRadius: 12, background: 'var(--bg-card)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Users size={16} color="#06b6d4" />
                                  </div>
                                  <div style={{ fontSize: 24, fontWeight: 400 }}>{bde.meetings ?? '—'}</div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>DEMOS BOOKED</div>
                                </div>

                                <div style={{ padding: 16, border: '1px solid var(--border-default)', borderRadius: 12, background: 'var(--bg-card)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Target size={16} color="#8b5cf6" />
                                  </div>
                                  <div style={{ fontSize: 24, fontWeight: 400 }}>{bde.deals ?? '—'}</div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>WON DEALS</div>
                                </div>

                                <div style={{ padding: 16, border: '1px solid var(--border-default)', borderRadius: 12, background: 'var(--bg-card)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                    <Activity size={16} color="#10b981" />
                                  </div>
                                  <div style={{ fontSize: 24, fontWeight: 400 }}>{bde.executionScore}%</div>
                                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>EXECUTION SCORE</div>
                                </div>
                              </div>

                              {/* BDE 3-Month Chart */}
                              <div style={{ padding: 20, background: 'var(--bg-surface)', borderRadius: 12, border: '1px solid var(--border-default)' }}>
                                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 16 }}>3-Month Performance Trend (BDE)</div>
                                <div style={{ height: 160, width: '100%' }}>
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={bde.trend}>
                                      <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                      <Tooltip formatter={(v) => `₹${(v/1000).toFixed(0)}K`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8 }} />
                                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                                      <Bar dataKey="Target" fill="var(--border-subtle)" radius={[4, 4, 0, 0]} />
                                      <Bar dataKey="Actual" fill="var(--color-success)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>

                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
