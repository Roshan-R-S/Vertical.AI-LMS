import { Bell, ChevronDown, ChevronRight, Clock, LayoutDashboard, LogOut, Moon, Rocket,
        Settings, Sun, UserCheck, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../../context/AppContextCore';

export default function Sidebar() {
  const { currentUser, theme, toggleTheme, logout, notifications } = useApp();
  const [openSection, setOpenSection] = useState('Core');

  const isAdmin = currentUser.role === 'Super Admin';
  const isTL = currentUser.role === 'Team Lead';
  const isBDE = currentUser.role === 'BDE';

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{ paddingTop: 0, paddingBottom: 16 }}>
        <div className="sidebar-brand">
          <span style={{ fontSize: 18, fontWeight: 500 }}>Vertical LMS</span>
        </div>
      </div>

      <div className="sidebar-content">
        
        {/* Dashboard First */}
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ marginBottom: 16 }}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>

        {(isAdmin || isTL) && (
          <>
            {/* Nav Group 1 for Admins/TLs */}
            <div className="nav-section">
              <div className="nav-section-label" onClick={() => toggleSection('Core')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Rocket size={18} /> Core</span>
                {openSection === 'Core' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {openSection === 'Core' && (
                <div style={{ marginLeft: 24, paddingLeft: 8, borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <NavLink to="/leads" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 12px', fontSize: 12 }}>Leads</NavLink>
                  <NavLink to="/pipeline" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 12px', fontSize: 12 }}>Pipeline</NavLink>
                  <NavLink to="/clients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 12px', fontSize: 12 }}>Clients</NavLink>
                  <NavLink to="/tasks" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 12px', fontSize: 12 }}>Tasks & Follow-ups</NavLink>
                  {isAdmin && <NavLink to="/partners" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 12px', fontSize: 12 }}>Channel Partners</NavLink>}
                </div>
              )}
            </div>

            {/* Nav Group 2 */}
            <div className="nav-section">
              <div className="nav-section-label" onClick={() => toggleSection('Management')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}><UserCheck size={18} /> Management</span>
                {openSection === 'Management' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
              {openSection === 'Management' && (
                <div style={{ marginLeft: 24, paddingLeft: 8, borderLeft: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <NavLink to="/team" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 12px', fontSize: 12 }}>Team Performance</NavLink>
                  <NavLink to="/leaderboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 12px', fontSize: 12 }}>Leaderboards</NavLink>
                  {isAdmin && <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 12px', fontSize: 12 }}>User Creation</NavLink>}
                  {isAdmin && <NavLink to="/billing" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ padding: '8px 12px', fontSize: 12 }}>Billing</NavLink>}
                </div>
              )}
            </div>
          </>
        )}

        {isBDE && (
          <>
            <NavLink to="/work-queue" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Clock size={18} /> My Work Queue
            </NavLink>
            <NavLink to="/leads" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <UsersIcon size={18} /> Leads
            </NavLink>
            <NavLink to="/pipeline" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Rocket size={18} /> Pipeline
            </NavLink>
            <NavLink to="/clients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <UserCheck size={18} /> Clients
            </NavLink>
          </>
        )}

          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ marginTop: 16 }}>
            <Settings size={18} /> Settings
          </NavLink>


        <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} style={{ marginTop: (isAdmin || isTL) ? 0 : 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <Bell size={18} /> Notifications
          </div>
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span style={{ 
              background: 'var(--color-danger)', 
              color: 'white', 
              fontSize: 10, 
              fontWeight: 700, 
              padding: '2px 6px', 
              borderRadius: 10,
              minWidth: 18,
              textAlign: 'center'
            }}>
              {notifications.filter(n => !n.isRead).length}
            </span>
          )}
        </NavLink>


      </div>

      <div className="sidebar-footer">
        {/* Profile & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', marginTop: 12, borderRadius: 20, background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="avatar avatar-sm" style={{ width: 28, height: 28, background: 'var(--text-primary)', color: 'var(--bg-page)', fontSize: 11, fontWeight: 700 }}>
              {currentUser.avatar}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{currentUser.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{currentUser.role}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={toggleTheme} title="Toggle Theme" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
              {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
            </button>
            <button onClick={logout} title="Log out" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
