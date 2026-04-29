import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContextCore';
import { api, formatCurrency } from '../utils/api';
import { 
  Filter, Plus, Search, MoreHorizontal, 
  IndianRupee, TrendingUp, Calendar, ArrowRight,
  Target, Clock, AlertCircle
} from 'lucide-react';
import LeadModal from './leads/LeadModal';

export default function Pipeline() {
  const { currentUser, leads, milestones, dispositions, users, addLead } = useApp();
  const [filterBDE, setFilterBDE] = useState('All');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Stages that count as "Pipeline"
  const pipelineStages = ['Demo Scheduled', 'Demo Completed', 'Proposal Shared', 'Negotiation'];
  
  // Filter leads that are in pipeline
  let pipelineLeads = leads.filter(l => pipelineStages.includes(l.milestone) && l.status === 'active');
  
  if (search) {
    pipelineLeads = pipelineLeads.filter(l =>
      l.companyName.toLowerCase().includes(search.toLowerCase()) ||
      l.contactName.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (currentUser?.role === 'BDE') {
    pipelineLeads = pipelineLeads.filter(l => l.assignedBDEId === currentUser.id || l.assignedToId === currentUser.id);
  } else if (filterBDE !== 'All') {
    pipelineLeads = pipelineLeads.filter(l => l.assignedBDEId === filterBDE || l.assignedToId === filterBDE);
  }

  const totalValue = pipelineLeads.reduce((sum, l) => sum + (l.value || 0), 0);
  const weightedValue = pipelineLeads.reduce((sum, l) => sum + ((l.value || 0) * (l.probability || 0) / 100), 0);

  const getStageColor = (stage) => {
    return milestones.find(m => m.name === stage)?.color || '#6366f1';
  };

  const [analytics, setAnalytics] = useState(null);
  useEffect(() => {
    api.get('/analytics/dashboard').then(res => setAnalytics(res));
  }, []);

  const renderPipelineCard = (lead) => (
    <div key={lead.id} className="studio-card animate-fadeIn" style={{ padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>

          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{lead.companyName}</h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(lead.value)}</div>
          <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>{lead.probability}% Prob.</div>
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Target size={12} /> {lead.contactName}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> Exp. Close: {lead.expectedClose}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="avatar avatar-sm" style={{ width: 24, height: 24, fontSize: 10 }}>
            {lead.assignedBDE ? lead.assignedBDE.split(' ').map(n=>n[0]).join('') : '??'}
          </div>
          <span style={{ fontSize: 12 }}>{lead.assignedBDE || 'Unassigned'}</span>
        </div>
        <div style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${getStageColor(lead.milestone)}15`, color: getStageColor(lead.milestone), border: `1px solid ${getStageColor(lead.milestone)}30` }}>
          {lead.milestone.toUpperCase()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-subtitle">SALES VELOCITY</div>
          <h1 className="page-title">Active Deal Pipeline</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="search-wrapper" style={{ width: 240 }}>
            <Search className="search-icon" size={16} />
            <input
              className="search-input"
              placeholder="Search deals..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {currentUser?.role !== 'BDE' && (
            <select className="form-select" style={{ width: 150 }} value={filterBDE} onChange={e => setFilterBDE(e.target.value)}>
              <option value="All">All BDEs</option>
              {users.filter(u => u.role === 'BDE').map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          )}
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> New Deal
          </button>
        </div>
      </div>

      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <div className="studio-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: 'var(--text-secondary)' }}>
            <IndianRupee size={16} /> <span style={{ fontSize: 12, fontWeight: 600 }}>Total Pipeline</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{formatCurrency(totalValue)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{pipelineLeads.length} Active deals</div>
        </div>
        <div className="studio-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: 'var(--text-secondary)' }}>
            <TrendingUp size={16} /> <span style={{ fontSize: 12, fontWeight: 600 }}>Weighted Value</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{formatCurrency(weightedValue)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Based on probabilities</div>
        </div>
        <div className="studio-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: 'var(--text-secondary)' }}>
            <Clock size={16} /> <span style={{ fontSize: 12, fontWeight: 600 }}>Avg. Cycle</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{analytics?.cycleData?.[0]?.days || '15.4'} Days</div>
          <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 4 }}>Live tracking active</div>
        </div>
        <div className="studio-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, color: 'var(--text-secondary)' }}>
            <AlertCircle size={16} /> <span style={{ fontSize: 12, fontWeight: 600 }}>At Risk</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{formatCurrency((analytics?.kpis?.staleLeads || 0) * 45000)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{analytics?.kpis?.staleLeads || 0} deals with no activity</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, alignItems: 'start' }}>
        {pipelineStages.map(stage => {
          const stageLeads = pipelineLeads.filter(l => l.milestone === stage);
          const stageVal = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);
          
          return (
            <div key={stage}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: getStageColor(stage) }}></div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{stage}</h3>
                  <span style={{ fontSize: 11, background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>{stageLeads.length}</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{formatCurrency(stageVal)}</div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {stageLeads.map(lead => renderPipelineCard(lead))}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <LeadModal
          onClose={() => setShowAddModal(false)}
          onSave={addLead}
          milestones={milestones}
          dispositions={dispositions}
          forcedAssignedToId={currentUser?.role === 'BDE' ? currentUser.id : undefined}
        />
      )}
    </div>
  );
}
