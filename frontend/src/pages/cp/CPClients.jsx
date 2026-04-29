import { useState } from 'react';
import { useApp } from '../../context/AppContextCore';
import { formatCurrency } from '../../utils/api';
import { Search, Eye, Edit2, FileText, AlertCircle } from 'lucide-react';
import Pagination from '../../components/Pagination';

const STATUS_COLORS = {
  active:      { color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
  renewal_due: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
  churned:     { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
};

export default function CPClients() {
  const { currentUser, clients } = useApp();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showRenewalsOnly, setShowRenewalsOnly] = useState(false);

  // CP sees only clients they manage
  const myClients = clients.filter(c => {
    const matchSearch = !search || c.companyName.toLowerCase().includes(search.toLowerCase());
    const matchManager = c.accountManagerId === currentUser.id;
    const matchRenewal = !showRenewalsOnly || c.status === 'renewal_due';
    return matchSearch && matchManager && matchRenewal;
  });

  const totalARR = myClients.reduce((s, c) => s + (Number(c.orderValue) || 0), 0);
  const renewalDue = myClients.filter(c => c.status === 'renewal_due').length;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Clients</h1>
          <p className="page-subtitle">{myClients.length} clients • {formatCurrency(totalARR)} ARR</p>
        </div>
      </div>

      {renewalDue > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={16} color="#f59e0b" />
          <span style={{ fontSize: 13, color: '#fbbf24', fontWeight: 500 }}>{renewalDue} client{renewalDue > 1 ? 's' : ''} have renewals due</span>
          <button className="btn btn-sm" style={{ marginLeft: 'auto', background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.4)' }} onClick={() => setShowRenewalsOnly(!showRenewalsOnly)}>
            {showRenewalsOnly ? 'Show All' : 'View Renewals'}
          </button>
        </div>
      )}

      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total Clients', value: myClients.length, color: '#6366f1' },
          { label: 'Total ARR', value: formatCurrency(totalARR), color: '#10b981' },
          { label: 'Renewal Due', value: renewalDue, color: '#f59e0b' },
          { label: 'Avg Deal Size', value: formatCurrency(totalARR / (myClients.length || 1)), color: '#06b6d4' },
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
            <tr><th>Client</th><th>Contact</th><th>Products</th><th>Order Value</th><th>Renewal</th><th>Status</th></tr>
          </thead>
          <tbody>
            {myClients.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(client => {
              const s = STATUS_COLORS[client.status] || STATUS_COLORS.active;
              return (
                <tr key={client.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm" style={{ background: 'var(--gradient-brand)' }}>{client.companyName.slice(0, 2).toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{client.companyName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{client.industry}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{client.contactName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{client.email}</div>
                  </td>
                  <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{(client.products || []).map((p, i) => <span key={i} className="badge badge-primary" style={{ fontSize: 10 }}>{p}</span>)}</div></td>
                  <td style={{ fontWeight: 700 }}>{formatCurrency(client.orderValue)}</td>
                  <td style={{ fontSize: 12, color: client.status === 'renewal_due' ? '#f59e0b' : 'var(--text-secondary)' }}>{client.renewalDate}</td>
                  <td><span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{client.status?.replace('_', ' ')}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination total={myClients.length} pageSize={pageSize} currentPage={currentPage} onPageChange={setCurrentPage} onPageSizeChange={s => { setPageSize(s); setCurrentPage(1); }} />
      </div>
    </div>
  );
}
