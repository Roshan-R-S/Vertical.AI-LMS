import { useState } from 'react';
import {
  Plus, Search, Edit2, X, CheckCircle, Shield,
  UserCheck, User, Eye, EyeOff, Lock, Trash2, Handshake,
  Users as UsersIcon, Check
} from 'lucide-react';
import { useApp } from '../context/AppContextCore';
import Pagination from '../components/Pagination';


const ROLE_CONFIG = {
  'Super Admin':     { color: '#6366f1', bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.3)',  icon: Shield },
  'Team Lead':       { color: '#06b6d4', bg: 'rgba(6,182,212,0.15)',   border: 'rgba(6,182,212,0.3)',   icon: UserCheck },
  'BDE':             { color: '#10b981', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.3)',  icon: User },
  'Channel Partner': { color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', icon: Handshake },
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
    name: '', email: '', phone: '', role: 'BDE', teamId: '', status: 'active', monthlyTarget: 500000
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
    } catch (err) {
      // Error is handled by addTeam in AppContext (shows alert)
      console.error('Failed to create team:', err);
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

          {form.role === 'BDE' && (
            <div className="form-group">
              <label className="form-label">Monthly Target (₹)</label>
              <input
                className="form-input"
                type="number"
                value={form.monthlyTarget ?? 500000}
                onChange={e => setForm(p => ({ ...p, monthlyTarget: Number(e.target.value) }))}
              />
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
              avatar: form.name.split(' ').map(n => n[0]).join('').toUpperCase(),
              ...(form.role === 'BDE' && { monthlyTarget: form.monthlyTarget ?? 500000 }),
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
  const perms = PERMISSIONS[role] || {};
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
  const { currentUser, users, addUser, updateUser, toggleUserStatus, deleteUser } = useApp();
  const isSuperAdmin = currentUser?.role === 'Super Admin' || currentUser?.role === 'SUPER_ADMIN';
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Super Admin');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);


  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    
    // Robust role matching for both display strings and enum values
    const matchRole = filterRole === 'All' || 
      u.role === filterRole || 
      (filterRole === 'Super Admin' && u.role === 'SUPER_ADMIN') ||
      (filterRole === 'Team Lead' && u.role === 'TEAM_LEAD') ||
      (filterRole === 'BDE' && u.role === 'BDE') ||
      (filterRole === 'Channel Partner' && u.role === 'CHANNEL_PARTNER');
      
    return matchSearch && matchRole;
  });

  const teamMap = {};
  users.filter(u => u.role === 'Team Lead').forEach(tl => {
    teamMap[tl.teamId] = users.filter(u => u.teamId === tl.teamId && u.role === 'BDE').length;
  });

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} users • {users.filter(u => u.status === 'active').length} active</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={15} /> Create User</button>
      </div>

      {/* Role stats */}
      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
          const count = users.filter(u => 
            u.role === role || 
            (role === 'Super Admin' && u.role === 'SUPER_ADMIN') ||
            (role === 'Team Lead' && u.role === 'TEAM_LEAD') ||
            (role === 'BDE' && u.role === 'BDE') ||
            (role === 'Channel Partner' && u.role === 'CHANNEL_PARTNER')
          ).length;
          const Icon = cfg.icon;
          return (
            <div key={role} className="studio-card" onClick={() => setFilterRole(filterRole === role ? 'All' : role)} style={{ cursor: 'pointer', border: filterRole === role ? `1px solid ${cfg.color}` : undefined }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="card-icon-wrapper" style={{ background: cfg.bg, margin: 0 }}><Icon size={18} color={cfg.color} /></div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 300, color: cfg.color, lineHeight: 1 }}>{count}</div>
                  <div className="card-title" style={{ fontSize: 13, margin: 0, marginTop: 4 }}>{role}s</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid-main-sidebar">
        {/* Users Table */}
        <div className="table-wrapper">
          <div className="table-header">
            <div className="search-wrapper">
              <Search className="search-icon" size={15} />
              <input className="search-input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              {['All', 'Super Admin', 'Team Lead', 'BDE', 'Channel Partner'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Team</th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(user => {

                const cfg = ROLE_CONFIG[user.role];
                const Icon = cfg?.icon || User;
                return (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar avatar-sm" style={{ background: user.status === 'inactive' ? 'var(--bg-surface)' : 'var(--gradient-brand)', color: user.status === 'inactive' ? 'var(--text-muted)' : 'white' }}>{user.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: cfg?.bg, color: cfg?.color, border: `1px solid ${cfg?.border}` }}>
                        <Icon size={10} />{user.role}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.team || '—'}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.lastLogin}</td>
                    <td>
                      <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditUser(user)}><Edit2 size={14} /></button>
                        <button 
                          className="btn btn-ghost btn-sm btn-icon" 
                          onClick={() => toggleUserStatus(user.id)} 
                          title={user.id === currentUser?.id ? 'Cannot deactivate yourself' : (user.status === 'active' ? 'Disable' : 'Enable')} 
                          style={{ 
                            color: user.status === 'active' ? 'var(--brand-danger)' : 'var(--brand-success)',
                            opacity: user.id === currentUser?.id ? 0.3 : 1,
                            cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer'
                          }}
                          disabled={user.id === currentUser?.id}
                        >
                          {user.status === 'active' ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        {isSuperAdmin && (
                          <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => deleteUser(user.id)}
                            title={user.id === currentUser?.id ? 'Cannot delete yourself' : 'Delete user'}
                            style={{ color: 'var(--brand-danger)', opacity: user.id === currentUser?.id ? 0.3 : 1, cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer' }}
                            disabled={user.id === currentUser?.id}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination 
            total={filtered.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
          />
        </div>


        {/* Right panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Team hierarchy */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <UsersIcon size={16} color="var(--brand-primary-light)" /> Team Hierarchy
            </div>
            {users.filter(u => u.role === 'Team Lead').map(tl => {
              const bdes = users.filter(u => u.teamId === tl.teamId && u.role === 'BDE');
              return (
                <div key={tl.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(6,182,212,0.08)', borderRadius: 8, border: '1px solid rgba(6,182,212,0.2)', marginBottom: 6 }}>
                    <div className="avatar avatar-sm" style={{ background: 'rgba(6,182,212,0.3)', fontSize: 10, color: '#22d3ee' }}>{tl.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{tl.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{tl.team} • TL • {teamMap[tl.teamId] || 0} BDEs</div>
                    </div>
                  </div>
                  {bdes.map(bde => (
                    <div key={bde.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 24px', marginBottom: 4 }}>
                      <div style={{ width: 20, height: 1, background: 'var(--border-subtle)', marginRight: 4 }} />
                      <div className="avatar avatar-sm" style={{ width: 24, height: 24, fontSize: 9 }}>{bde.avatar}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{bde.name}</div>
                      <span className={`badge ${bde.status === 'active' ? 'badge-success' : 'badge-neutral'}`} style={{ marginLeft: 'auto', fontSize: 9 }}>{bde.status}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Permissions */}
          <div className="card">
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={16} color="var(--brand-primary-light)" /> Role Permissions
            </div>
            <div className="tabs mb-4" style={{ gap: 2 }}>
              {Object.keys(ROLE_CONFIG).map(role => (
                <button key={role} className={`tab ${selectedRole === role ? 'active' : ''}`} style={{ fontSize: 11, padding: '6px 10px', textTransform: 'none' }} onClick={() => setSelectedRole(role)}>{role}</button>
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
