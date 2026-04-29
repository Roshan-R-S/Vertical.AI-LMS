import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContextCore';
import { formatCurrency } from '../../utils/api';
import { api } from '../../utils/api';
import { Plus, Search, IndianRupee, TrendingUp, Clock, AlertCircle, Target, Calendar } from 'lucide-react';
import LeadModal from '../leads/LeadModal';

export default function CPPipeline() {
  const { currentUser, leads, milestones, dispositions, addLead } = useApp();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => { api.get('/analytics/dashboard').then(res => setAnalytics(res)).catch(() => {}); }, []);

  const pipelineStages = ['Demo Scheduled', 'Demo Completed', 'Proposal Shared', 'Negotiation'];
  let pipelineLeads = leads.filter(l =>
    pipelineStages.includes(l.milestone) &&
    l.status === 'active' &&
    l.assignedToId === currentUser.id
  );

  if (search) {
    pipelineLeads = pipelineLeads.filter(l =>
      l.companyName.toLowerCase().includes(search.toLowerCase()) ||
      l.contactName.toLowerCase().includes(search.toLowerCase())
    );
  }

  const totalValue = pipelineLeads.reduce((s, l) => s + (l.value || 0), 0);
  const weightedValue = pipelineLeads.reduce((s, l) => s + ((l.value || 0) * (l.probability || 0) / 100), 0);
  const getColor = (stage) => milestones.find(m => m.name === stage)?.color || '#6366f1';

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-subtitle">MY PIPELINE</div>
          <h1 className="page-title">Active Deal Pipeline</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="search-wrapper" style={{ width: 240 }}>
            <Search className="search-icon" size={16} />
            <input className="search-input" placeholder="Search deals..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><Plus size={16} /> New Deal</button>
        </div>
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Pipeline', value: formatCurrency(totalValue), sub: `${pipelineLeads.length} active deals`, icon: IndianRupee, color: '#6366f1' },
          { label: 'Weighted Value', value: formatCurrency(weightedValue), sub: 'Probability adjusted', icon: TrendingUp, color: '#10b981' },
          { label: 'Avg. Cycle', value: `${analytics?.cycleData?.[0]?.days || '—'} Days`, sub: 'Live tracking', icon: Clock, color: '#06b6d4' },
          { label: 'At Risk', value: `${analytics?.kpis?.staleLeads || 0}`, sub: 'No activity', icon: AlertCircle, color: '#ef4444' },
        ].map((kpi, i) => (
          <div key={i} className="studio-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: 'var(--text-secondary)' }}>
              <kpi.icon size={16} /> <span style={{ fontSize: 12, fontWeight: 600 }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
        {pipelineStages.map(stage => {
          const stageLeads = pipelineLeads.filter(l => l.milestone === stage);
          const stageVal = stageLeads.reduce((s, l) => s + (l.value || 0), 0);
          return (
            <div key={stage}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: getColor(stage) }} />
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{stage.split(' ')[0]}</h3>
                  <span style={{ fontSize: 11, background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>{stageLeads.length}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{formatCurrency(stageVal)}</div>
              </div>
              {stageLeads.map(lead => (
                <div key={lead.id} className="studio-card animate-fadeIn" style={{ padding: 20, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700 }}>{lead.companyName}</h3>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{formatCurrency(lead.value)}</div>
                      <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>{lead.probability}%</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Target size={12} /> {lead.contactName}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {lead.expectedClose}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {showAddModal && <LeadModal onClose={() => setShowAddModal(false)} onSave={addLead} milestones={milestones} dispositions={dispositions} forcedAssignedToId={currentUser.id} />}
    </div>
  );
}
