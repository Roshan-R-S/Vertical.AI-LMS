import { useState } from 'react';
import { Target, History, Save, IndianRupee } from 'lucide-react';
import { useApp } from '../context/AppContextCore';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Targets() {
  const { users, targets, setTarget, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('set');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [amounts, setAmounts] = useState({});
  const [saving, setSaving] = useState({});
  const [historyUser, setHistoryUser] = useState('All');

  const isAdmin = currentUser.role === 'Super Admin';
  const isTL = currentUser.role === 'Team Lead';

  // Only BDEs and TLs can have targets set
  const eligibleUsers = users.filter(u => {
    if (u.status !== 'active') return false;
    if (u.role !== 'BDE' && u.role !== 'Team Lead') return false;
    // TL can only set targets for their own team BDEs
    if (isTL) return u.role === 'BDE' && u.teamId === currentUser.teamId;
    return true;
  });

  const getExistingTarget = (userId) =>
    targets.find(t => t.userId === userId && t.month === selectedMonth && t.year === selectedYear);

  const getAmount = (userId) => {
    if (amounts[userId] !== undefined) return amounts[userId];
    return getExistingTarget(userId)?.amount ?? '';
  };

  const handleSave = async (userId) => {
    const amount = amounts[userId];
    if (amount === undefined || amount === '') return;
    setSaving(p => ({ ...p, [userId]: true }));
    await setTarget(userId, selectedMonth, selectedYear, Number(amount));
    setAmounts(p => { const n = { ...p }; delete n[userId]; return n; });
    setSaving(p => ({ ...p, [userId]: false }));
  };

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i);

  // History: all targets, filterable by user
  const historyData = targets
    .filter(t => historyUser === 'All' || t.userId === historyUser)
    .sort((a, b) => b.year - a.year || b.month - a.month);

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-subtitle">PERFORMANCE MANAGEMENT</div>
          <h1 className="page-title">Targets</h1>
        </div>
      </div>

      <div className="tabs mb-6">
        <button className={`tab ${activeTab === 'set' ? 'active' : ''}`} onClick={() => setActiveTab('set')}>
          <Target size={14} style={{ marginRight: 6 }} /> Set Targets
        </button>
        <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          <History size={14} style={{ marginRight: 6 }} /> History
        </button>
      </div>

      {/* ── SET TARGETS TAB ── */}
      {activeTab === 'set' && (
        <div>
          {/* Month/Year picker */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
            <select className="form-select" style={{ width: 140 }} value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select className="form-select" style={{ width: 100 }} value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Setting targets for <b>{MONTHS[selectedMonth - 1]} {selectedYear}</b>
            </span>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Monthly Target (₹)</th>
                  <th>Set By</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {eligibleUsers.map(user => {
                  const existing = getExistingTarget(user.id);
                  const isDirty = amounts[user.id] !== undefined;
                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar avatar-sm">{user.avatar}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${user.role === 'BDE' ? 'badge-success' : 'badge-info'}`}>{user.role}</span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user.team || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <IndianRupee size={13} color="var(--text-muted)" />
                          <input
                            className="form-input"
                            type="number"
                            style={{ width: 140, height: 34 }}
                            value={getAmount(user.id)}
                            onChange={e => setAmounts(p => ({ ...p, [user.id]: e.target.value }))}
                            placeholder="e.g. 500000"
                          />
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {existing ? existing.setByName || '—' : '—'}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={!isDirty || saving[user.id]}
                          onClick={() => handleSave(user.id)}
                          style={{ opacity: !isDirty ? 0.4 : 1 }}
                        >
                          <Save size={13} /> {saving[user.id] ? 'Saving...' : 'Save'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {eligibleUsers.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No eligible users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {activeTab === 'history' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
            <select className="form-select" style={{ width: 200 }} value={historyUser} onChange={e => setHistoryUser(e.target.value)}>
              <option value="All">All Users</option>
              {eligibleUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Period</th>
                  <th>Target Amount</th>
                  <th>Set By</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar avatar-sm">{t.userAvatar}</div>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{t.userName}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${t.userRole === 'BDE' ? 'badge-success' : 'badge-info'}`}>{t.userRole}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.userTeam || '—'}</td>
                    <td style={{ fontSize: 13 }}>{MONTHS[t.month - 1]} {t.year}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>₹{t.amount.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.setByName || '—'}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(t.updatedAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
                {historyData.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>No target history found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
