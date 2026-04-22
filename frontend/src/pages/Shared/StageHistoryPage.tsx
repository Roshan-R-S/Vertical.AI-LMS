import React, { useState, useEffect } from 'react';
import { Download, Clock, Loader, Search, X, Calendar, User as UserIcon, Building2, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '@/types';
import { formatDateTime, cn } from '@lib/utils';
import { DateRangeFilter, DateFilterType } from '@components/DateRangeFilter';
import { Pagination } from '@components/Pagination';
import { PageSizeSelector } from '@components/PageSizeSelector';

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
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const [dateRange, setDateRange] = useState<DateFilterType>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [globalActivities, setGlobalActivities] = useState<ActivityRecord[]>([]);
  const [allLeads, setAllLeads] = useState<{ id: string; name: string; companyName?: string }[]>([]);
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
          `${import.meta.env.VITE_API_URL}/leads/activities?limit=1000`,
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
          `${import.meta.env.VITE_API_URL}/leads?limit=2000&page=1`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const json = await res.json();
        const items = json.data?.data || json.data?.leads || [];
        setAllLeads(items.map((l: any) => ({ 
          id: l.id, 
          name: l.name, 
          companyName: l.companyName 
        })));
      } catch (err) {
        console.error('[StageHistoryPage] Failed to fetch all leads:', err);
      }
    };
    fetchAllLeads();
  }, []);

  const filtered = globalActivities
    .filter(a => {
      const leadInfo = allLeads.find(l => l.id === a.leadId);
      const leadName = (a.lead?.name || leadInfo?.name || 'Deleted Lead').toLowerCase();
      const companyName = (a.lead?.companyName || leadInfo?.companyName || '').toLowerCase();
      
      const matchesLead = leadName.includes(searchQuery.toLowerCase());
      const matchesCompany = companyName.includes(companySearch.toLowerCase());
      const matchesUser = assigneeFilter === 'ALL' || a.createdBy === assigneeFilter;
      
      let matchesDate = true;
      const activityDate = new Date(a.createdAt);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      
      if (dateRange === 'TODAY') matchesDate = activityDate >= today;
      else if (dateRange === 'YESTERDAY') {
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        matchesDate = activityDate >= yesterday && activityDate < today;
      }
      else if (dateRange === 'LAST_7_DAYS') {
        const last7 = new Date(today); last7.setDate(last7.getDate() - 7);
        matchesDate = activityDate >= last7;
      }
      else if (dateRange === 'CUSTOM') {
        matchesDate = (!startDate || activityDate >= new Date(startDate)) && (!endDate || activityDate <= new Date(endDate + 'T23:59:59'));
      }
      
      return matchesLead && matchesCompany && matchesUser && matchesDate;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleExport = () => {
    const csv = [
      ['Lead Name', 'Company', 'Action', 'Updated By', 'Date'].join(','),
      ...filtered.map(a => {
        const leadInfo = allLeads.find(l => l.id === a.leadId);
        const leadName = a.lead?.name || leadInfo?.name || 'Unknown';
        const company = a.lead?.companyName || leadInfo?.companyName || '';
        const user = users.find(u => u.id === a.createdBy);
        return [
          `"${leadName}"`,
          `"${company}"`,
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Status History</h2>
          <p className="text-sm text-slate-500">Comprehensive log of all lead status changes</p>
        </div>
        <div className="flex items-center gap-3">
          <PageSizeSelector 
            pageSize={pageSize} 
            onChange={(size) => { setPageSize(size); setCurrentPage(1); }} 
          />
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 self-start"
          >
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lead Name</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search lead..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Company</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search company..."
              value={companySearch}
              onChange={(e) => { setCompanySearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Updated By</label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={assigneeFilter}
              onChange={(e) => { setAssigneeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 appearance-none font-medium"
            >
              <option value="ALL">All Users</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Time Period</label>
          <DateRangeFilter 
            value={dateRange}
            onChange={(val) => { setDateRange(val); setCurrentPage(1); }}
            startDate={startDate}
            onStartDateChange={(val) => { setStartDate(val); setCurrentPage(1); }}
            endDate={endDate}
            onEndDateChange={(val) => { setEndDate(val); setCurrentPage(1); }}
            className="bg-slate-50 border-slate-200 py-[7px]"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Info size={14} className="text-slate-400" />
            {filtered.length} Total Records Found
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {paginated.length} results
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
            <Loader size={20} className="animate-spin" />
            <span className="text-sm font-medium">Loading history...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500">
            <span className="text-sm font-medium">{error}</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Clock size={32} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">No results match your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 uppercase text-[10px] font-bold text-slate-400 tracking-widest">
                  <th className="px-6 py-4">Lead & Company</th>
                  <th className="px-6 py-4 w-64">Action Taken</th>
                  <th className="px-6 py-4 text-center">Updated By</th>
                  <th className="px-6 py-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginated.map(activity => {
                  const leadInfo = allLeads.find(l => l.id === activity.leadId);
                  const leadName = activity.lead?.name || leadInfo?.name;
                  const company = activity.lead?.companyName || leadInfo?.companyName;
                  const user = users.find(u => u.id === activity.createdBy);
                  const isCreation = activity.type === 'LEAD_CREATED';
                  return (
                    <tr 
                      key={activity.id} 
                      onClick={() => setSelectedActivity(activity)}
                      className="hover:bg-brand-50/20 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm border border-slate-100",
                            leadName ? "bg-white text-brand-600" : "bg-slate-50 text-slate-300"
                          )}>
                            {leadName ? leadName.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{leadName || 'Deleted Lead'}</div>
                            {company && <div className="text-[10px] font-medium text-slate-500 uppercase tracking-tight">{company}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                            isCreation ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                          )}>
                            <Clock size={12} />
                          </div>
                          <span className="text-xs text-slate-600 font-bold leading-tight" title={isCreation ? 'Initial Creation' : activity.content}>
                            {isCreation ? 'Initial Creation' : activity.content}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 shadow-sm overflow-hidden">
                            {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" crossOrigin="anonymous" /> : user?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">{user?.name?.split(' ')[0] || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs text-slate-500 font-bold tabular-nums">{formatDateTime(activity.createdAt)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {/* Pagination Footer - Standardized */}
        {!loading && filtered.length > 0 && (
          <div className="p-4 border-t border-slate-100">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalEntries={filtered.length}
              pageSize={pageSize}
              label="records"
            />
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
              className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
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
                  <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
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
                    "p-4 rounded-lg text-sm font-medium leading-relaxed break-all",
                    selectedActivity.type === 'LEAD_CREATED' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                  )}>
                    {selectedActivity.type === 'LEAD_CREATED' ? 'Initial lead creation event in the system' : selectedActivity.content}
                  </div>
                </div>
              </div>

              {/* Removed redundant footer Close button */}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
