import React from 'react';
import { useState } from 'react';
import { Download, ChevronDown, Clock } from 'lucide-react';
import { Activity, Lead } from '../types';
import { MOCK_USERS } from '../mockData';
import { formatDateTime } from '../lib/utils';

interface StageHistoryPageProps {
  leads: Lead[];
  activities: Activity[];
}

export const StageHistoryPage = ({ leads, activities }: StageHistoryPageProps) => {
  const [historyLeadFilter, setHistoryLeadFilter] = useState<string | 'ALL'>('ALL');

  const filtered = activities
    .filter(a => a.type === 'STAGE_CHANGE' && (historyLeadFilter === 'ALL' || a.leadId === historyLeadFilter))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const handleExport = () => {
    const csv = [
      ['Lead Name', 'Status', 'Updated By', 'Date'].join(','),
      ...filtered.map(a => {
        const lead = leads.find(l => l.id === a.leadId);
        const user = MOCK_USERS.find(u => u.id === a.createdBy);
        return [
          `"${lead?.name || 'Unknown'}"`,
          `"${a.content}"`,
          `"${user?.name || 'Unknown'}"`,
          `"${formatDateTime(a.createdAt)}"`
        ].join(',');
      })
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stage-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Status History Report</h2>
          <p className="text-sm text-slate-500">Track the progression of all leads across stages</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={historyLeadFilter}
              onChange={(e) => setHistoryLeadFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="ALL">All Leads</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>{lead.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown size={16} />
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-all"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Updated By</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date &amp; Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(activity => {
                const lead = leads.find(l => l.id === activity.leadId);
                const user = MOCK_USERS.find(u => u.id === activity.createdBy);
                return (
                  <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center font-bold text-xs">
                          {lead?.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-slate-900">{lead?.name || 'Deleted Lead'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-blue-50 text-blue-600 rounded">
                          <Clock size={12} />
                        </div>
                        <span className="text-sm text-slate-600 font-medium">{activity.content}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img src={user?.avatar} alt="" className="w-6 h-6 rounded-full border border-slate-200" />
                        <span className="text-sm text-slate-600">{user?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-500 font-medium">{formatDateTime(activity.createdAt)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
