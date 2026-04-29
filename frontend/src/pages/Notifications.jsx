import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContextCore';
import { Bell, Info, AlertTriangle, CheckCircle, Clock, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle size={18} color="#f59e0b" />;
      case 'danger': return <AlertTriangle size={18} color="#ef4444" />;
      case 'success': return <CheckCircle size={18} color="#10b981" />;
      default: return <Info size={18} color="#6366f1" />;
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <button 
            className="btn btn-ghost btn-sm" 
            onClick={() => navigate(-1)} 
            style={{ marginBottom: 12, paddingLeft: 0, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <div className="page-subtitle">STAY UPDATED</div>
          <h1 className="page-title">Notifications</h1>
        </div>
      </div>

      <div className="studio-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Recent Alerts</span>
          <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={markAllNotificationsRead}>Mark all as read</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {notifications && notifications.length > 0 ? (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => {
                  if (!notif.isRead) markNotificationRead(notif.id);
                  if (notif.link) navigate(notif.link);
                }}
                style={{ 
                  padding: '20px 24px', 
                  borderBottom: '1px solid var(--border-subtle)', 
                  display: 'flex', 
                  gap: 16, 
                  alignItems: 'flex-start', 
                  transition: 'background 0.2s', 
                  cursor: notif.link ? 'pointer' : (notif.isRead ? 'default' : 'pointer'),
                  background: notif.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.03)' 
                }} 
                className="hover-bg"
              >
                <div style={{ padding: 8, borderRadius: 10, background: 'var(--bg-surface)', position: 'relative' }}>
                  {getIcon(notif.type)}
                  {!notif.isRead && (
                    <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: '#6366f1', border: '2px solid var(--bg-surface)' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.4 }}>{notif.text}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                    <Clock size={12} /> {notif.time}
                    {notif.link && <span style={{ color: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', gap: 4 }}>· Tap to view <ArrowRight size={11} /></span>}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
              <Bell size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
              <p>No new notifications.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
