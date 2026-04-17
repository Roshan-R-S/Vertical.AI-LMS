import React, { useState, useEffect } from 'react';
import { formatCurrency, cn, formatDate } from '@lib/utils';
import { Invoice, Client } from '@/types';
import { AddInvoiceModal } from '@components/AddInvoiceModal';

export const ReportsPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Invoice ID</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-500 rounded-full animate-spin" />
                    <span className="text-xs font-bold uppercase tracking-widest">Loading Invoices...</span>
                  </div>
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No invoices found.</td>
              </tr>
            ) : (
              invoices.map(inv => (
                <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900 font-mono">#{inv.id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{inv.client?.company}</span>
                      <span className="text-[10px] text-slate-500">{inv.client?.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900 font-mono">{formatCurrency(inv.amount)}</span>
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
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500 font-medium">{formatDate(inv.dueDate)}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
