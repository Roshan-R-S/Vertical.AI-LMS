import { useState } from 'react';
import {
  Plus, Search, Download, Eye, Filter, CheckCircle, X,
  AlertCircle, Clock, TrendingUp, IndianRupee, FileText,
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
  const { markInvoicePaid } = useApp();
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
          {invoice.pdfUrl ? (
            <button 
              onClick={() => window.open(invoice.pdfUrl, '_blank')}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Download size={14} /> Download Document
            </button>
          ) : (
            <button className="btn btn-secondary" disabled title="No document uploaded">
              <FileText size={14} /> No Document
            </button>
          )}
          {invoice.status !== 'paid' && (
            <button className="btn btn-primary" onClick={() => { markInvoicePaid(invoice.id); onClose(); }}>
              <CheckCircle size={14} /> Mark as Paid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NewInvoiceModal({ onClose, onSave, clients }) {
  const [form, setForm] = useState({
    invoiceNumber: '',
    clientId: '',
    amount: '',
    status: 'unpaid',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
  });
  const [file, setFile] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const { uploadInvoiceFile } = useApp();

  const gst = Math.round((Number(form.amount) || 0) * 0.18);
  const total = (Number(form.amount) || 0) + gst;

  const handleSave = async () => {
    if (!form.clientId || !form.amount || !form.dueDate) {
      alert("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const res = await onSave({
        ...form,
        amount: Number(form.amount),
        items: [{ desc: 'Service Fee', amount: Number(form.amount) }]
      });
      
      if (file && res?.id) {
        await uploadInvoiceFile(res.id, file);
      }
      
      setIsSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && (isSaved ? onClose() : null)}>
      <div className="modal modal-lg animate-slideUp">
        <div className="modal-header">
          <h2 className="modal-title">Generate New Invoice</h2>
          {!isSaved && <button className="modal-close" onClick={onClose}><X size={16} /></button>}
        </div>
        <div className="modal-body">
          {isSaved ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ background: 'rgba(16,185,129,0.1)', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={32} color="#10b981" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Invoice Saved!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>The invoice has been successfully recorded in the database.</p>
              <button className="btn btn-primary" onClick={onClose}>Close Window</button>
            </div>
          ) : (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Invoice Number (Optional)</label>
                  <input className="form-input" value={form.invoiceNumber} onChange={e => setForm(p => ({ ...p, invoiceNumber: e.target.value }))} placeholder="E.g. INV-2024-001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Client *</label>
                  <select className="form-select" value={form.clientId} onChange={e => setForm(p => ({ ...p, clientId: e.target.value }))}>
                    <option value="">Select Client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input className="form-input" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="100000" />
                </div>
                <div className="form-group">
                  <label className="form-label">GST (18%)</label>
                  <input className="form-input" value={`₹${gst.toLocaleString()}`} readOnly style={{ background: 'var(--bg-surface)', cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Amount</label>
                  <input className="form-input" value={`₹${total.toLocaleString()}`} readOnly style={{ background: 'var(--bg-surface)', fontWeight: 700, color: '#6366f1' }} />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label">Issue Date</label>
                  <input className="form-input" type="date" value={form.issueDate} onChange={e => setForm(p => ({ ...p, issueDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                  </select>
                </div>
              </div>

               <div className="form-group">
                <label className="form-label">Upload Invoice Document (PDF/DOC)</label>
                <div style={{ 
                  border: '2px dashed var(--border-default)', 
                  borderRadius: 12, 
                  padding: '20px', 
                  textAlign: 'center',
                  background: file ? 'rgba(16,185,129,0.05)' : 'transparent',
                  borderColor: file ? '#10b981' : 'var(--border-default)'
                }}>
                  <input 
                    type="file" 
                    id="invoice-file"
                    style={{ display: 'none' }} 
                    accept=".pdf,.doc,.docx"
                    onChange={e => setFile(e.target.files[0])} 
                  />
                  <label htmlFor="invoice-file" style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <FileText size={24} color={file ? '#10b981' : 'var(--text-muted)'} />
                      <div style={{ fontSize: 13, fontWeight: 500 }}>
                        {file ? file.name : 'Click to select or drag and drop'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>PDF, DOC up to 10MB</div>
                    </div>
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
        {!isSaved && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Create & Save Invoice'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Billing() {
  const { invoices, clients, addInvoice, markInvoicePaid } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewInvoice, setViewInvoice] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
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
  
  const handleExport = () => {
    if (filtered.length === 0) return;
    
    // Headers
    const headers = ['Invoice ID', 'Client', 'Amount', 'GST', 'Total', 'Issue Date', 'Due Date', 'Status'];
    
    // Rows
    const rows = filtered.map(inv => [
      inv.id,
      inv.clientName,
      inv.amount,
      inv.gst || 0,
      inv.total,
      inv.issueDate,
      inv.dueDate,
      inv.status
    ]);
    
    // Convert to CSV string with quote-wrapping for safety
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(val => `"${val}"`).join(','))
    ].join('\n');
    
    // Download trigger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoices_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Invoices</h1>
          <p className="page-subtitle">Financial management & payment tracking</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={handleExport}><Download size={14} /> Export</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddModal(true)}><Plus size={15} /> New Invoice</button>
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
                        <button 
                          className="btn btn-ghost btn-sm btn-icon" 
                          onClick={() => inv.pdfUrl ? window.open(inv.pdfUrl, '_blank') : alert('No document attached to this invoice')}
                          style={{ opacity: inv.pdfUrl ? 1 : 0.4 }}
                          title={inv.pdfUrl ? 'Download Invoice' : 'No document attached'}
                        >
                          <Download size={14} />
                        </button>
                        {inv.status !== 'paid' && (
                          <button 
                            className="btn btn-ghost btn-sm btn-icon" 
                            style={{ color: '#10b981' }}
                            onClick={() => markInvoicePaid(inv.id)}
                          >
                            <CheckCircle size={14} />
                          </button>
                        )}
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
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Plan Details</th>
                <th>Duration</th>
                <th>Renewal Date</th>
                <th style={{ textAlign: 'right' }}>Annual Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-surface-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                        {client.companyName.slice(0,2).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 600 }}>{client.companyName}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-1 flex-wrap">
                      {(client.products || []).map(p => <span key={p} className="badge badge-neutral">{p}</span>)}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{client.contractDuration}</td>
                  <td style={{ fontWeight: 500 }}>{client.renewalDate}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--accent-blue)' }}>
                    ₹{(client.orderValue/1000).toFixed(0)}K
                  </td>
                  <td>
                    <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {client.status === 'renewal_due' ? 'Renewal Due' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      {tab === 'usage billing' && (
        <div className="studio-card-grid">
          {[
            { label: 'AI Calling (STT)', unit: 'per minute', rate: '₹2.50', usage: '19,210 min', total: '₹48,025', color: 'blue', icon: Zap },
            { label: 'Text-to-Speech (TTS)', unit: 'per 1K chars', rate: '₹1.20', usage: '8,430 min', total: '₹10,116', color: 'yellow', icon: Zap },
            { label: 'LLM Tokens (GPT-4o)', unit: 'per 1K tokens', rate: '₹0.024', usage: '48.2M tokens', total: '₹1,157', color: 'purple', icon: Zap },
            { label: 'Sentiment Analysis', unit: 'per call', rate: '₹0.50', usage: '2,980 calls', total: '₹1,490', color: 'green', icon: Zap },
          ].map((item, i) => (
            <div key={i} className="studio-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div className={`card-icon-wrapper ${item.color}`} style={{ margin: 0 }}>
                  <item.icon size={16} />
                </div>
                <div>
                  <div className="card-title" style={{ margin: 0 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.rate} {item.unit}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Total Usage</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{item.usage}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Accrued Cost</div>
                  <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>{item.total}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}


      {tab === 'integrations' && (
        <div className="studio-card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {[
            { name: 'Razorpay', status: 'Connected', color: 'blue', desc: 'Payment gateway for invoice collection' },
            { name: 'Stripe', status: 'Not Connected', color: 'purple', desc: 'International payment processing' },
            { name: 'Tally', status: 'Not Connected', color: 'yellow', desc: 'Accounting & GST filing integration' },
            { name: 'Zoho Books', status: 'Not Connected', color: 'green', desc: 'Cloud accounting & invoicing' },
            { name: 'GST Portal', status: 'Connected', color: 'red', desc: 'Auto GST calculation & filing' },
            { name: 'E-Sign', status: 'Coming Soon', color: 'gray', desc: 'Electronic contract signing' },
          ].map((int, i) => (
            <div key={i} className="studio-card" style={{ justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div className={`card-icon-wrapper ${int.color}`} style={{ margin: 0, fontWeight: 800, fontSize: 12 }}>{int.name.slice(0,2)}</div>
                  <span className={`badge ${int.status === 'Connected' ? 'badge-success' : int.status === 'Coming Soon' ? 'badge-neutral' : 'badge-danger'}`}>{int.status}</span>
                </div>
                <div className="card-title">{int.name}</div>
                <div className="card-desc" style={{ marginBottom: 20 }}>{int.desc}</div>
              </div>
              <button className="btn btn-secondary btn-sm w-full" disabled={int.status === 'Coming Soon'}>
                {int.status === 'Connected' ? 'Manage' : int.status === 'Coming Soon' ? 'Soon' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      )}


      {viewInvoice && <InvoiceModal invoice={viewInvoice} onClose={() => setViewInvoice(null)} />}
      {showAddModal && <NewInvoiceModal onClose={() => setShowAddModal(false)} onSave={addInvoice} clients={clients} />}
    </div>

  );
}
