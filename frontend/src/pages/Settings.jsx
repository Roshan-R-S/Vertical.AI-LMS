import { useState } from 'react';
import {
  Plus, Edit2, Trash2, X, CheckCircle, GripVertical,
  ChevronDown, ChevronRight, ToggleLeft, Shield, Brain, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContextCore';

const TYPE_CONFIG = {
  positive: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
  neutral:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)' },
  negative: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   border: 'rgba(239,68,68,0.3)' },
};

function DispositionModal({ disposition, milestone, milestones, onClose, onSave }) {
  const [form, setForm] = useState(disposition || {
    milestoneId: milestone?.id || milestones[0]?.id || '',
    name: '', description: '', type: 'neutral', isActive: true
  });

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-sm animate-slideUp">
        <div className="modal-header">
          <h2 className="modal-title">{disposition ? 'Edit Disposition' : 'Add Disposition'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Milestone *</label>
            <select className="form-select" value={form.milestoneId} onChange={e => setForm(p => ({ ...p, milestoneId: e.target.value }))}>
              {milestones.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Disposition Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Call Connected" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" style={{ minHeight: 60 }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of this disposition..." />
          </div>
          <div className="form-group">
            <label className="form-label">Status Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['positive', 'neutral', 'negative'].map(type => {
                const cfg = TYPE_CONFIG[type];
                return (
                  <button key={type} onClick={() => setForm(p => ({ ...p, type }))}
                    style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1px solid ${form.type === type ? cfg.color : 'var(--border-subtle)'}`, background: form.type === type ? cfg.bg : 'var(--bg-input)', color: form.type === type ? cfg.color : 'var(--text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize' }}>
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Active
              <label className="toggle">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                <span className="toggle-slider" />
              </label>
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { if (form.name) { onSave(form); onClose(); } }}>
            <CheckCircle size={15} /> {disposition ? 'Save' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MilestoneRow({ milestone, dispositions, onAddDis, onEditDis, onToggleDis, onDeleteDis }) {
  const [expanded, setExpanded] = useState(true);
  const misDis = dispositions.filter(d => d.milestoneId === milestone.id);

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
      {/* Milestone header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', cursor: 'pointer', borderBottom: expanded ? '1px solid var(--border-subtle)' : 'none', transition: 'background 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-glass-light)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: milestone.color, flexShrink: 0 }} />
        <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{milestone.name}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '2px 10px', borderRadius: 20, border: '1px solid var(--border-subtle)' }}>
          {misDis.length} disposition{misDis.length !== 1 ? 's' : ''}
        </span>
        <button className="btn btn-ghost btn-sm btn-icon" onClick={e => { e.stopPropagation(); onAddDis(milestone); }}
          style={{ color: milestone.color }} title="Add disposition">
          <Plus size={14} />
        </button>
        {expanded ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
      </div>

      {/* Dispositions list */}
      {expanded && (
        <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {misDis.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              No dispositions yet. <button onClick={() => onAddDis(milestone)} style={{ background: 'none', border: 'none', color: milestone.color, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Add one</button>
            </div>
          ) : misDis.map(dis => {
            const cfg = TYPE_CONFIG[dis.type] || TYPE_CONFIG.neutral;
            return (
              <div key={dis.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-surface)', borderRadius: 10, border: `1px solid ${dis.isActive ? 'var(--border-subtle)' : 'rgba(71,85,105,0.3)'}`, opacity: dis.isActive ? 1 : 0.5, transition: 'all 0.2s' }}>
                <GripVertical size={14} color="var(--text-muted)" style={{ cursor: 'grab', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{dis.name}</span>
                    {dis.isDefault && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', color: 'var(--brand-primary-light)', border: '1px solid rgba(99,102,241,0.3)' }}>Default</span>}
                  </div>
                  {dis.description && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{dis.description}</div>}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, textTransform: 'capitalize', flexShrink: 0 }}>
                  {dis.type}
                </span>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <label className="toggle" style={{ cursor: 'pointer' }} title={dis.isActive ? 'Disable' : 'Enable'}>
                    <input type="checkbox" checked={dis.isActive} onChange={() => onToggleDis(dis.id)} />
                    <span className="toggle-slider" />
                  </label>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={() => onEditDis(dis)}><Edit2 size={13} /></button>
                  {!dis.isDefault && (
                    <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--brand-danger)' }} onClick={() => window.confirm('Are you sure you want to delete this disposition?') && onDeleteDis(dis.id)}><Trash2 size={13} /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Settings() {
  const { 
    milestones, dispositions, addDisposition, updateDisposition, toggleDisposition, deleteDisposition,
    addMilestone, updateMilestone, deleteMilestone,
    settings, updateSettings,
    sources, addSource, deleteSource
  } = useApp();
  const [showAddDis, setShowAddDis] = useState(false);
  const [editDis, setEditDis] = useState(null);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [activeTab, setActiveTab] = useState('dispositions');
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [editingMilestone, setEditingMilestone] = useState(null);
  const [newSourceName, setNewSourceName] = useState('');

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Disposition management & system configuration</p>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="badge badge-primary"><Shield size={10} /> Super Admin Only</span>
        </div>
      </div>

      <div className="tabs mb-6">
        {['dispositions', 'milestones', 'sources', 'workflow', 'system'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {/* ===== DISPOSITIONS ===== */}
      {activeTab === 'dispositions' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Disposition Management</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {dispositions.length} total dispositions across {milestones.length} milestones
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { setSelectedMilestone(null); setShowAddDis(true); }}>
                <Plus size={14} /> Add Disposition
              </button>
            </div>

            {milestones.map(milestone => (
              <MilestoneRow
                key={milestone.id}
                milestone={milestone}
                dispositions={dispositions}
                onAddDis={(m) => { setSelectedMilestone(m); setShowAddDis(true); }}
                onEditDis={(d) => setEditDis(d)}
                onToggleDis={toggleDisposition}
                onDeleteDis={deleteDisposition}
              />
            ))}
          </div>

          {/* Right panel - stats & AI */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Disposition Stats</div>
              {[
                { label: 'Total Dispositions', value: dispositions.length, color: '#6366f1' },
                { label: 'Active', value: dispositions.filter(d => d.isActive).length, color: '#10b981' },
                { label: 'Positive Type', value: dispositions.filter(d => d.type === 'positive').length, color: '#10b981' },
                { label: 'Neutral Type', value: dispositions.filter(d => d.type === 'neutral').length, color: '#f59e0b' },
                { label: 'Negative Type', value: dispositions.filter(d => d.type === 'negative').length, color: '#ef4444' },
                { label: 'Custom', value: dispositions.filter(d => !d.isDefault).length, color: '#8b5cf6' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
                <Brain size={16} color="var(--brand-primary-light)" /> AI Integration
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Auto-suggest dispositions based on call transcript & sentiment analysis.
              </div>
              {[
                { key: 'autoTagDisposition', label: 'Auto-Tag Disposition' },
                { key: 'sentimentBasedRouting', label: 'Sentiment-based Routing' },
                { key: 'forceManualOverride', label: 'Force Manual Override' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                  <label className="toggle">
                    <input type="checkbox" 
                      checked={settings[item.key] || false} 
                      onChange={e => updateSettings({ [item.key]: e.target.checked })} 
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== MILESTONES ===== */}
      {activeTab === 'milestones' && (
        <div style={{ maxWidth: 700 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Pipeline Milestones</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Define and order the primary stages of your sales pipeline. These are fixed stages that structure the lead journey.</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {milestones.map((m, i) => (
              editingMilestone?.id === m.id ? (
                // Inline edit form
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: 'var(--bg-card)', border: `1px solid ${m.color}50`, borderRadius: 12 }}>
                  <input
                    className="form-input"
                    value={editingMilestone.name}
                    onChange={e => setEditingMilestone(p => ({ ...p, name: e.target.value }))}
                    style={{ flex: 1, height: 36 }}
                    autoFocus
                  />
                  <input
                    type="color"
                    value={editingMilestone.color}
                    onChange={e => setEditingMilestone(p => ({ ...p, color: e.target.value }))}
                    style={{ width: 36, height: 36, padding: 2, borderRadius: 6, border: '1px solid var(--border-subtle)', cursor: 'pointer', background: 'var(--bg-surface)' }}
                  />
                  <button className="btn btn-primary btn-sm" onClick={() => {
                    if (editingMilestone.name.trim()) {
                      updateMilestone(editingMilestone.id, { name: editingMilestone.name.trim(), color: editingMilestone.color });
                      setEditingMilestone(null);
                    }
                  }}>
                    <CheckCircle size={13} /> Save
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setEditingMilestone(null)}>
                    <X size={13} />
                  </button>
                </div>
              ) : (
                // Normal row
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'var(--bg-card)', border: `1px solid ${m.color}25`, borderRadius: 12, borderLeft: `4px solid ${m.color}` }}>
                  <GripVertical size={16} color="var(--text-muted)" style={{ cursor: 'grab' }} />
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${m.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: m.color }}>{i + 1}</div>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {dispositions.filter(d => d.milestoneId === m.id).length} dispositions
                  </span>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: m.color }} />
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    onClick={() => setEditingMilestone({ id: m.id, name: m.name, color: m.color })}
                    title="Edit milestone"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    style={{ color: 'var(--brand-danger)' }}
                    onClick={() => window.confirm(`Delete milestone "${m.name}"? This will fail if any leads are assigned to it.`) && deleteMilestone(m.id)}
                    title="Delete milestone"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input className="form-input" placeholder="New milestone name..." value={newMilestoneName} onChange={e => setNewMilestoneName(e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={() => { if (newMilestoneName.trim()) { addMilestone({ name: newMilestoneName, color: '#6366f1' }); setNewMilestoneName(''); } }}>
              <Plus size={15} /> Add Milestone
            </button>
          </div>
        </div>
      )}

      {/* ===== SOURCES ===== */}
      {activeTab === 'sources' && (
        <div style={{ maxWidth: 600 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Lead Sources</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Default sources cannot be deleted. Add custom sources for your team.</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {sources.map(source => (
              <div key={source.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10 }}>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{source.name}</span>
                {source.isDefault ? (
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}>Default</span>
                ) : (
                  <button
                    className="btn btn-ghost btn-sm btn-icon"
                    style={{ color: 'var(--brand-danger)' }}
                    onClick={() => window.confirm(`Delete source "${source.name}"?`) && deleteSource(source.id)}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input
              className="form-input"
              placeholder="New source name..."
              value={newSourceName}
              onChange={e => setNewSourceName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && newSourceName.trim() && addSource(newSourceName.trim()).then(() => setNewSourceName('')).catch(() => {})}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                if (newSourceName.trim()) {
                  addSource(newSourceName.trim()).then(() => setNewSourceName('')).catch(() => {});
                }
              }}
            >
              <Plus size={15} /> Add Source
            </button>
          </div>
        </div>
      )}

      {/* ===== WORKFLOW ===== */}
      {activeTab === 'workflow' && (
        <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Workflow Control</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Configure rules for lead stage transitions and mandatory disposition selection.</div>

          {[
            { key: 'forceDisposition', title: 'Force Disposition Selection', desc: 'Require BDE to select a disposition before moving a lead to next stage' },
            { key: 'blockStageSkipping', title: 'Block Stage Skipping', desc: 'Prevent leads from jumping multiple stages without going through each one' },
            { key: 'autoAdvanceOnCompletion', title: 'Auto-advance on Completion', desc: 'Automatically move lead to next stage when all sub-tasks are done' },
            { key: 'lockHistoricalData', title: 'Lock Historical Data', desc: 'Prevent editing of disposition data from past activities (recommended)' },
            { key: 'multipleDispositionsPerStage', title: 'Multiple Dispositions per Stage', desc: 'Allow attaching more than one disposition to a single stage interaction' },
            { key: 'emailAlertOnStageChange', title: 'Email Alert on Stage Change', desc: 'Notify TL via email when BDE moves a lead to a new stage' },
          ].map((rule, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 18px', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{rule.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{rule.desc}</div>
              </div>
              <label className="toggle" style={{ marginTop: 2 }}>
                <input type="checkbox" 
                  checked={settings[rule.key] || false} 
                  onChange={e => updateSettings({ [rule.key]: e.target.checked })} 
                />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>
      )}

      {/* ===== SYSTEM ===== */}
      {activeTab === 'system' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 900 }}>
          {[
            { group: 'AI Settings', items: [
              { key: 'autoLeadScoring', label: 'Auto Lead Scoring', sub: 'AI scores leads based on engagement' },
              { key: 'callTranscription', label: 'Call Transcription', sub: 'Transcribe all AI calls automatically' },
              { key: 'sentimentAnalysis', label: 'Sentiment Analysis', sub: 'Analyze call sentiment in real-time' },
              { key: 'aiDispositionSuggest', label: 'AI Disposition Suggest', sub: 'Suggest disposition from transcript' },
            ]},
            { group: 'Notifications', items: [
              { key: 'followUpReminders', label: 'Follow-up Reminders', sub: 'Alert BDE for pending follow-ups' },
              { key: 'dealRiskAlerts', label: 'Deal Risk Alerts', sub: 'Notify TL when deal goes cold' },
              { key: 'invoiceDueAlerts', label: 'Invoice Due Alerts', sub: 'Finance team gets payment reminders' },
              { key: 'renewalAlerts', label: 'Renewal Alerts', sub: 'Notify account manager 30 days before' },
            ]},
          ].map((section, si) => (
            <div key={si} className="card">
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} color="var(--brand-primary-light)" /> {section.group}
              </div>
              {section.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < section.items.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.sub}</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" 
                      checked={settings[item.key] || false} 
                      onChange={e => updateSettings({ [item.key]: e.target.checked })} 
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {showAddDis && (
        <DispositionModal
          milestone={selectedMilestone}
          milestones={milestones}
          onClose={() => { setShowAddDis(false); setSelectedMilestone(null); }}
          onSave={addDisposition}
        />
      )}
      {editDis && (
        <DispositionModal
          disposition={editDis}
          milestones={milestones}
          onClose={() => setEditDis(null)}
          onSave={d => updateDisposition(editDis.id, d)}
        />
      )}
    </div>
  );
}
