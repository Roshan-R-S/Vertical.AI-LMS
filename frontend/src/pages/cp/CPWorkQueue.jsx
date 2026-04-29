import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContextCore';
import { CheckCircle, Clock, Mail, MessageSquare, MoreHorizontal, Phone, Search, Star, X } from 'lucide-react';

export default function CPWorkQueue() {
  const { currentUser, leads, tasks, updateTask, fetchDashboard } = useApp();
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(true);
  const [openContactId, setOpenContactId] = useState(null);

  useEffect(() => { fetchDashboard('today').then(() => setLoading(false)); }, [fetchDashboard]);

  const myTasks = tasks.filter(t => t.assignedToId === currentUser.id);
  const myLeads = leads.filter(l => l.assignedBDEId === currentUser.id || l.assignedToId === currentUser.id);
  const today = new Date().toISOString().split('T')[0];

  const todayFollowUps = myTasks.filter(t => t.dueDate?.startsWith(today) && t.status === 'pending');
  const overdueFollowUps = myTasks.filter(t => t.status === 'overdue');
  const upcomingFollowUps = myTasks.filter(t => t.dueDate && t.dueDate.slice(0, 10) > today && t.status === 'pending');
  const callbackQueue = myLeads.filter(l => l.disposition === 'Callback Requested');
  const priorityLeads = myLeads.filter(l => l.priority === 'High' && l.status === 'active');

  const tabs = [
    { id: 'today', label: "Today's Work", count: todayFollowUps.length + callbackQueue.length },
    { id: 'overdue', label: 'Overdue', count: overdueFollowUps.length, color: '#ef4444' },
    { id: 'upcoming', label: 'Upcoming', count: upcomingFollowUps.length },
    { id: 'priority', label: 'Priority', count: priorityLeads.length },
  ];

  const renderCard = (item) => {
    const lead = leads.find(l => l.id === item.leadId) || item;
    return (
      <div key={item.id} className="studio-card animate-fadeIn" style={{ padding: '16px 20px', marginBottom: 12, borderLeft: `4px solid ${item.priority === 'High' ? '#ef4444' : '#6366f1'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{lead.companyName || item.title}</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Star size={12} /> {lead.contactName}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {lead.createdAt}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={12} /> {lead.disposition}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
            <button className="btn btn-ghost btn-sm" style={{ color: '#10b981' }} onClick={() => updateTask(item.id, { status: 'completed' })}>
              <CheckCircle size={18} />
            </button>
            <button className="btn btn-ghost btn-sm" style={{ padding: '6px' }} title="Contact Info"
              onClick={() => setOpenContactId(openContactId === item.id ? null : item.id)}>
              <MoreHorizontal size={18} />
            </button>
            {openContactId === item.id && (
              <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 100, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '14px 16px', minWidth: 220, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', marginTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Contact Info</span>
                  <button onClick={() => setOpenContactId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}><X size={14} /></button>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  {lead.contactName || '—'}
                  <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>{lead.companyName}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#10b981' }}>
                    <Phone size={14} /> {lead.phone || '—'}
                  </div>
                  <div onClick={() => window.open(`mailto:${lead.email}`)} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6366f1', cursor: 'pointer' }}>
                    <Mail size={14} /> {lead.email || '—'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}><div className="animate-pulse" style={{ color: 'var(--text-muted)' }}>Loading Work Queue...</div></div>;

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-subtitle">MY DAILY EXECUTION</div>
          <h1 className="page-title">Work Queue</h1>
        </div>
        <div className="search-wrapper" style={{ width: 300 }}>
          <Search className="search-icon" size={16} />
          <input className="search-input" placeholder="Search work queue..." />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '12px 20px', fontSize: 14, fontWeight: 600, background: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--brand-primary)' : '2px solid transparent', color: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            {tab.label}
            <span style={{ fontSize: 11, background: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--bg-surface)', color: activeTab === tab.id ? 'white' : 'var(--text-secondary)', padding: '2px 8px', borderRadius: 10 }}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 24, alignItems: 'start' }}>
        <div>
          {activeTab === 'today' && (
            <>
              {todayFollowUps.length > 0 && <div style={{ marginBottom: 24 }}><h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase' }}>Today's Follow-ups</h3>{todayFollowUps.map(t => renderCard(t))}</div>}
              {callbackQueue.length > 0 && <div><h3 style={{ fontSize: 13, fontWeight: 700, color: '#06b6d4', marginBottom: 16, textTransform: 'uppercase' }}>Callbacks</h3>{callbackQueue.map(l => renderCard(l))}</div>}
              {todayFollowUps.length === 0 && callbackQueue.length === 0 && <div className="studio-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}><CheckCircle size={48} style={{ marginBottom: 16, opacity: 0.2 }} /><p>All clear for today!</p></div>}
            </>
          )}
          {activeTab === 'overdue' && <div>{overdueFollowUps.length > 0 ? overdueFollowUps.map(t => renderCard(t)) : <p style={{ color: 'var(--text-muted)' }}>No overdue tasks.</p>}</div>}
          {activeTab === 'upcoming' && <div>{upcomingFollowUps.map(t => renderCard(t))}</div>}
          {activeTab === 'priority' && <div>{priorityLeads.map(l => renderCard(l))}</div>}
        </div>

        <div className="studio-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Queue Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Total Leads', value: myLeads.length, color: '#6366f1' },
              { label: 'Tasks Done', value: myTasks.filter(t => t.status === 'completed').length, color: '#10b981' },
              { label: 'Overdue', value: overdueFollowUps.length, color: '#ef4444' },
              { label: 'Upcoming', value: upcomingFollowUps.length, color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg-surface)', padding: 14, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
