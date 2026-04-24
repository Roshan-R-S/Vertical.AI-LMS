import { useState } from 'react';
import {
  Plus, Search, Download, Eye, Filter, CheckCircle, X,
  AlertCircle, Clock, TrendingUp, DollarSign, FileText,
  CreditCard, Zap
} from 'lucide-react';
import { useApp } from '../context/AppContextCore';
import Pagination from '../components/Pagination';


const STATUS_CONFIG = {
  paid: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', label: 'Paid' },
  unpaid: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', label: 'Unpaid' },
  partial: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', label: 'Partial' },
};

function InvoiceModal({ invoice, onClose }) {
  const s = STATUS_CONFIG[invoice.status];
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-slideUp">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{invoice.id}</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{invoice.clientName}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>
            <button className="modal-close" onClick={onClose}><X size={16} /></button>
          </div>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Issue Date</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{invoice.issueDate}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Due Date</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: invoice.status === 'unpaid' ? '#ef4444' : 'inherit' }}>{invoice.dueDate}</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '10px 16px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <span style={{ flex: 1 }}>Description</span><span style={{ width: 100, textAlign: 'right' }}>Amount</span>
              </div>
            </div>
            {(invoice.items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', fontSize: 13 }}>
                <span style={{ flex: 1 }}>{item.desc}</span>
                <span style={{ width: 100, textAlign: 'right', fontWeight: 600 }}>₹{item.amount.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>GST (18%)</span>
              <span style={{ fontWeight: 600 }}>₹{invoice.gst?.toLocaleString()}</span>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800 }}>
              <span>Total</span>
              <span style={{ color: '#6366f1' }}>₹{invoice.total?.toLocaleString()}</span>
            </div>
          </div>

          {invoice.status === 'partial' && (
            <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
              <span style={{ color: '#fbbf24' }}>Paid: ₹{invoice.paidAmount?.toLocaleString()} • Pending: ₹{(invoice.total - invoice.paidAmount).toLocaleString()}</span>
            </div>
          )}

          {invoice.paidDate && (
            <div style={{ fontSize: 13, color: '#34d399', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={14} /> Paid on {invoice.paidDate}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}><Download size={14} /> Download PDF</button>
          {invoice.status !== 'paid' && <button className="btn btn-primary"><CheckCircle size={14} /> Mark as Paid</button>}
        </div>
      </div>
    </div>
  );
}

export default function Billing() {
  const { invoices, clients } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewInvoice, setViewInvoice] = useState(null);
  const [tab, setTab] = useState('invoices');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);


  const filtered = invoices.filter(inv => {
    const matchSearch = !search || inv.clientName.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.status === 'partial' ? (i.total - (i.paidAmount || 0)) : i.total), 0);
  const overdue = invoices.filter(i => i.status === 'unpaid').length;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Invoices</h1>
          <p className="page-subtitle">Financial management & payment tracking</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm"><Download size={14} /> Export</button>
          <button className="btn btn-primary btn-sm"><Plus size={15} /> New Invoice</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 24 }}>
        {[
          { label: 'Revenue Collected', value: `₹${(totalRevenue/100000).toFixed(1)}L`, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.15)', sub: 'This month' },
          { label: 'Pending Dues', value: `₹${(totalPending/100000).toFixed(2)}L`, icon: Clock, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', sub: `${overdue} invoices overdue` },
          { label: 'Total Invoiced', value: `₹${(invoices.reduce((s,i)=>s+i.total,0)/100000).toFixed(1)}L`, icon: FileText, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', sub: `${invoices.length} invoices` },
          { label: 'Collection Rate', value: `${Math.round((totalRevenue/(totalRevenue+totalPending))*100)}%`, icon: TrendingUp, color: '#06b6d4', bg: 'rgba(6,182,212,0.15)', sub: 'This quarter' },
        ].map((kpi, i) => (
          <div key={i} className="studio-card">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
              <div className="card-icon-wrapper" style={{ background: kpi.bg, margin: 0 }}><kpi.icon size={16} color={kpi.color} /></div>
              <div className="card-title" style={{ fontSize: 13, margin: 0, color: 'var(--text-secondary)' }}>{kpi.label}</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 300, color: 'var(--text-primary)', marginBottom: 4 }}>{kpi.value}</div>
            <div className="card-desc" style={{ fontSize: 11 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="tabs mb-6">
        {['invoices', 'subscriptions', 'usage billing', 'integrations'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {tab === 'invoices' && (
        <div className="table-wrapper">
          <div className="table-header">
            <div className="search-wrapper">
              <Search className="search-icon" size={15} />
              <input className="search-input" placeholder="Search invoice..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{ width: 'auto', padding: '8px 12px', fontSize: 13 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {['All', 'paid', 'unpaid', 'partial'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Client</th>
                <th>Amount</th>
                <th>GST (18%)</th>
                <th>Total</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(inv => {

                const s = STATUS_CONFIG[inv.status];
                return (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: 'var(--brand-primary-light)' }}>{inv.id}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{inv.clientName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inv.clientId}</div>
                    </td>
                    <td>₹{inv.amount.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>₹{(inv.gst || 0).toLocaleString()}</td>
                    <td style={{ fontWeight: 700, fontSize: 14 }}>₹{inv.total.toLocaleString()}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{inv.issueDate}</td>
                    <td style={{ fontSize: 12, color: inv.status === 'unpaid' ? '#ef4444' : 'var(--text-secondary)' }}>
                      {inv.dueDate}
                      {inv.status === 'unpaid' && <AlertCircle size={12} style={{ marginLeft: 4, display: 'inline' }} />}
                    </td>
                    <td>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                        {s.label}
                        {inv.status === 'partial' && ` (₹${inv.paidAmount?.toLocaleString()})`}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setViewInvoice(inv)}><Eye size={14} /></button>
                        <button className="btn btn-ghost btn-sm btn-icon"><Download size={14} /></button>
                        {inv.status !== 'paid' && <button className="btn btn-ghost btn-sm btn-icon" style={{ color: '#10b981' }}><CheckCircle size={14} /></button>}
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

      )}

      {tab === 'subscriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {clients.map(client => (
            <div key={client.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="avatar" style={{ background: 'var(--gradient-brand)' }}>{client.companyName.slice(0,2).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{client.companyName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 12, marginTop: 4 }}>
                  <span>Plan: {(client.products || []).join(', ')}</span>
                  <span>Duration: {client.contractDuration}</span>
                  <span>Renewal: {client.renewalDate}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: '#6366f1' }}>₹{(client.orderValue/1000).toFixed(0)}K</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>per year</div>
              </div>
              <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 12 }}>
                {client.status === 'renewal_due' ? '⚠️ Renewal Due' : 'Active'}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'usage billing' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { label: 'AI Calling (STT)', unit: 'per minute', rate: '₹2.50', usage: '19,210 min', total: '₹48,025', color: '#6366f1', icon: Zap },
            { label: 'Text-to-Speech (TTS)', unit: 'per 1K chars', rate: '₹1.20', usage: '8,430 min', total: '₹10,116', color: '#06b6d4', icon: Zap },
            { label: 'LLM Tokens (GPT-4o)', unit: 'per 1K tokens', rate: '₹0.024', usage: '48.2M tokens', total: '₹1,157', color: '#8b5cf6', icon: Zap },
            { label: 'Sentiment Analysis', unit: 'per call', rate: '₹0.50', usage: '2,980 calls', total: '₹1,490', color: '#10b981', icon: Zap },
          ].map((item, i) => (
            <div key={i} className="card" style={{ borderColor: `${item.color}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={16} color={item.color} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.rate} {item.unit}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Usage</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginTop: 2 }}>{item.usage}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cost</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: item.color, marginTop: 2 }}>{item.total}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'integrations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[
            { name: 'Razorpay', status: 'Connected', color: '#06b6d4', desc: 'Payment gateway for invoice collection' },
            { name: 'Stripe', status: 'Not Connected', color: '#8b5cf6', desc: 'International payment processing' },
            { name: 'Tally', status: 'Not Connected', color: '#f59e0b', desc: 'Accounting & GST filing integration' },
            { name: 'Zoho Books', status: 'Not Connected', color: '#10b981', desc: 'Cloud accounting & invoicing' },
            { name: 'GST Portal', status: 'Connected', color: '#ef4444', desc: 'Auto GST calculation & filing' },
            { name: 'E-Sign', status: 'Coming Soon', color: '#6366f1', desc: 'Electronic contract signing' },
          ].map((int, i) => (
            <div key={i} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${int.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: int.color }}>{int.name.slice(0,2)}</div>
                <span className={`badge ${int.status === 'Connected' ? 'badge-success' : int.status === 'Coming Soon' ? 'badge-neutral' : 'badge-danger'}`}>{int.status}</span>
              </div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{int.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{int.desc}</div>
              <button className="btn btn-secondary btn-sm w-full" style={{ justifyContent: 'center' }} disabled={int.status === 'Coming Soon'}>
                {int.status === 'Connected' ? 'Manage' : int.status === 'Coming Soon' ? 'Soon' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      )}

      {viewInvoice && <InvoiceModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
    </div>
  );
}
