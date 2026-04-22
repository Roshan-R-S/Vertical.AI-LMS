import React, { useState, useEffect, useMemo } from 'react';
import { formatCurrency, cn, formatDate } from '@lib/utils';
import { Invoice, Client } from '@/types';
import { AddInvoiceModal } from '@components/AddInvoiceModal';
import { 
  CheckCircle2, 
  RotateCcw, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Info
} from 'lucide-react';
import { Pagination } from '@components/Pagination';
import { PageSizeSelector } from '@components/PageSizeSelector';

type SortField = 'id' | 'client' | 'amount' | 'status' | 'dueDate';
type SortOrder = 'asc' | 'desc';

export const ReportsPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('lendkraft_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('lendkraft_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([fetchInvoices(), fetchClients()]);
      setIsLoading(false);
    };
    init();
  }, []);

  const handleGenerateInvoice = async (invoiceData: any) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('lendkraft_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/invoices`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(invoiceData)
      });
      if (res.ok) {
        await fetchInvoices();
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error generating invoice:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (invoiceId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
    if (!window.confirm(`Mark this invoice as ${nextStatus}?`)) return;

    try {
      const token = localStorage.getItem('lendkraft_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        await fetchInvoices();
      }
    } catch (err) {
      console.error('Error updating invoice status:', err);
    }
  };

  // Filter & Search Logic
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(inv => {
        const matchesSearch = 
          inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inv.client?.company?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        
        if (sortField === 'client') {
          valA = a.client?.company || '';
          valB = b.client?.company || '';
        }

        const strA = (valA || '').toString().toLowerCase();
        const strB = (valB || '').toString().toLowerCase();
        
        if (sortOrder === 'asc') return strA.localeCompare(strB);
        return strB.localeCompare(strA);
      });
  }, [invoices, searchQuery, statusFilter, sortField, sortOrder]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Billing &amp; Invoices</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all active:scale-95"
        >
          Generate Invoice
        </button>
      </div>

      {/* Table Controls */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        <PageSizeSelector 
          pageSize={pageSize} 
          onChange={(size) => { setPageSize(size); setCurrentPage(1); }} 
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort('id')}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice ID</span>
                    {sortField === 'id' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort('client')}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client</span>
                    {sortField === 'client' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort('amount')}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</span>
                    {sortField === 'amount' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort('status')}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                    {sortField === 'status' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th className="px-6 py-4 cursor-pointer hover:bg-slate-100/50" onClick={() => toggleSort('dueDate')}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</span>
                    {sortField === 'dueDate' && (sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-widest">Loading Invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">No invoices found.</td>
                </tr>
              ) : (
                paginatedInvoices.map(inv => (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900 font-mono">#{inv.id.slice(-6).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">{inv.client?.company}</span>
                        <span className="text-[10px] text-slate-500">{inv.client?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-bold text-slate-900">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "status-pill",
                        inv.status === 'PAID' ? "bg-green-50 text-green-600" : 
                        inv.status === 'OVERDUE' ? "bg-red-50 text-red-600" : "bg-orange-50 text-orange-600"
                      )}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleUpdateStatus(inv.id, inv.status)}
                        className={cn(
                          "p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100",
                          inv.status === 'PAID' ? "text-slate-400 hover:text-orange-600 hover:bg-orange-50" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        )}
                        title={inv.status === 'PAID' ? "Mark as Pending" : "Mark as Paid"}
                      >
                        {inv.status === 'PAID' ? <RotateCcw size={18} /> : <CheckCircle2 size={18} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-4 border-t border-slate-100">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalEntries={filteredInvoices.length}
            pageSize={pageSize}
            label="invoices"
          />
        </div>
      </div>

      <AddInvoiceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleGenerateInvoice}
        clients={clients}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
