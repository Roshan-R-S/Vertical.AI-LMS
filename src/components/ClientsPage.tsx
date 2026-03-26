import React from 'react';
import { MOCK_CLIENTS } from '../mockData';
import { MoreVertical } from 'lucide-react';
import { cn } from '../lib/utils';

export const ClientsPage = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-slate-900">Clients</h2>
      <button className="px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-brand-200">Add Client</button>
    </div>
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Name</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Company</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Onboarding Date</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">AMC Status</th>
            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_CLIENTS.map(client => (
            <tr key={client.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <p className="text-sm font-bold text-slate-900">{client.name}</p>
                <p className="text-xs text-slate-500">{client.email}</p>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-medium text-slate-700">{client.company}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs text-slate-500">{client.onboardingDate}</span>
              </td>
              <td className="px-6 py-4">
                <span className={cn(
                  "status-pill",
                  client.amcStatus === 'ACTIVE' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                  {client.amcStatus}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
