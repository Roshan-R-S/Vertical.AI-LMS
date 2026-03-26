import React from 'react';
import { MOCK_CLIENTS, MOCK_INVOICES } from '../mockData';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';

export const ReportsPage = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-slate-900">Billing &amp; Invoices</h2>
      <button className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-brand-200">Generate Invoice</button>
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
          {MOCK_INVOICES.map(inv => (
            <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <span className="text-sm font-bold text-slate-900 font-mono">{inv.id}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-medium text-slate-700">
                  {MOCK_CLIENTS.find(c => c.id === inv.clientId)?.company}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-bold text-slate-900 font-mono">{formatCurrency(inv.amount)}</span>
              </td>
              <td className="px-6 py-4">
                <span className={cn(
                  "status-pill",
                  inv.status === 'PAID' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
                )}>
                  {inv.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs text-slate-500">{inv.dueDate}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
