import { Building, Handshake, Users } from 'lucide-react';
import { useState } from 'react';
import Pagination from '../components/Pagination';
import { useApp } from '../context/AppContextCore';
import { formatCurrency } from '../utils/api';


export default function ChannelPartners() {
  const { leads, users } = useApp();
  
  // Get all Channel Partner users
  const channelPartners = users.filter(u => u.role === 'Channel Partner');
  const channelPartnerIds = channelPartners.map(cp => cp.id);
  
  // Filter for leads created by or assigned to Channel Partner users
  const cpLeads = leads.filter(l => 
    channelPartnerIds.includes(l.assignedToId) || 
    channelPartnerIds.includes(l.createdById)
  );
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  return (
    <div className="animate-fadeIn">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-subtitle">PARTNER NETWORK</div>
          <h1 className="page-title">Channel Partner Leads</h1>
          <p className="page-subtitle" style={{ marginTop: 8, fontSize: 13 }}>
            {channelPartners.length} active channel partner(s) • {cpLeads.length} total leads
          </p>
        </div>
      </div>

      <div className="studio-card" style={{ padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(90deg, rgba(99,102,241,0.05) 0%, rgba(99,102,241,0) 100%)', borderLeft: '4px solid #6366f1' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Handshake size={24} color="#6366f1" />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Channel Partner Activity Monitor</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>View all leads managed by Channel Partners from creation through deal closure. Track progress, conversions, and performance in real-time.</div>
        </div>
      </div>

      {cpLeads.length === 0 ? (
        <div className="studio-card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Users size={24} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No Channel Partner Leads Yet</h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Channel Partners will appear here once they create and manage leads.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Channel Partner</th>
                <th>Lead Entry</th>
                <th>Contact Details</th>
                <th>Current Stage</th>
                <th>Deal Value</th>
              </tr>
            </thead>
            <tbody>
              {cpLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(lead => {
                const partnerUser = users.find(u => u.id === lead.assignedToId);
                return (
                  <tr key={lead.id}>
                    <td>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building size={14} color="var(--brand-primary)" /> {partnerUser?.name || 'Unassigned'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        {partnerUser?.companyName || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {lead.companyName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        Contact: {lead.contactName}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.phone}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.email || 'N/A'}</div>
                    </td>
                    <td>
                      <span className="badge badge-warning">{lead.milestone || 'New'}</span>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        Status: {lead.status}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatCurrency(lead.value)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        {lead.probability}% probability
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination 
            total={cpLeads.length}
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
