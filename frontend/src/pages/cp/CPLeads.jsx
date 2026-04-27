import { useState } from 'react';
import { useApp } from '../../context/AppContextCore';
import { Plus, Search, Eye, Edit2, Trash2, Upload } from 'lucide-react';
import Pagination from '../../components/Pagination';
import LeadModal from '../leads/LeadModal';
import InteractionModal from '../leads/InteractionModal';
import ImportModal from '../leads/ImportModal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const MILESTONE_COLORS = {
  'New': '#6366f1', 'First Call': '#06b6d4', 'Demo Scheduled': '#8b5cf6',
  'Demo Completed': '#f59e0b', 'Demo Postponed': '#f97316', 'Proposal Shared': '#3b82f6',
  'PS & Dropped': '#94a3b8', 'Negotiation': '#ec4899', 'Deal Closed': '#10b981', 'Not Interested': '#ef4444',
};

export default function CPLeads() {
  const { currentUser, leads, milestones, dispositions, interactions, addLead, updateLead, deleteLead, addInteraction, bulkAddLeads } = useApp();

  // CP only sees their own leads
  const myLeads = leads.filter(l => l.assignedToId === currentUser.id);

  // Always assign to self — backend enforces this too, but we set it explicitly
  const cpAddLead = (leadData) => addLead({ ...leadData, assignedToId: currentUser.id });
  const cpBulkAdd = (rows) => bulkAddLeads(rows.map(r => ({ ...r, assignedToId: currentUser.id })));

  const [search, setSearch] = useState('');
  const [filterMilestone, setFilterMilestone] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [viewLead, setViewLead] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filtered = myLeads.filter(l => {
    const matchSearch = !search || l.companyName.toLowerCase().includes(search.toLowerCase()) || l.contactName.toLowerCase().includes(search.toLowerCase());
    const matchMilestone = filterMilestone === 'All' || l.milestone === filterMilestone;
    return matchSearch && matchMilestone;
  });

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Leads</h1>
          <p className="page-subtitle">{myLeads.length} total • {myLeads.filter(l => l.status === 'active').length} active</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowImportModal(true)} icon={<Upload size={14} />}>Import CSV</Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} icon={<Plus size={15} />}>Add Lead</Button>
        </div>
      </div>

      {/* Milestone quick stats */}
      <div className="milestones-container thin-scrollbar mb-6">
        <div onClick={() => setFilterMilestone('All')} className={`milestone-card ${filterMilestone === 'All' ? 'active' : ''}`}>
          <div className="text-lg font-bold mb-0.5">{myLeads.length}</div>
          <div className="text-xxs text-[#64748b] font-medium">All Leads</div>
        </div>
        {milestones.map(m => {
          const count = myLeads.filter(l => l.milestoneId === m.id).length;
          return (
            <div key={m.id} onClick={() => setFilterMilestone(filterMilestone === m.name ? 'All' : m.name)}
              className={`milestone-card ${filterMilestone === m.name ? 'active' : ''}`}
              style={{ borderColor: filterMilestone === m.name ? m.color : undefined }}>
              <div className="text-lg font-bold mb-0.5" style={{ color: m.color }}>{count}</div>
              <div className="text-xxs text-[#64748b] font-medium">{m.name}</div>
            </div>
          );
        })}
      </div>

      <div className="table-wrapper">
        <div className="table-header">
          <div className="search-wrapper">
            <Search className="search-icon" size={15} />
            <input className="search-input" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Lead</th><th>Contact</th><th>Source</th><th>Stage</th>
              <th>Disposition</th><th>Value</th><th>Score</th><th>Priority</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(lead => (
              <tr key={lead.id} className="hover-row">
                <td>
                  <div className="font-semibold text-sm">{lead.companyName}</div>
                  <div className="text-xs text-muted">{lead.createdAt}</div>
                </td>
                <td>
                  <div className="text-sm">{lead.contactName}</div>
                  <div className="text-xs text-muted">{lead.email}</div>
                </td>
                <td><Badge>{lead.source}</Badge></td>
                <td>
                  <Badge variant="primary" style={{ background: `${MILESTONE_COLORS[lead.milestone]}20`, color: MILESTONE_COLORS[lead.milestone], borderColor: `${MILESTONE_COLORS[lead.milestone]}40` }}>
                    {lead.milestone}
                  </Badge>
                </td>
                <td className="text-sm text-secondary font-medium">{lead.disposition || 'Not Contacted'}</td>
                <td className="font-bold text-sm">₹{(lead.value / 1000).toFixed(0)}K</td>
                <td><span className={`font-bold text-sm ${lead.score >= 80 ? 'text-[#10b981]' : lead.score >= 60 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>{lead.score}</span></td>
                <td><Badge variant={lead.priority === 'High' ? 'danger' : lead.priority === 'Medium' ? 'warning' : 'neutral'}>{lead.priority}</Badge></td>
                <td>
                  <div className="table-actions">
                    <Button variant="ghost" size="sm" iconOnly onClick={() => setViewLead(lead)} icon={<Eye size={14} />} />
                    <Button variant="ghost" size="sm" iconOnly onClick={() => setEditLead(lead)} icon={<Edit2 size={14} />} />
                    <Button variant="ghost" size="sm" iconOnly className="text-brand-danger"
                      onClick={() => window.confirm(`Delete "${lead.companyName}"?`) && deleteLead(lead.id)}
                      icon={<Trash2 size={14} />} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination total={filtered.length} pageSize={pageSize} currentPage={currentPage}
          onPageChange={setCurrentPage} onPageSizeChange={s => { setPageSize(s); setCurrentPage(1); }} />
      </div>

      {showAddModal && <LeadModal onClose={() => setShowAddModal(false)} onSave={cpAddLead} milestones={milestones} dispositions={dispositions} forcedAssignedToId={currentUser.id} />}
      {editLead && <LeadModal lead={editLead} onClose={() => setEditLead(null)} onSave={d => updateLead(editLead.id, d)} milestones={milestones} dispositions={dispositions} forcedAssignedToId={currentUser.id} />}
      {viewLead && <InteractionModal lead={viewLead} interactions={interactions} onClose={() => setViewLead(null)} onAdd={addInteraction} />}
      {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} onImport={async d => { await cpBulkAdd(d); setShowImportModal(false); }} />}
    </div>
  );
}
