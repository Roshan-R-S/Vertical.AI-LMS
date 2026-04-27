import { Bell, Clock, LayoutDashboard, LogOut, Moon, Rocket, Settings, Sun, UserCheck, Users as UsersIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContextCore';

export default function CPSidebar() {
  const { currentUser, theme, toggleTheme, logout, notifications } = useApp();
  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{ paddingTop: 0, paddingBottom: 16 }}>
        <div className="sidebar-brand">
          <span style={{ fontSize: 18, fontWeight: 500 }}>Vertical LMS</span>
        </div>
      </div>

      <div className="sidebar-content">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ marginBottom: 8 }}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        <NavLink to="/cp-work-queue" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Clock size={18} /> My Work Queue
        </NavLink>

        <NavLink to="/cp-leads" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <UsersIcon size={18} /> My Leads
        </NavLink>

        <NavLink to="/cp-pipeline" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Rocket size={18} /> Pipeline
        </NavLink>

        <NavLink to="/cp-clients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <UserCheck size={18} /> My Clients
        </NavLink>

        <NavLink to="/cp-tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ marginTop: 8 }}>
          <Clock size={18} /> Tasks
        </NavLink>

        <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <Bell size={18} /> Notifications
          </div>
          {unread > 0 && (
            <span style={{ background: 'var(--color-danger)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>
              {unread}
            </span>
          )}
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', marginTop: 12, borderRadius: 20, background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar avatar-sm" style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: 11, fontWeight: 700 }}>
              {currentUser.avatar}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{currentUser.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Channel Partner</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={toggleTheme} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <button onClick={logout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
