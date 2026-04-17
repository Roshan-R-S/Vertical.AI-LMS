import React, { useState, useEffect } from 'react';
import { Download, Clock, Loader, Search, X, Calendar, User as UserIcon, Building2, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '@/types';
import { formatDateTime, cn } from '@lib/utils';

interface ActivityRecord {
  id: string;
  leadId: string;
  type: string;
  content: string;
  createdBy: string;
  createdAt: string;
  lead?: { id: string; name: string; companyName?: string };
}

interface StageHistoryPageProps {
  users: User[];
}

export const StageHistoryPage = ({ users }: StageHistoryPageProps) => {
  const [loading, setLoading] = useState(true);
  const [globalActivities, setGlobalActivities] = useState<ActivityRecord[]>([]);
  const [allLeads, setAllLeads] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('lendkraft_token');
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/leads/activities?limit=500`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        setGlobalActivities(json.data || []);
      } catch (err: any) {
        console.error('[StageHistoryPage] Failed to fetch activities:', err);
        setError(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Fetch all lead names for the dropdown — independent of main paginated view
  useEffect(() => {
    const fetchAllLeads = async () => {
      const token = localStorage.getItem('lendkraft_token');
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/leads?limit=1000&page=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const json = await res.json();
        const items = json.data?.data || json.data?.leads || [];
        setAllLeads(items.map((l: any) => ({ id: l.id, name: l.name })));
      } catch (err) {
        console.error('[StageHistoryPage] Failed to fetch all leads:', err);
      }
    };
    fetchAllLeads();
  }, []);

  const filtered = globalActivities
    .filter(a => {
      const leadName = (a.lead?.name || allLeads.find(l => l.id === a.leadId)?.name || 'Deleted Lead').toLowerCase();
      return leadName.includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleExport = () => {
    const csv = [
      ['Lead Name', 'Action', 'Updated By', 'Date'].join(','),
      ...filtered.map(a => {
        const leadName = a.lead?.name || allLeads.find(l => l.id === a.leadId)?.name || 'Unknown';
        const user = users.find(u => u.id === a.createdBy);
        return [
          `"${leadName}"`,
          `"${a.type === 'LEAD_CREATED' ? 'Initial Creation' : a.content}"`,
          `"${user?.name || a.createdBy || 'Unknown'}"`,
          `"${formatDateTime(a.createdAt)}"`
        ].join(',');
      })
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `stage-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Status History Report</h2>
          <p className="text-sm text-slate-500">Track the progression of all leads across stages</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search by lead name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all shadow-sm hover:border-slate-300"
            />
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
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
            <Loader size={20} className="animate-spin" />
            <span className="text-sm font-medium">Loading history...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500">
            <span className="text-sm font-medium">{error}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Clock size={32} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">No status changes found</p>
            <p className="text-xs mt-1">Update a lead's stage to see its history here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-400 tracking-widest">
                  <th className="px-6 py-4">Lead Name</th>
                  <th className="px-6 py-4 w-64">Action</th>
                  <th className="px-6 py-4">Updated By</th>
                  <th className="px-6 py-4 text-right">Date &amp; Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(activity => {
                  const leadName = activity.lead?.name || allLeads.find(l => l.id === activity.leadId)?.name;
                  const user = users.find(u => u.id === activity.createdBy);
                  const isCreation = activity.type === 'LEAD_CREATED';
                  return (
                    <tr 
                      key={activity.id} 
                      onClick={() => setSelectedActivity(activity)}
                      className="hover:bg-brand-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm",
                            leadName ? "bg-brand-50 text-brand-600" : "bg-slate-100 text-slate-400"
                          )}>
                            {leadName ? leadName.charAt(0).toUpperCase() : '?'}
                          </div>
                          <span className="text-sm font-bold text-slate-900">{leadName || 'Deleted Lead'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-1 rounded shrink-0 transition-transform group-hover:scale-110",
                            isCreation ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                          )}>
                            <Clock size={12} />
                          </div>
                          <span className="text-sm text-slate-600 font-medium truncate" title={isCreation ? 'Initial Creation' : activity.content}>
                            {isCreation ? 'Initial Creation' : activity.content}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm border border-white">
                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-sm text-slate-600">{user?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3 text-right">
                          <span className="text-xs text-slate-500 font-medium">{formatDateTime(activity.createdAt)}</span>
                          <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all translate-x-1" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedActivity && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedActivity(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2 text-brand-600">
                  <Info size={18} />
                  <h2 className="text-lg font-bold text-slate-900">Activity Details</h2>
                </div>
                <button 
                  onClick={() => setSelectedActivity(null)}
                  className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Lead</label>
                    <p className="text-lg font-bold text-slate-900">
                      {selectedActivity.lead?.name || allLeads.find(l => l.id === selectedActivity.leadId)?.name || 'Deleted Lead'}
                    </p>
                    {selectedActivity.lead?.companyName && (
                      <p className="text-sm text-slate-500">{selectedActivity.lead.companyName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <UserIcon size={14} className="text-slate-400" />
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Updated By</label>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {users.find(u => u.id === selectedActivity.createdBy)?.name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <Calendar size={14} className="text-slate-400" />
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date & Time</label>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      {formatDateTime(selectedActivity.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-50">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Action Detail</label>
                  <div className={cn(
                    "p-4 rounded-xl text-sm font-medium leading-relaxed break-all",
                    selectedActivity.type === 'LEAD_CREATED' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                  )}>
                    {selectedActivity.type === 'LEAD_CREATED' ? 'Initial lead creation event in the system' : selectedActivity.content}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setSelectedActivity(null)}
                  className="px-6 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
