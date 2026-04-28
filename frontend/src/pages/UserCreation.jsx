import {
    Check,
    CheckCircle,
    Edit2,
    Eye, EyeOff,
    Handshake,
    Lock,
    Plus, Search,
    Shield,
    Trash2,
    User,
    UserCheck,
    Users as UsersIcon,
    X
} from 'lucide-react';
import { useState } from 'react';
import { EmptyState, PageLoader } from '../components/LoadingSpinner';
import Pagination from '../components/Pagination';
import { useApp } from '../context/AppContextCore';


const ROLE_CONFIG = {
  'Super Admin':     { color: '#6366f1', bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.3)',  icon: Shield },
  'Team Lead':       { color: '#06b6d4', bg: 'rgba(6,182,212,0.15)',   border: 'rgba(6,182,212,0.3)',   icon: UserCheck },
  'BDE':             { color: '#10b981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.3)',  icon: User },
  'Channel Partner': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', icon: Handshake },
};

// Normalize role name for lookup
const normalizeRole = (role) => {
  if (!role) return 'BDE';
  const r = role.toLowerCase().replace('_', ' ');
  if (r.includes('super')) return 'Super Admin';
  if (r.includes('team lead') || r.includes('lead')) return 'Team Lead';
  if (r.includes('bde')) return 'BDE';
  if (r.includes('channel') || r.includes('partner')) return 'Channel Partner';
  return 'BDE';
};

const PERMISSIONS = {
  'Super Admin':     { dashboard: ['view', 'export'], leads: ['view', 'edit', 'delete', 'assign'], clients: ['view', 'edit', 'delete'], users: ['view', 'create', 'edit', 'disable'], billing: ['view', 'create', 'edit'], settings: ['view', 'edit'] },
  'Team Lead':       { dashboard: ['view'], leads: ['view', 'edit', 'assign'], clients: ['view', 'edit'], users: ['view'], billing: ['view'], settings: ['view'] },
  'BDE':             { dashboard: ['view'], leads: ['view', 'edit'], clients: ['view'], users: [], billing: [], settings: [] },
  'Channel Partner': { dashboard: ['view'], leads: ['view', 'edit'], clients: ['view'], users: [], billing: [], settings: [] },
};

