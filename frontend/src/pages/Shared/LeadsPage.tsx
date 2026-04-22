import React from 'react';
import {
  Target, TrendingUp, Calendar, Clock,
  Filter, Download, Search, MoreVertical, X, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lead, LeadStage, User } from '@/types';
import { STAGE_CONFIG } from '@/types';
import { cn, formatCurrency, formatDate, formatDateTime } from '@lib/utils';
import { StatCard } from '@components/StatCard';
import { DateRangeFilter, DateFilterType } from '@components/DateRangeFilter';
import { Pagination } from '@components/Pagination';
import { PageSizeSelector } from '@components/PageSizeSelector';

const QUICK_STAGES: (LeadStage | 'OVERDUE')[] = [
  'OVERDUE',
  'MEETING_SCHEDULED',
  'MEETING_POSTPONED',
  'MEETING_COMPLETED',
  'PROPOSAL_SHARED',
  'HANDED_OVER'
];

const SECONDARY_STAGES: LeadStage[] = [
  'DEFAULT',
  'YET_TO_CALL',
  'CALL_BACK',
  'NOT_INTERESTED',
  'LOST',
  'DNP',
  'DND',
  'SWITCHED_OFF',
  'PAYMENT_COMPLETED'
];

interface LeadsPageProps {
  leads: Lead[];
  currentUser: User;
  stageFilter: LeadStage | 'ALL' | 'OVERDUE';
  setStageFilter: (s: LeadStage | 'ALL' | 'OVERDUE') => void;
  dateRangeFilter: DateFilterType;
  setDateRangeFilter: (d: DateFilterType) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  industryFilter: string;
  setIndustryFilter: (s: string) => void;
  sourceFilter: string;
  setSourceFilter: (s: string) => void;
  assigneeFilter: string;
  setAssigneeFilter: (s: string) => void;
  isMoreFiltersOpen: boolean;
  setIsMoreFiltersOpen: (open: boolean) => void;
  users: User[];
  onSelectLead: (lead: Lead) => void;
  onExport: () => void;
  isFollowUpOverdue: (lead: Lead) => boolean;
  pageSize: number;
  setPageSize: (size: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalLeads: number;
  filteredTotal: number;
  leadStats: { 
    totalValue: number; 
    meetingsCount: number; 
    overdueCount: number;
    industries: string[];
    sources: string[];
  };
}

export const LeadsPage = ({
  leads, currentUser,
  stageFilter, setStageFilter,
  dateRangeFilter, setDateRangeFilter,
  startDate, setStartDate, endDate, setEndDate,
  industryFilter, setIndustryFilter,
  sourceFilter, setSourceFilter,
  assigneeFilter, setAssigneeFilter,
  isMoreFiltersOpen, setIsMoreFiltersOpen,
  users, onSelectLead, onExport, isFollowUpOverdue,
  pageSize, setPageSize, currentPage, setCurrentPage, totalLeads, filteredTotal, leadStats
}: LeadsPageProps) => (
  <div className="space-y-6">
    {/* Stats Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Total Leads" value={totalLeads} icon={Target} color="bg-brand-600" trend="+12%" />
      <StatCard label="Pipeline Value" value={formatCurrency(leadStats.totalValue)} icon={TrendingUp} color="bg-emerald-600" trend="+8%" />
      <StatCard label="Meetings" value={leadStats.meetingsCount} icon={Calendar} color="bg-purple-600" />
      <StatCard label="Overdue Leads" value={leadStats.overdueCount} icon={Clock} color="bg-rose-600" />
    </div>

    {/* Filters & Table Wrapper */}
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          {/* Stage Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setStageFilter('ALL')}
              className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap",
                stageFilter === 'ALL' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}
            >All Leads</button>
            
            {QUICK_STAGES.map(stage => (
              <button key={stage} onClick={() => setStageFilter(stage)}
                className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap",
                  stageFilter === stage ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}>
                {stage === 'OVERDUE' ? 'Overdue' : STAGE_CONFIG[stage].label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Date Range */}
            <DateRangeFilter 
              value={dateRangeFilter as DateFilterType}
              onChange={setDateRangeFilter}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
            />

            {/* More Filters Toggle */}
            <button onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}
              className={cn("flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-all",
                isMoreFiltersOpen || (industryFilter !== 'ALL' || sourceFilter !== 'ALL' || assigneeFilter !== 'ALL' || SECONDARY_STAGES.includes(stageFilter as any))
                  ? "bg-brand-50 border-brand-200 text-brand-600"
                  : "text-slate-600 border-slate-200 hover:bg-slate-50")}>
              <Filter size={14} />
              {isMoreFiltersOpen ? 'Hide Filters' : 'More Filters'}
              {(industryFilter !== 'ALL' || sourceFilter !== 'ALL' || assigneeFilter !== 'ALL' || SECONDARY_STAGES.includes(stageFilter as any)) && (
                <span className="w-2 h-2 bg-brand-600 rounded-full" />
              )}
            </button>

