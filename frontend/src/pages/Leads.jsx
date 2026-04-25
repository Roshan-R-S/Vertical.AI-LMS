import { useState } from 'react';
import {
  Plus, Search, Filter, Eye, Edit2, Trash2, Phone, Mail,
  MessageSquare, Calendar, Star, Upload, ChevronDown,
  ArrowUpRight, Mic, Brain, TrendingUp, X, CheckCircle,
  GripVertical
} from 'lucide-react';
import { useApp } from '../context/AppContextCore';
import Pagination from '../components/Pagination';
import { 
  DndContext, 
  useDraggable, 
  useDroppable, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';


const MILESTONE_COLORS = {
  'New': '#6366f1', 'Contacted': '#06b6d4', 'Qualified': '#8b5cf6',
  'Demo': '#f59e0b', 'Proposal': '#3b82f6', 'Negotiation': '#ec4899',
  'Won': '#10b981', 'Lost': '#ef4444'
};

function DraggableCard({ lead, onView }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
    cursor: 'grab',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="kanban-card"
      onClick={(e) => {
        // Prevent click if we were dragging
        if (transform && (Math.abs(transform.x) > 5 || Math.abs(transform.y) > 5)) return;
        onView(lead);
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{lead.companyName}</div>
        <GripVertical size={14} color="var(--text-muted)" />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>{lead.contactName}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>₹{(lead.value / 1000).toFixed(0)}K</span>
        <span style={{ 
          fontSize: 10, 
          fontWeight: 700, 
          color: lead.score >= 80 ? '#10b981' : '#f59e0b', 
          background: 'rgba(255,255,255,0.05)', 
          padding: '2px 6px', 
          borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {lead.score}
        </span>
      </div>
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 11, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
        <span>By: {lead.assignedTo?.name || 'Unassigned'}</span>
        <span style={{ opacity: 0.7 }}>{lead.source}</span>
      </div>
    </div>
  );
}

function DroppableColumn({ milestone, children, count }) {
  const { setNodeRef, isOver } = useDroppable({
    id: milestone.id,
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`kanban-column ${isOver ? 'is-over' : ''}`}
      style={{ 
        background: isOver ? 'rgba(255,255,255,0.05)' : 'var(--bg-surface)', 
        borderRadius: 16, 
        padding: 16, 
        minWidth: 300, 
        flex: '0 0 auto', 
        border: `1px solid ${isOver ? milestone.color : 'var(--border-subtle)'}`,
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ color: milestone.color, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: milestone.color, boxShadow: `0 0 10px ${milestone.color}` }}></div> 
          {milestone.name}
        </span>
        <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{count}</span>
      </div>
      <div style={{ minHeight: 500 }}>
        {children}
      </div>
    </div>
  );
}

function LeadModal({ lead, onClose, onSave, milestones, dispositions }) {
  const { currentUser, users, convertLead } = useApp();
  const [isCustomSource, setIsCustomSource] = useState(false);
  const [showConvertConfirm, setShowConvertConfirm] = useState(false);
  const [convertText, setConvertText] = useState('');
  
  // Filter for BDEs only
  const bdeUsers = users.filter(u => u.role === 'BDE');
  
  const [form, setForm] = useState(lead ? {
    ...lead,
    // Ensure we have IDs for the dropdowns
    assignedToId: lead.assignedBDEId || lead.assignedToId
  } : {
    companyName: '', contactName: '', email: '', phone: '', source: 'Website',
    assignedToId: '', milestone: 'New', disposition: 'Not Contacted',
    value: '', priority: 'Medium', notes: '', tags: []
  });


  const milestoneDis = dispositions.filter(d => {
    const m = milestones.find(m => m.name === form.milestone);
    return d.milestoneId === m?.id && d.isActive;
  });

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-slideUp">
        <div className="modal-header">
          <h2 className="modal-title">{lead ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input className="form-input" value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} placeholder="TechNova Solutions" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Person *</label>
              <input className="form-input" value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))} placeholder="Suresh Reddy" />
            </div>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Lead Source</label>
                {currentUser?.role === 'Super Admin' && (
                  <button 
                    type="button"
                    className="btn btn-ghost btn-sm" 
                    style={{ padding: '0 4px', height: 'auto', fontSize: 10, color: 'var(--accent-blue)', background: 'transparent', border: 'none' }}
                    onClick={() => setIsCustomSource(!isCustomSource)}
                  >
                    {isCustomSource ? '← Select' : '+ Add New'}
                  </button>
                )}
              </div>
              {isCustomSource ? (
                <input 
                  className="form-input" 
                  value={form.source} 
                  onChange={e => setForm(p => ({ ...p, source: e.target.value }))} 
                  placeholder="Enter source name"
                  autoFocus
                />
              ) : (
                <select className="form-select" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
                  {['Website', 'LinkedIn', 'Google Ads', 'Referral', 'Cold Call', 'Partner', 'API'].map(s => <option key={s}>{s}</option>)}
                </select>
              )}
            </div>

          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="contact@company.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 99001 12345" />
            </div>
          </div>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Milestone</label>
              <select className="form-select" value={form.milestone} onChange={e => setForm(p => ({ ...p, milestone: e.target.value }))}>
                {milestones.map(m => <option key={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Disposition</label>
              <select className="form-select" value={form.disposition} onChange={e => setForm(p => ({ ...p, disposition: e.target.value }))}>
                {milestoneDis.map(d => <option key={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                {['High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Deal Value (₹)</label>
              <input className="form-input" type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="150000" />
            </div>
            <div className="form-group">
              <label className="form-label">Assign BDE *</label>
              <select 
                className="form-select" 
                value={form.assignedToId} 
                onChange={e => setForm(p => ({ ...p, assignedToId: e.target.value }))}
                required
              >
                <option value="">Select BDE</option>
                {bdeUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Add notes about this lead..." />
          </div>

          {lead && form.milestone === 'Deal Closed' && lead.status !== 'won' && (
            <div style={{ marginTop: 24, padding: 20, background: 'rgba(16,185,129,0.05)', borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: '#10b981', fontSize: 14 }}>Ready to finalize?</h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Converting will create a permanent Client profile and move this lead to 'Won'.</p>
                </div>
                {!showConvertConfirm ? (
                  <button className="btn btn-primary" onClick={() => setShowConvertConfirm(true)}>
                    Convert to Client
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input 
                      className="form-input" 
                      style={{ width: 120, height: 36, textTransform: 'uppercase', fontSize: 12 }} 
                      placeholder="TYPE CONVERT" 
                      value={convertText}
                      onChange={e => setConvertText(e.target.value)}
                    />
                    <button 
                      className="btn btn-primary" 
                      style={{ height: 36 }}
                      disabled={convertText.toUpperCase() !== 'CONVERT'}
                      onClick={async () => {
                        try {
                          await convertLead(lead.id);
                          alert('Lead successfully converted to Client!');
                          onClose();
                        } catch { /* handled in context */ }
                      }}
                    >
                      Confirm
                    </button>
                    <button className="btn btn-ghost" style={{ height: 36 }} onClick={() => { setShowConvertConfirm(false); setConvertText(''); }}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { 
            if (!form.assignedToId) return alert("Please assign a BDE");
            onSave(form); 
            onClose(); 
          }}>
            <CheckCircle size={15} /> {lead ? 'Update Lead' : 'Create Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}

function InteractionModal({ lead, interactions, onClose, onAdd }) {
  const [tab, setTab] = useState('logs');
  const [form, setForm] = useState({ type: 'call', direction: 'outbound', summary: '', by: '' });
  const leadInteractions = interactions.filter(i => i.leadId === lead.id);

  const typeIcons = { call: Phone, email: Mail, whatsapp: MessageSquare, meeting: Calendar };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-slideUp">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{lead.companyName}</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{lead.contactName} • {lead.phone}</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {/* Lead stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { l: 'Stage', v: lead.milestone, c: MILESTONE_COLORS[lead.milestone] },
              { l: 'Source', v: lead.source, c: '#06b6d4' },
              { l: 'Score', v: lead.score, c: lead.score >= 80 ? '#10b981' : '#f59e0b' },
              { l: 'Value', v: `₹${(lead.value/1000).toFixed(0)}K`, c: '#6366f1' },
              { l: 'Priority', v: lead.priority, c: lead.priority === 'High' ? '#ef4444' : '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: '10px 14px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>{s.l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: s.c, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={s.v}>{s.v}</div>
              </div>
            ))}
          </div>

          <div className="tabs mb-4">
            {['logs', 'add log', 'ai insights'].map(t => (
              <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
            ))}
          </div>

          {tab === 'logs' && (
            <div className="timeline">
              {leadInteractions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-title">No interactions yet</div>
                </div>
              ) : leadInteractions.map((int, i) => {
                const Icon = typeIcons[int.type] || Phone;
                return (
                  <div key={i} className="timeline-item">
                    <div className="timeline-icon" style={{ borderColor: MILESTONE_COLORS['Contacted'] }}>
                      <Icon size={14} color={MILESTONE_COLORS['Contacted']} />
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">{int.type.charAt(0).toUpperCase() + int.type.slice(1)} • {int.direction || ''}</div>
                      <div className="timeline-meta">{int.date} • {int.by} {int.duration && `• ${int.duration}`}</div>
                      <div className="timeline-body">{int.summary}</div>
                      {int.transcript && (
                        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                          <span className="badge badge-primary"><Mic size={10} /> Transcript</span>
                          <span className="badge badge-info"><Brain size={10} /> AI Summary</span>
                          <span className={`badge ${int.sentiment === 'positive' ? 'badge-success' : 'badge-neutral'}`}>
                            {int.sentiment}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'add log' && (
            <div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    {['call', 'email', 'whatsapp', 'meeting'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Direction</label>
                  <select className="form-select" value={form.direction} onChange={e => setForm(p => ({ ...p, direction: e.target.value }))}>
                    <option>outbound</option><option>inbound</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">By</label>
                <input className="form-input" value={form.by} onChange={e => setForm(p => ({ ...p, by: e.target.value }))} placeholder="Your name" />
              </div>
              <div className="form-group">
                <label className="form-label">Summary / Notes</label>
                <textarea className="form-textarea" value={form.summary} onChange={e => setForm(p => ({ ...p, summary: e.target.value }))} placeholder="What happened in this interaction?" />
              </div>
              <button className="btn btn-primary w-full" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { onAdd({ ...form, leadId: lead.id }); setTab('logs'); }}>
                <CheckCircle size={15} /> Log Interaction
              </button>
            </div>
          )}

          {tab === 'ai insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: Brain, label: 'Lead Score Analysis', value: `Score: ${lead.score}/100 — ${lead.score >= 80 ? 'High intent buyer. Recommend expedite proposal.' : 'Medium intent. Needs nurturing with value props.'}`, color: '#6366f1' },
                { icon: TrendingUp, label: 'Conversion Probability', value: `${lead.probability}% probability to close. Expected by ${lead.expectedClose}.`, color: '#10b981' },
                { icon: MessageSquare, label: 'Sentiment Trend', value: 'Recent interactions show positive sentiment. Lead is engaged and responsive.', color: '#06b6d4' },
                { icon: Star, label: 'AI Recommendation', value: 'Schedule a follow-up call within 2 days. Share case study from EdTech vertical.', color: '#f59e0b' },
              ].map((insight, i) => (
                <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 16, border: '1px solid var(--border-subtle)', display: 'flex', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${insight.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <insight.icon size={16} color={insight.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{insight.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{insight.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Leads() {
  const { leads, milestones, dispositions, interactions, addLead, updateLead, deleteLead, addInteraction, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [filterMilestone, setFilterMilestone] = useState('All');
  const [filterSource, setFilterSource] = useState('All');
  const [filterBde, setFilterBde] = useState(currentUser?.role === 'BDE' ? currentUser.name : 'All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [viewLead, setViewLead] = useState(null);
  const [dateRange, setDateRange] = useState('All');
  const [customDates, setCustomDates] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState('table'); // table | kanban
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // DND Configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id;
    const newMilestoneId = over.id;
    const lead = leads.find(l => l.id === leadId);
    const milestone = milestones.find(m => m.id === newMilestoneId);
    
    if (lead && lead.milestoneId !== newMilestoneId) {
      if (window.confirm(`Move "${lead.companyName}" to stage: ${milestone.name}?`)) {
        updateLead(leadId, { milestoneId: newMilestoneId });
      }
    }
  };

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.companyName.toLowerCase().includes(search.toLowerCase()) || l.contactName.toLowerCase().includes(search.toLowerCase());
    const matchMilestone = filterMilestone === 'All' || l.milestone === filterMilestone;
    const matchSource = filterSource === 'All' || l.source === filterSource;
    const matchBde = filterBde === 'All' || l.assignedTo?.name === filterBde;
    
    // Simple date filtering
    let matchDate = true;
    if (dateRange !== 'All') {
      const leadDate = l.createdAt;
      const today = new Date().toISOString().split('T')[0];
      if (dateRange === 'Today') matchDate = leadDate === today;
      else if (dateRange === 'Custom' && customDates.start && customDates.end) {
        matchDate = leadDate >= customDates.start && leadDate <= customDates.end;
      }
    }

    return matchSearch && matchMilestone && matchSource && matchBde && matchDate;
  });

  const sources = ['All', ...new Set(leads.map(l => l.source).filter(Boolean))];
  const bdes = ['All', ...new Set(leads.map(l => l.assignedTo?.name).filter(Boolean))];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads</h1>
          <p className="page-subtitle">{leads.length} total leads • {leads.filter(l => l.status === 'active').length} active</p>
        </div>
        <div className="flex gap-2 items-center">
          <button className="btn btn-secondary btn-sm"><Upload size={14} /> Import CSV</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}><Plus size={15} /> Add Lead</button>
        </div>
      </div>

      {/* Milestone quick stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        <div onClick={() => setFilterMilestone('All')}
             style={{ flex: '0 0 auto', background: filterMilestone === 'All' ? 'rgba(255,255,255,0.1)' : 'var(--bg-card)', border: `1px solid ${filterMilestone === 'All' ? 'var(--text-primary)' : 'var(--border-subtle)'}`, borderRadius: 12, padding: '10px 16px', cursor: 'pointer', transition: 'all 0.2s', minWidth: 90, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{leads.length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>All Leads</div>
        </div>
        {milestones.map(m => {
          const count = leads.filter(l => l.milestone === m.name).length;
          return (
            <div key={m.id} onClick={() => setFilterMilestone(filterMilestone === m.name ? 'All' : m.name)}
              style={{ flex: '0 0 auto', background: filterMilestone === m.name ? `${m.color}20` : 'var(--bg-card)', border: `1px solid ${filterMilestone === m.name ? m.color : 'var(--border-subtle)'}`, borderRadius: 12, padding: '10px 16px', cursor: 'pointer', transition: 'all 0.2s', minWidth: 90, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{count}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{m.name}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="table-wrapper">
        <div className="table-header">
          <div className="search-wrapper">
            <Search className="search-icon" size={15} />
            <input className="search-input" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }} value={filterSource} onChange={e => setFilterSource(e.target.value)}>
            <option value="All">Source: All</option>
            {sources.filter(s=>s!=='All').map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }} value={filterBde} onChange={e => setFilterBde(e.target.value)}>
            <option value="All">BDE: All</option>
            {bdes.filter(s=>s!=='All').map(s => <option key={s}>{s}</option>)}
          </select>

          <div style={{ display: 'flex', gap: 0, borderRadius: 8, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
            <div style={{ padding: '0 10px', borderRight: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', background: 'var(--bg-card)' }}>
              <Calendar size={13} color="var(--text-muted)" />
            </div>
            <select 
              className="form-select" 
              style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0 10px', fontSize: 13, height: 32 }} 
              value={dateRange} 
              onChange={e => setDateRange(e.target.value)}
            >
              <option value="All">All Time</option>
              {['Today', 'This Week', 'This Month', 'Custom'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          {dateRange === 'Custom' && (
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'var(--bg-card)', padding: '2px 10px', borderRadius: 8, border: '1px solid var(--border-default)' }}>
              <input type="date" className="form-input" style={{ width: 120, height: 28, fontSize: 11, padding: 4 }} value={customDates.start} onChange={e => setCustomDates(p => ({ ...p, start: e.target.value }))} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>-</span>
              <input type="date" className="form-input" style={{ width: 120, height: 28, fontSize: 11, padding: 4 }} value={customDates.end} onChange={e => setCustomDates(p => ({ ...p, end: e.target.value }))} />
            </div>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {['table', 'kanban'].map(m => (
              <button key={m} className={`btn btn-sm ${viewMode === m ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setViewMode(m)} style={{ textTransform: 'capitalize' }}>{m}</button>
            ))}
          </div>
        </div>

        {viewMode === 'table' ? (
          <table className="table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Contact</th>
                <th>Source</th>
                <th>Stage</th>
                <th>Disposition</th>
                <th>BDE</th>
                <th>Value</th>
                <th>Score</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(lead => (

                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{lead.companyName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Created on {lead.createdAt}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{lead.contactName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.email}</div>
                  </td>
                  <td><span className="badge badge-neutral">{lead.source}</span></td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${MILESTONE_COLORS[lead.milestone]}20`, color: MILESTONE_COLORS[lead.milestone], border: `1px solid ${MILESTONE_COLORS[lead.milestone]}40` }}>
                      {lead.milestone}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.disposition}</td>
                  <td style={{ fontSize: 13 }}>{lead.assignedTo?.name || 'Unassigned'}</td>
                  <td style={{ fontWeight: 700 }}>₹{(lead.value / 1000).toFixed(0)}K</td>
                  <td>
                    <span style={{ fontWeight: 700, color: lead.score >= 80 ? '#10b981' : lead.score >= 60 ? '#f59e0b' : '#ef4444', fontSize: 14 }}>{lead.score}</span>
                  </td>
                  <td>
                    <span className={`badge ${lead.priority === 'High' ? 'badge-danger' : lead.priority === 'Medium' ? 'badge-warning' : 'badge-neutral'}`}>
                      {lead.priority}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" title="View" onClick={() => setViewLead(lead)}><Eye size={14} /></button>
                      <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => setEditLead(lead)}><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-sm btn-icon" title="Delete" style={{ color: 'var(--brand-danger)' }} onClick={() => deleteLead(lead.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          // Kanban View
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', gap: 20, overflowX: 'auto', paddingBottom: 24, minHeight: 650, alignItems: 'flex-start' }}>
                {milestones.filter(m => !['Deal Closed', 'Not Interested'].includes(m.name)).map(m => {
                  const stageLeads = filtered.filter(l => l.milestoneId === m.id);
                  return (
                    <DroppableColumn key={m.id} milestone={m} count={stageLeads.length}>
                      {stageLeads.map(lead => (
                        <DraggableCard key={lead.id} lead={lead} onView={setViewLead} />
                      ))}
                    </DroppableColumn>
                  );
                })}
              </div>
            </div>
          </DndContext>
        )}
        
        {viewMode === 'table' && (
          <Pagination 
            total={filtered.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
          />
        )}
      </div>


      {showAddModal && <LeadModal onClose={() => setShowAddModal(false)} onSave={addLead} milestones={milestones} dispositions={dispositions} />}
      {editLead && <LeadModal lead={editLead} onClose={() => setEditLead(null)} onSave={d => updateLead(editLead.id, d)} milestones={milestones} dispositions={dispositions} />}
      {viewLead && <InteractionModal lead={viewLead} interactions={interactions} onClose={() => setViewLead(null)} onAdd={addInteraction} />}
    </div>
  );
}