function UserModal({ user, onClose, onSave, allUsers }) {
  const { teams, addTeam } = useApp();
  const [form, setForm] = useState(user || {
    name: '', email: '', phone: '', role: 'BDE', teamId: '', status: 'active'
  });
  const [newTeamName, setNewTeamName] = useState('');
  const [showNewTeam, setShowNewTeam] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setCreatingTeam(true);
    try {
      const team = await addTeam(newTeamName.trim());
      setForm(p => ({ ...p, teamId: team.id }));
      setNewTeamName('');
      setShowNewTeam(false);
    } catch (error) {
      console.error('Failed to create team:', error);
    }
    finally { setCreatingTeam(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp">
        <div className="modal-header">
          <h2 className="modal-title">{user ? 'Edit User' : 'Create User'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Neha Singh" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="neha@vertical.ai" />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value, teamId: '' }))}>
                {['Super Admin', 'Team Lead', 'BDE', 'Channel Partner'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {(form.role === 'BDE' || form.role === 'Team Lead') && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="form-label" style={{ margin: 0 }}>
                  {form.role === 'BDE' ? 'Assign to Team' : 'Assign to Team'}
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewTeam(v => !v)}
                  style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--brand-primary-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                >
                  <Plus size={12} /> New Team
                </button>
              </div>

              {showNewTeam ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className="form-input"
                    placeholder="e.g. Team Alpha"
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreateTeam()}
                    autoFocus
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleCreateTeam}
                    disabled={creatingTeam || !newTeamName.trim()}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {creatingTeam ? '...' : 'Create'}
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setShowNewTeam(false); setNewTeamName(''); }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <select className="form-select" value={form.teamId} onChange={e => setForm(p => ({ ...p, teamId: e.target.value }))}>
                  <option value="">Select Team</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}

              {teams.length === 0 && !showNewTeam && (
                <p style={{ fontSize: 11, color: '#f59e0b', marginTop: 6 }}>
                  No teams yet. Click "+ New Team" to create one.
                </p>
              )}
            </div>
          )}

          {!user && (
            <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '12px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>
              A welcome email with a <strong>Set Password</strong> link will be sent to this user. The link expires in <strong>5 minutes</strong>.
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => {
            if (!form.name || !form.email) return alert('Name and email are required');
            const payload = {
              name: form.name,
              email: form.email,
              phone: form.phone,
              role: form.role,
              teamId: form.teamId,
              avatar: form.name.split(' ').map(n => n[0]).join('').toUpperCase()
            };
            onSave(payload);
            onClose();
          }}>
            <CheckCircle size={15} /> {user ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PermissionsPanel({ role }) {
  const normRole = normalizeRole(role);
  const perms = PERMISSIONS[normRole] || {};
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 12 }}>Permissions for {role}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 14px', marginBottom: 4 }}>
          <div style={{ width: 90, fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Module</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, flex: 1, textAlign: 'center' }}>
            {['View', 'Create', 'Edit', 'Delete', 'Assign'].map(h => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>
        </div>

        {Object.entries(perms).map(([module, actions]) => (
          <div key={module} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: 90, fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{module}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, flex: 1 }}>
              {['view', 'create', 'edit', 'delete', 'assign'].map(action => {
                const hasPerm = actions.includes(action);
                return (
                  <div key={action} style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: hasPerm ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.05)',
                      color: hasPerm ? '#10b981' : '#ef4444',
                      fontSize: 10,
                      border: `1px solid ${hasPerm ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.1)'}`
                    }}>
                      {hasPerm ? <Check size={10} /> : <X size={10} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserCreation() {
  const { currentUser, users, addUser, updateUser, toggleUserStatus, deleteUser, loading } = useApp();
  const isSuperAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'SUPER_ADMIN';
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Super Admin');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (loading) return <PageLoader text="Loading users..." />;

  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'All' || normalizeRole(u.role) === filterRole;
    return matchSearch && matchRole;
  });

  const teamMap = {};
  users.filter(u => normalizeRole(u.role) === 'Team Lead').forEach(tl => {
    teamMap[tl.teamId] = users.filter(u => u.teamId === tl.teamId && normalizeRole(u.role) === 'BDE').length;
  });

  return (
    <div className="animate-fadeIn" style={{ width: '100%', padding: '0 24px 24px 24px' }}>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 32, fontWeight: 500, color: '#1f2937' }}>User Management</h1>
          <p className="page-subtitle" style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {users.length} users • {users.filter(u => u.status === 'active').length} active
          </p>
        </div>
      </div>

      <button 
        className="btn" 
        onClick={() => setShowAdd(true)}
        style={{ 
          background: '#1a1f2e', 
          color: 'white', 
          padding: '10px 20px', 
          borderRadius: 24, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 8, 
          border: 'none',
          marginBottom: 32,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        <Plus size={18} /> Create User
      </button>

      {/* Role stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 40 }}>
        {[
          { role: 'Super Admin', label: 'Super Admins', icon: Shield, color: '#6366f1', bg: '#f5f3ff' },
          { role: 'Team Lead', label: 'Team Leads', icon: User, color: '#06b6d4', bg: '#ecfeff' },
          { role: 'BDE', label: 'BDEs', icon: User, color: '#10b981', bg: '#f0fdf4' },
        ].map(card => {
          const count = users.filter(u => normalizeRole(u.role) === card.role).length;
          const Icon = card.icon;
          return (
            <div 
              key={card.role} 
              className="studio-card" 
              onClick={() => setFilterRole(filterRole === card.role ? 'All' : card.role)}
              style={{ 
                cursor: 'pointer', 
                padding: '24px',
                background: 'white',
                border: filterRole === card.role ? `2px solid ${card.color}` : '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: 20
              }}
            >
              <div style={{ background: card.bg, padding: 12, borderRadius: 12 }}>
                <Icon size={24} color={card.color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 300, color: '#1f2937' }}>{count}</span>
                <span style={{ fontSize: 15, color: '#64748b', fontWeight: 500 }}>{card.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid-main-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
        <div>
          {/* Search & Filter Row */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div className="search-wrapper" style={{ flex: 1, height: 44, background: 'white', border: '1px solid #f1f5f9', borderRadius: 12 }}>
              <Search className="search-icon" size={18} color="#94a3b8" />
              <input 
                className="search-input" 
                placeholder="Search users..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                style={{ fontSize: 14 }}
              />
            </div>
            <select 
              className="form-select" 
              style={{ width: 140, height: 44, borderRadius: 12, border: '1px solid #f1f5f9', fontSize: 14, padding: '0 16px' }}
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
            >
              {['All', 'Super Admin', 'Team Lead', 'BDE', 'Channel Partner'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="table-wrapper" style={{ background: 'white', borderRadius: 16, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
            <table className="table">
              <thead style={{ background: '#fcfdfe' }}>
                <tr>
                  <th style={{ padding: '16px 24px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>User</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>Team</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>Territory</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>Last Login</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '16px 24px', fontSize: 12, color: '#64748b', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(user => {
                  const normRole = normalizeRole(user.role);
                  const cfg = ROLE_CONFIG[normRole];
                  return (
                    <tr key={user.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="avatar" style={{ width: 40, height: 40, background: '#f1f5f9', color: '#64748b', fontSize: 14, fontWeight: 600 }}>{user.avatar}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{user.name}</div>
                            <div style={{ fontSize: 12, color: '#94a3b8' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ 
                          display: 'inline-block', 
                          padding: '4px 16px', 
                          borderRadius: 20, 
                          fontSize: 12, 
                          fontWeight: 600, 
                          background: cfg?.bg, 
                          color: cfg?.color,
                          border: `1px solid ${cfg?.border}`
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px', fontSize: 14, color: '#64748b' }}>{user.team || '—'}</td>
                      <td style={{ padding: '20px 24px', fontSize: 14, color: '#64748b' }}>{user.territory || 'All India'}</td>
                      <td style={{ padding: '20px 24px', fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>{user.lastLogin || '2026-04-22 09:00'}</td>
                      <td style={{ padding: '20px 24px' }}>
                        <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: 11, padding: '4px 12px' }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div className="table-actions">
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditUser(user)}><Edit2 size={16} /></button>
                          <button className="btn btn-ghost btn-sm btn-icon" onClick={() => toggleUserStatus(user.id)} disabled={user.id === currentUser?.id}><EyeOff size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination 
            total={filtered.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>

        {/* Right Sidebar */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1f2937', marginBottom: 20 }}>Team Hierarchy</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {users.filter(u => normalizeRole(u.role) === 'Team Lead').map(tl => {
              const bdes = users.filter(u => u.teamId === tl.teamId && normalizeRole(u.role) === 'BDE');
              return (
                <div key={tl.id}>
                  <div style={{ 
                    background: '#e0f2fe', 
                    borderRadius: 12, 
                    padding: '12px 16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12,
                    marginBottom: 12
                  }}>
                    <div className="avatar avatar-sm" style={{ background: '#7dd3fc', color: '#0369a1', fontSize: 10 }}>{tl.avatar}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0369a1' }}>{tl.name}</div>
                      <div style={{ fontSize: 11, color: '#0ea5e9' }}>{tl.team || 'Team Alpha'} • TL</div>
                    </div>
                  </div>
                  {bdes.map(bde => (
                    <div key={bde.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 16px', position: 'relative' }}>
                      <div style={{ width: 12, height: 1, background: '#e2e8f0', marginLeft: 16 }} />
                      <div className="avatar" style={{ width: 24, height: 24, fontSize: 9, background: '#f1f5f9', color: '#64748b' }}>{bde.avatar}</div>
                      <div style={{ fontSize: 12, color: '#475569', flex: 1 }}>{bde.name}</div>
                      <span style={{ fontSize: 10, color: bde.status === 'active' ? '#10b981' : '#94a3b8', fontWeight: 600 }}>{bde.status}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 40 }}>
             <div style={{ fontWeight: 700, fontSize: 15, color: '#1f2937', marginBottom: 20 }}>Role Permissions</div>
             <div className="tabs" style={{ marginBottom: 16 }}>
               {['Super Admin', 'Team Lead', 'BDE'].map(r => (
                 <button 
                  key={r} 
                  className={`tab ${selectedRole === r ? 'active' : ''}`} 
                  onClick={() => setSelectedRole(r)}
                  style={{ fontSize: 12, padding: '8px 12px' }}
                 >
                   {r}
                 </button>
               ))}
             </div>
             <PermissionsPanel role={selectedRole} />
          </div>
        </div>
      </div>

      {showAdd && <UserModal onClose={() => setShowAdd(false)} onSave={addUser} allUsers={users} />}
      {editUser && <UserModal user={editUser} onClose={() => setEditUser(null)} onSave={d => updateUser(editUser.id, d)} allUsers={users} />}
    </div>
  );
}

