import { useState } from 'react';
import { useApp } from '../context/AppContextCore';
import { Users, Handshake, ArrowRight, Building, MapPin } from 'lucide-react';
import Pagination from '../components/Pagination';


import { formatCurrency } from '../utils/formatCurrency';

export default function ChannelPartners() {
  const { leads, users, updateLead } = useApp();
  
  // Filter for Channel Partner leads that aren't closed yet
  const partnerLeads = leads.filter(l => l.source === 'Partner' && l.status !== 'won' && l.status !== 'lost');
  
  const tls = users.filter(u => u.role === 'TEAM_LEAD');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);


  const handleAssignToTL = (leadId, tlId) => {
    if (!tlId) {
      // "Hold" selected — unassign by setting back to first available admin or keep as is
      return;
    }
    updateLead(leadId, { assignedToId: tlId });
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-subtitle">PARTNER NETWORK</div>
          <h1 className="page-title">Channel Partner Leads</h1>
        </div>
      </div>

      <div className="studio-card" style={{ padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(90deg, rgba(99,102,241,0.05) 0%, rgba(99,102,241,0) 100%)', borderLeft: '4px solid #6366f1' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Handshake size={24} color="#6366f1" />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Partner Distribution Hub</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Review inbound leads from channel partners and natively assign them to Team Leads for BDE distribution.</div>
        </div>
      </div>

      {partnerLeads.length === 0 ? (
        <div className="studio-card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Users size={24} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No Partner Leads Pending</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>All channel partner leads have been routed or resolved.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Lead Entry</th>
                <th>Contact Details</th>
                <th>Current Status</th>
                <th>Route to Team Lead</th>
              </tr>
            </thead>
            <tbody>
              {partnerLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(lead => (

                <tr key={lead.id}>
                  <td>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Building size={14} color="var(--brand-primary)" /> {lead.companyName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Value: {formatCurrency(lead.value)}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.contactName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.phone}</div>
                  </td>
                  <td>
                    <span className="badge badge-warning">{lead.milestone}</span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Assigned to: {lead.assignedBDE || 'Unassigned'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <select 
                        className="form-select btn-sm" 
                        style={{ width: 160, padding: '6px 10px', fontSize: 12 }}
                        value={lead.assignedToId || ''}
                        onChange={(e) => handleAssignToTL(lead.id, e.target.value)}
                      >
                        <option value="">Hold (Unassigned)</option>
                        {tls.map(tl => (
                          <option key={tl.id} value={tl.id}>{tl.name} ({tl.team})</option>
                        ))}
                      </select>
                      <ArrowRight size={14} color="var(--text-muted)" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination 
            total={partnerLeads.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
          />
        </div>

      )}
    </div>
  );
}