            <PageSizeSelector 
              pageSize={pageSize} 
              onChange={(size) => { setPageSize(size); setCurrentPage(1); }} 
            />

            {currentUser.role !== 'BDE' && (
              <button onClick={onExport}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                <Download size={14} />Export
              </button>
            )}
          </div>
        </div>

        {/* Expanded More Filters Panel */}
        <AnimatePresence>
          {isMoreFiltersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-slate-100 bg-slate-50/50"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Industry', value: industryFilter, onChange: setIndustryFilter, options: Array.from(new Set(['BFSI', 'BPO', ...leadStats.industries])).sort(), allLabel: 'All Industries' },
                  { label: 'Source', value: sourceFilter, onChange: setSourceFilter, options: Array.from(new Set(['Website', 'Referral', 'Cold Call', 'Google Ads', 'LinkedIn', 'Email Campaign', ...leadStats.sources])).sort(), allLabel: 'All Sources' },
                ].map(({ label, value, onChange, options, allLabel }) => (
                  <div key={label}>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
                    <select value={value} onChange={(e) => onChange(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                      <option value="ALL">{allLabel}</option>
                      {options.filter(Boolean).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Other Stages</label>
                  <select value={SECONDARY_STAGES.includes(stageFilter as any) ? stageFilter : 'ALL'} 
                    onChange={(e) => setStageFilter(e.target.value as any)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                    <option value="ALL">Select Stage...</option>
                    {SECONDARY_STAGES.map(s => <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>)}
                  </select>
                </div>
                {currentUser.role !== 'BDE' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Assigned To</label>
                    <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                      <option value="ALL">All Assignees</option>
                      {users.filter(u => {
                        if (currentUser.role === 'SUPER_ADMIN') return ['SALES_HEAD', 'TEAM_LEAD', 'BDE'].includes(u.role);
                        if (currentUser.role === 'SALES_HEAD') return ['TEAM_LEAD', 'BDE'].includes(u.role);
                        if (currentUser.role === 'TEAM_LEAD') return u.role === 'BDE' && u.teamId === currentUser.teamId;
                        return false;
                      }).map(user => (
                        <option key={user.id} value={user.id}>{user.name} ({user.role.replace('_', ' ')})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="px-6 pb-6 flex justify-end gap-3">
                 <button onClick={() => { setIndustryFilter('ALL'); setSourceFilter('ALL'); setAssigneeFilter('ALL'); setStageFilter('ALL'); }}
                   className="px-4 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
                   Reset All Filters
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Area */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {['Lead Details', 'Status', 'Value', 'Industry', 'Assigned To', 'Next Follow-up', 'Created'].map(h => (
                  <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map(lead => (
                <tr key={lead.id} onClick={() => onSelectLead(lead)}
                  className="data-grid-row cursor-pointer group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-brand-600">{lead.name}</span>
                    <span className="block text-xs text-slate-500 font-mono">{lead.phone}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("status-pill", STAGE_CONFIG[lead.stage].color)}>{STAGE_CONFIG[lead.stage].label}</span>
                    {isFollowUpOverdue(lead) && (
                      <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 rounded border border-red-100 w-fit">
                        <Clock size={8} />Overdue
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700 font-mono">{formatCurrency(lead.value)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-700 block">{lead.industry}</span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{lead.source}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <img 
                        src={users.find(u => u.id === lead.assignedToId)?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${lead.assignedToId}`} 
                        alt="" 
                        className="w-6 h-6 rounded-full border border-slate-200" 
                        crossOrigin="anonymous"
                      />
                      <span className="text-xs font-medium text-slate-600">{users.find(u => u.id === lead.assignedToId)?.name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {lead.nextFollowUp ? (
                      <span className={cn("text-xs font-bold", isFollowUpOverdue(lead) ? "text-red-500" : "text-slate-600")}>
                        {formatDateTime(lead.nextFollowUp)}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300 italic">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-500">{formatDate(lead.createdAt)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-slate-300" size={32} />
              </div>
              <h3 className="text-slate-900 font-bold">No leads found</h3>
              <p className="text-slate-500 text-sm">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Footer - Moved Outside Card */}
      {/* Pagination Footer - Standardized */}
      <div className="mt-4">
        <Pagination 
          currentPage={currentPage}
          totalPages={Math.ceil(filteredTotal / pageSize)}
          onPageChange={setCurrentPage}
          totalEntries={filteredTotal}
          pageSize={pageSize}
          label="leads"
        />
      </div>
    </div>
  </div>
);
