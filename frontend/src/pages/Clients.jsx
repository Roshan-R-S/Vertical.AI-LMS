import { useState } from 'react';
import {
  Plus, Search, Eye, Edit2, FileText, Upload, Download,
  X, CheckCircle, Building2, Calendar, RefreshCw, AlertCircle,
  File, Trash2, ExternalLink, Phone, Mail
} from 'lucide-react';
import { useApp } from '../context/AppContextCore';
import Pagination from '../components/Pagination';


const STATUS_COLORS = {
  active: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
  renewal_due: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
  churned: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
};

function ClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState(client || {
    companyName: '', contactName: '', email: '', phone: '',
    products: [], orderValue: '', contractDuration: '12 months',
    startDate: '', renewalDate: '', accountManager: '', industry: '', status: 'active'
  });

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-slideUp">
        <div className="modal-header">
          <h2 className="modal-title">{client ? 'Edit Client' : 'Add New Client'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input className="form-input" value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} placeholder="Apex Manufacturing" />
            </div>
            <div className="form-group">
              <label className="form-label">Industry</label>
              <select className="form-select" value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}>
                {['Technology', 'Manufacturing', 'Finance', 'Healthcare', 'EdTech', 'Retail', 'Real Estate', 'Trade', 'Other'].map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Contact Person</label>
              <input className="form-input" value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Account Manager</label>
              <input className="form-input" value={form.accountManager} onChange={e => setForm(p => ({ ...p, accountManager: e.target.value }))} />
            </div>
          </div>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Order Value (₹)</label>
              <input className="form-input" type="number" value={form.orderValue} onChange={e => setForm(p => ({ ...p, orderValue: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Renewal Date</label>
              <input className="form-input" type="date" value={form.renewalDate} onChange={e => setForm(p => ({ ...p, renewalDate: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="renewal_due">Renewal Due</option>
              <option value="churned">Churned</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => { onSave(form); onClose(); }}>
            <CheckCircle size={15} /> {client ? 'Update Client' : 'Add Client'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ClientDetailModal({ client, onClose }) {
  const [tab, setTab] = useState('overview');
  const s = STATUS_COLORS[client.status] || STATUS_COLORS.active;

  const mockDocs = client.documents || [];

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-slideUp" style={{ maxWidth: 800 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="avatar avatar-lg" style={{ background: 'var(--gradient-brand)', borderRadius: 12 }}>
              {client.companyName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="modal-title">{client.companyName}</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{client.industry} • {client.contactName}</p>
            </div>
            <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
              {client.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="tabs mb-4">
            {['overview', 'documents', 'transactions', 'ai insights'].map(t => (
              <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
            ))}
          </div>

          {tab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Order Value', value: `₹${(client.orderValue / 1000).toFixed(0)}K`, color: '#6366f1' },
                  { label: 'Contract', value: client.contractDuration, color: '#06b6d4' },
                  { label: 'Renewal', value: client.renewalDate, color: client.status === 'renewal_due' ? '#f59e0b' : '#10b981' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 10, padding: 14, border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{s.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact Details</div>
                  {[
                    { icon: Building2, label: client.contactName },
                    { icon: Mail, label: client.email },
                    { icon: Phone, label: client.phone },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <item.icon size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Products / Services</div>
                  {(client.products || []).map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                      <CheckCircle size={14} color="#10b981" />
                      <span style={{ fontSize: 13 }}>{p}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Account Manager</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{client.accountManager}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'documents' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16, gap: 8 }}>
                <button className="btn btn-secondary btn-sm"><Upload size={14} /> Upload Document</button>
              </div>
              {mockDocs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📁</div>
                  <div className="empty-title">No documents yet</div>
                  <div className="empty-desc">Upload proposals, contracts, invoices and KYC documents</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {mockDocs.map((doc, i) => {
                    const ext = doc.split('.').pop().toUpperCase();
                    const colors = { PDF: '#ef4444', DOCX: '#3b82f6', XLSX: '#10b981' };
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: `${colors[ext] || '#6366f1'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: colors[ext] || '#6366f1' }}>{ext}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{doc}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Uploaded • v1.0</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm btn-icon"><Download size={14} /></button>
                          <button className="btn btn-ghost btn-sm btn-icon"><ExternalLink size={14} /></button>
                          <button className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--brand-danger)' }}><Trash2 size={14} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'transactions' && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>
              Transaction history integrated with Billing module.<br />
              <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }}>View in Billing</button>
            </div>
          )}

          {tab === 'ai insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Upsell Opportunity', value: 'Client is on Basic plan. Analytics usage is high — recommend premium tier upgrade.', color: '#10b981', icon: '🚀' },
                { label: 'Churn Risk', value: client.status === 'renewal_due' ? '⚠️ Renewal is due soon. Initiate renewal discussions immediately.' : '✅ Low churn risk. Client is engaged and happy.', color: client.status === 'renewal_due' ? '#f59e0b' : '#10b981', icon: '⚡' },
                { label: 'Cross-Sell Suggestion', value: 'Client does not have WhatsApp automation module. High potential based on their use case.', color: '#6366f1', icon: '💡' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: 16, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: item.color, marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Clients() {
  const { clients, addClient, updateClient, currentUser } = useApp();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [viewClient, setViewClient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);


  const filtered = clients.filter(c => {
    const matchSearch = !search || c.companyName.toLowerCase().includes(search.toLowerCase()) || c.contactName.toLowerCase().includes(search.toLowerCase());
    const matchBDE = currentUser?.role !== 'BDE' || c.accountManager === currentUser?.name;
    return matchSearch && matchBDE;
  });

  const totalARR = filtered.reduce((s, c) => s + (Number(c.orderValue) || 0), 0);
  const renewalDue = filtered.filter(c => c.status === 'renewal_due').length;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{filtered.length} active clients • ₹{(totalARR / 100000).toFixed(1)}L ARR</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}><Plus size={15} /> Add Client</button>
        </div>
      </div>

      {renewalDue > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={16} color="#f59e0b" />
          <span style={{ fontSize: 13, color: '#fbbf24', fontWeight: 500 }}>{renewalDue} client{renewalDue > 1 ? 's' : ''} have renewals due — take action now</span>
          <button className="btn btn-sm" style={{ marginLeft: 'auto', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.4)' }}>View</button>
        </div>
      )}

      {/* Stats */}
      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Clients', value: filtered.length, color: '#6366f1' },
          { label: 'Total ARR', value: `₹${(totalARR / 100000).toFixed(1)}L`, color: '#10b981' },
          { label: 'Renewal Due', value: renewalDue, color: '#f59e0b' },
          { label: 'Avg Deal Size', value: `₹${(totalARR / (filtered.length || 1) / 1000).toFixed(0)}K`, color: '#06b6d4' },
        ].map((s, i) => (
          <div key={i} className="studio-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 24, fontWeight: 300, color: s.color, marginBottom: 8 }}>{s.value}</div>
            <div className="card-title" style={{ fontSize: 13, margin: 0 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="table-wrapper">
        <div className="table-header">
          <div className="search-wrapper">
            <Search className="search-icon" size={15} />
            <input className="search-input" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Contact</th>
              <th>Products</th>
              <th>Order Value</th>
              <th>Contract</th>
              <th>Renewal</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(client => {

              const s = STATUS_COLORS[client.status] || STATUS_COLORS.active;
              return (
                <tr key={client.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm" style={{ background: 'var(--gradient-brand)' }}>{client.companyName.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{client.companyName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{client.id} • {client.industry}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{client.contactName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{client.email}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(client.products || []).map((p, i) => <span key={i} className="badge badge-primary" style={{ fontSize: 10 }}>{p}</span>)}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: 14 }}>₹{(client.orderValue / 1000).toFixed(0)}K</td>
                  <td style={{ fontSize: 12 }}>{client.contractDuration}</td>
                  <td>
                    <div style={{ fontSize: 12, color: client.status === 'renewal_due' ? '#f59e0b' : 'var(--text-secondary)' }}>
                      {client.renewalDate}
                      {client.status === 'renewal_due' && <span style={{ marginLeft: 6 }}>⚠️</span>}
                    </div>
                  </td>
                  <td style={{ fontSize: 13 }}>{client.accountManager}</td>
                  <td>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                      {client.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setViewClient(client)}><Eye size={14} /></button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditClient(client)}><Edit2 size={14} /></button>
                      <button className="btn btn-ghost btn-sm btn-icon"><FileText size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
          })}
        </tbody>
      </table>
      <Pagination 
        total={filtered.length}
        pageSize={pageSize}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={(s) => { setPageSize(s); setCurrentPage(1); }}
      />
    </div>


      {showAdd && <ClientModal onClose={() => setShowAdd(false)} onSave={addClient} />}
      {editClient && <ClientModal client={editClient} onClose={() => setEditClient(null)} onSave={d => updateClient(editClient.id, d)} />}
      {viewClient && <ClientDetailModal client={viewClient} onClose={() => setViewClient(null)} />}
    </div>
  );
}
