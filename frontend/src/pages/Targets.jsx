import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContextCore';
import { Target, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../utils/api';
import { formatCurrency } from '../utils/formatCurrency';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Targets() {
  const { users, setTarget, fetchTargets } = useApp();
  const bdes = users.filter(u => u.role === 'BDE' || u.role === 'CHANNEL_PARTNER');

  const now = new Date();
  const [view, setView] = useState('set'); // 'set' | 'history'

  // Set Targets state
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear]   = useState(now.getFullYear());
  const [targets, setTargets] = useState({});
  const [savedTargets, setSavedTargets] = useState({});
  const [saving, setSaving] = useState({});

  // History state
  const [historyYear, setHistoryYear] = useState(now.getFullYear());
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const yearOptions = Array.from({ length: 4 }, (_, i) => now.getFullYear() - i);

  useEffect(() => {
    if (view !== 'set') return;
    fetchTargets(month, year).then(data => {
      const map = {};
      const inputMap = {};
      data.forEach(t => {
        map[t.userId] = { id: t.id, amount: t.amount };
        inputMap[t.userId] = t.amount;
      });
      setSavedTargets(map);
      setTargets(inputMap);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, view]);

  useEffect(() => {
    if (view !== 'history') return;
    let active = true;
    const load = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError('');
        const data = await api.get(`/analytics/target-history?year=${historyYear}`);
        if (active) setHistoryData(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setHistoryError(err.message || 'Failed to load history');
      } finally {
        if (active) setHistoryLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [view, historyYear]);

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const handleSave = async (userId) => {
    const amount = Number(targets[userId] || 0);
    if (!amount || amount <= 0) return alert('Please enter a valid target amount');
    setSaving(p => ({ ...p, [userId]: true }));
    try {
      const res = await setTarget(userId, month, year, amount);
      setSavedTargets(p => ({ ...p, [userId]: { id: res.id, amount } }));
    } finally {
      setSaving(p => ({ ...p, [userId]: false }));
    }
  };

  const totalTarget = Object.values(savedTargets).reduce((s, t) => s + (t.amount || 0), 0);
  const currentMonthIdx = now.getMonth();

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-subtitle">SUPER ADMIN</div>
          <h1 className="page-title">Monthly Targets</h1>
          <p className="page-subtitle">Set and track revenue targets for each BDE</p>
        </div>
        {/* View Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, padding: 4, gap: 4 }}>
          <button
            onClick={() => setView('set')}
            style={{ padding: '6px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: view === 'set' ? 'var(--bg-card)' : 'transparent', color: view === 'set' ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: view === 'set' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            Set Targets
          </button>
          <button
            onClick={() => setView('history')}
            style={{ padding: '6px 16px', borderRadius: 6, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: view === 'history' ? 'var(--bg-card)' : 'transparent', color: view === 'history' ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: view === 'history' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >
            History
          </button>
        </div>
      </div>

      {/* ── SET TARGETS VIEW ── */}
      {view === 'set' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={prevMonth}><ChevronLeft size={16} /></button>
            <div style={{ fontSize: 18, fontWeight: 700, minWidth: 180, textAlign: 'center' }}>
              {MONTH_NAMES[month - 1]} {year}
            </div>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={nextMonth}><ChevronRight size={16} /></button>
            <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-secondary)' }}>
              Total Target: <span style={{ fontWeight: 700, color: '#6366f1' }}>{formatCurrency(totalTarget)}</span>
            </div>
          </div>

          {bdes.length === 0 ? (
            <div className="studio-card" style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Target size={40} style={{ marginBottom: 12, opacity: 0.2 }} />
              <p>No BDEs found. Create BDE users first from User Management.</p>
            </div>
          ) : (
            <div className="studio-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}>
                    <th style={thStyle}>NAME</th>
                    <th style={thStyle}>ROLE</th>
                    <th style={thStyle}>TEAM</th>
                    <th style={thStyle}>CURRENT TARGET</th>
                    <th style={thStyle}>SET TARGET</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {bdes.map((bde, idx) => {
                    const saved = savedTargets[bde.id];
                    const current = targets[bde.id] ?? '';
                    const isSaved = saved && saved.amount === Number(current);
                    return (
                      <tr key={bde.id} style={{ borderBottom: idx < bdes.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar avatar-sm" style={{ background: 'var(--gradient-brand)', flexShrink: 0 }}>{bde.avatar}</div>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{bde.name}</span>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-secondary)' }}>{bde.role}</td>
                        <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-secondary)' }}>{bde.team || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td style={tdStyle}>
                          {saved ? (
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '3px 10px', borderRadius: 20 }}>
                              {formatCurrency(saved.amount)}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Not set</span>
                          )}
                        </td>
                        <td style={tdStyle}>
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: 'var(--text-muted)', pointerEvents: 'none' }}>₹</span>
                            <input
                              className="form-input"
                              type="number"
                              placeholder="e.g. 500000"
                              value={current}
                              onChange={e => setTargets(p => ({ ...p, [bde.id]: e.target.value }))}
                              style={{ width: 150, height: 36, fontSize: 13, paddingLeft: 24 }}
                              min={0}
                            />
                          </div>
                        </td>
                        <td style={tdStyle}>
                          <button
                            className={`btn btn-sm ${isSaved ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => handleSave(bde.id)}
                            disabled={saving[bde.id] || !current}
                            style={{ minWidth: 88, height: 36 }}
                          >
                            {saving[bde.id] ? '...' : isSaved ? '✓ Saved' : <><Save size={13} style={{ marginRight: 4 }} />Save</>}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── HISTORY VIEW ── */}
      {view === 'history' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
            <select
              className="form-select"
              value={historyYear}
              onChange={e => setHistoryYear(Number(e.target.value))}
              style={{ width: 120 }}
            >
              {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Showing target vs achieved for all BDEs</span>
          </div>

          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Loading history...</div>
          ) : historyError ? (
            <div className="studio-card" style={{ padding: 24, color: '#ef4444', fontSize: 13 }}>Error: {historyError}</div>
          ) : (
            <div className="studio-card" style={{ padding: 0, overflow: 'hidden', display: 'flex' }}>

              {/* ── Fixed left panel: Name + Team ── */}
              <div style={{ flexShrink: 0, borderRight: '2px solid var(--border-default)', zIndex: 2 }}>
                <table style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
                      <th style={{ ...thStyle, width: 200 }}>NAME</th>
                      <th style={{ ...thStyle, width: 100 }}>TEAM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.length === 0 ? (
                      <tr><td colSpan={2} style={{ padding: '48px 24px', color: 'var(--text-muted)', fontSize: 13 }}>No BDEs found</td></tr>
                    ) : historyData.map((bde, idx) => (
                      <tr key={bde.id} style={{ borderBottom: idx < historyData.length - 1 ? '1px solid var(--border-default)' : 'none', height: ROW_HEIGHT }}>
                        <td style={{ ...tdStyle, width: 200 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar avatar-sm" style={{ background: 'var(--gradient-brand)', flexShrink: 0 }}>{bde.avatar}</div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>{bde.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{bde.role}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, width: 100, fontSize: 12, color: 'var(--text-secondary)' }}>{bde.team || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── Scrollable right panel: 12 months ── */}
              <div style={{ overflowX: 'auto', flex: 1 }}>
                <table style={{ borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
                      {MONTH_SHORT.map((m, i) => (
                        <th key={m} style={{ ...thStyle, minWidth: 96, textAlign: 'center', background: i === currentMonthIdx && historyYear === now.getFullYear() ? 'rgba(99,102,241,0.08)' : undefined }}>
                          {m}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.length === 0 ? (
                      <tr><td colSpan={12} style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No target data found for {historyYear}</td></tr>
                    ) : historyData.map((bde, idx) => (
                      <tr key={bde.id} style={{ borderBottom: idx < historyData.length - 1 ? '1px solid var(--border-default)' : 'none', height: ROW_HEIGHT }}>
                        {bde.months.map(({ month, target, revenue }) => {
                          const pct = target ? Math.round((revenue / target) * 100) : null;
                          const color = pct === null ? null : pct >= 100 ? '#10b981' : pct >= 70 ? '#f59e0b' : '#ef4444';
                          const isCurrentMonth = month === currentMonthIdx + 1 && historyYear === now.getFullYear();
                          return (
                            <td key={month} style={{ padding: '10px 8px', textAlign: 'center', background: isCurrentMonth ? 'rgba(99,102,241,0.04)' : undefined, minWidth: 96 }}>
                              {target === null ? (
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrency(target)}</span>
                                  <span style={{ fontSize: 11, color: color ?? 'var(--text-muted)' }}>{formatCurrency(revenue)}</span>
                                  {pct !== null && (
                                    <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}18`, padding: '1px 6px', borderRadius: 10 }}>
                                      {pct}%
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>Each cell: <b style={{ color: 'var(--text-primary)' }}>Target</b> / <b>Achieved</b> / % </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} /> ≥100%</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} /> 70–99%</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} /> &lt;70%</span>
          </div>
        </>
      )}
    </div>
  );
}

const ROW_HEIGHT = 64;
const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' };
const tdStyle = { padding: '14px 16px' };
