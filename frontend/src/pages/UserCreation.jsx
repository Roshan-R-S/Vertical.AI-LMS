import { useState } from 'react';
import {
  Plus, Search, Edit2, X, CheckCircle, Shield,
  UserCheck, User, ToggleLeft, ToggleRight, Eye, EyeOff,
  Lock, Users as UsersIcon, Map
} from 'lucide-react';
import { useApp } from '../context/AppContextCore';
import Pagination from '../components/Pagination';


const ROLE_CONFIG = {
  'Super Admin': { color: '#6366f1', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', icon: Shield },
  'Team Lead': { color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)', icon: UserCheck },
  'BDE': { color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', icon: User },
};

const PERMISSIONS = {
  'Super Admin': { dashboard: ['view', 'export'], leads: ['view', 'edit', 'delete', 'assign'], clients: ['view', 'edit', 'delete'], users: ['view', 'create', 'edit', 'disable'], billing: ['view', 'create', 'edit'], settings: ['view', 'edit'] },
  'Team Lead': { dashboard: ['view'], leads: ['view', 'edit', 'assign'], clients: ['view', 'edit'], users: ['view'], billing: ['view'], settings: ['view'] },
  'BDE': { dashboard: ['view'], leads: ['view', 'edit'], clients: ['view'], users: [], billing: [], settings: [] },
};

function UserModal({ user, onClose, onSave, allUsers }) {
  const [form, setForm] = useState(user || {
    name: '', email: '', phone: '', role: 'BDE', teamId: '', status: 'active'
  });

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
              <select className="form-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                {['Super Admin', 'Team Lead', 'BDE'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          {(form.role === 'BDE' || form.role === 'Team Lead') && (
            <div className="form-group">
              <label className="form-label">{form.role === 'BDE' ? 'Reporting Team Lead / Team' : 'Assign to Team'}</label>
              <select className="form-select" value={form.teamId} onChange={e => setForm(p => ({ ...p, teamId: e.target.value }))}>
                <option value="">Select Team</option>
                {/* Extract unique teams from existing users */}
                {Array.from(new Set(allUsers.map(u => u.teamId).filter(Boolean))).map(tId => {
                  const teamName = allUsers.find(u => u.teamId === tId)?.team;
                  return <option key={tId} value={tId}>{teamName || tId}</option>;
                })}
              </select>
            </div>
          )}

          {!user && (
            <div className="form-group">
              <label className="form-label">Temporary Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type="text" value="Vertical@123" readOnly style={{ background: 'var(--bg-surface)', cursor: 'not-allowed', paddingRight: 40 }} />
                <Lock size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>User will be prompted to change on first login</p>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { 
            const payload = { 
              ...form, 
              avatar: form.name.split(' ').map(n => n[0]).join('').toUpperCase() 
            };
            if (!user) payload.password = 'Vertical@123';
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(perms).map(([module, actions]) => (
          <div key={module} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: 100, fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{module}</div>
            <div style={{ display: 'flex', gap: 6, flex: 1 }}>
              {['view', 'create', 'edit', 'delete', 'assign'].map(action => (
                <span key={action} style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: actions.includes(action) ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.08)', color: actions.includes(action) ? '#34d399' : 'var(--text-muted)', border: `1px solid ${actions.includes(action) ? 'rgba(16,185,129,0.3)' : 'var(--border-subtle)'}` }}>
                  {actions.includes(action) ? '✓' : '✗'} {action}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UserCreation() {
  const { currentUser, users, addUser, updateUser, toggleUserStatus } = useApp();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Super Admin');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);


  const filtered = users.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'All' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const teamMap = {};
  users.filter(u => u.role === 'Team Lead').forEach(tl => {
    teamMap[tl.team] = users.filter(u => u.team === tl.team && u.role === 'BDE').length;
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
      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
          const count = users.filter(u => u.role === role).length;
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
              {['All', 'Super Admin', 'Team Lead', 'BDE'].map(r => <option key={r}>{r}</option>)}
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
              const bdes = users.filter(u => u.team === tl.team && u.role === 'BDE');
              return (
                <div key={tl.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(6,182,212,0.08)', borderRadius: 8, border: '1px solid rgba(6,182,212,0.2)', marginBottom: 6 }}>
                    <div className="avatar avatar-sm" style={{ background: 'rgba(6,182,212,0.3)', fontSize: 10, color: '#22d3ee' }}>{tl.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{tl.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{tl.team} • TL</div>
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
