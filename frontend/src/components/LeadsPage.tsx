import React from 'react';
import {
  Target, TrendingUp, Calendar, Clock,
  Filter, Download, Search, MoreVertical, X, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lead, LeadStage, User } from '../types';
import { STAGE_CONFIG } from '../types';
import { MOCK_USERS } from '../mockData';
import { cn, formatCurrency, formatDate, formatDateTime } from '../lib/utils';
import { StatCard } from './StatCard';

interface LeadsPageProps {
  leads: Lead[];
  filteredLeads: Lead[];
  currentUser: User;
  stageFilter: LeadStage | 'ALL';
  setStageFilter: (s: LeadStage | 'ALL') => void;
  dateRangeFilter: 'ALL' | 'TODAY' | 'YESTERDAY' | 'CUSTOM';
  setDateRangeFilter: (d: 'ALL' | 'TODAY' | 'YESTERDAY' | 'CUSTOM') => void;
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
}

export const LeadsPage = ({
  leads, filteredLeads, currentUser,
  stageFilter, setStageFilter,
  dateRangeFilter, setDateRangeFilter,
  startDate, setStartDate, endDate, setEndDate,
  industryFilter, setIndustryFilter,
  sourceFilter, setSourceFilter,
  assigneeFilter, setAssigneeFilter,
  isMoreFiltersOpen, setIsMoreFiltersOpen,
  users, onSelectLead, onExport, isFollowUpOverdue
}: LeadsPageProps) => (
  <div className="space-y-6">
    {/* Stats Row */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard label="Total Leads" value={leads.length} icon={Target} color="bg-brand-600" trend="+12%" />
      <StatCard label="Pipeline Value" value={formatCurrency(leads.reduce((acc, l) => acc + l.value, 0))} icon={TrendingUp} color="bg-emerald-600" trend="+8%" />
      <StatCard label="Meetings" value={leads.filter(l => l.stage === 'MEETING_SCHEDULED').length} icon={Calendar} color="bg-purple-600" />
      <StatCard label="Overdue Leads" value={leads.filter(l => isFollowUpOverdue(l)).length} icon={Clock} color="bg-rose-600" />
    </div>

    {/* Filters & Table */}
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        {/* Stage Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
          <button
            onClick={() => setStageFilter('ALL')}
            className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap",
              stageFilter === 'ALL' ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}
          >All Leads</button>
          {(Object.keys(STAGE_CONFIG) as LeadStage[]).map(stage => (
            <button key={stage} onClick={() => setStageFilter(stage)}
              className={cn("px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap",
                stageFilter === stage ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50")}>
              {STAGE_CONFIG[stage].label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Calendar size={14} className="text-slate-400" />
            <select value={dateRangeFilter} onChange={(e) => setDateRangeFilter(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none">
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
            {dateRangeFilter === 'CUSTOM' && (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none" />
                <span className="text-slate-300 text-xs">-</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-600 focus:outline-none" />
              </div>
            )}
            {dateRangeFilter !== 'ALL' && (
              <button onClick={() => { setDateRangeFilter('ALL'); setStartDate(''); setEndDate(''); }}
                className="p-0.5 hover:bg-slate-200 rounded text-slate-400 ml-1">
                <X size={12} />
              </button>
            )}
          </div>

          {/* More Filters */}
          <div className="relative">
            <button onClick={() => setIsMoreFiltersOpen(!isMoreFiltersOpen)}
              className={cn("flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-all",
                (industryFilter !== 'ALL' || sourceFilter !== 'ALL' || assigneeFilter !== 'ALL')
                  ? "bg-brand-50 border-brand-200 text-brand-600"
                  : "text-slate-600 border-slate-200 hover:bg-slate-50")}>
              <Filter size={14} />More Filters
              {(industryFilter !== 'ALL' || sourceFilter !== 'ALL' || assigneeFilter !== 'ALL') && (
                <span className="w-2 h-2 bg-brand-600 rounded-full" />
              )}
            </button>
            <AnimatePresence>
              {isMoreFiltersOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMoreFiltersOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 space-y-4"
                  >
                    {[
                      { label: 'Industry', value: industryFilter, onChange: setIndustryFilter, options: Array.from(new Set(leads.map(l => l.industry))), allLabel: 'All Industries' },
                      { label: 'Source', value: sourceFilter, onChange: setSourceFilter, options: Array.from(new Set(leads.map(l => l.source))), allLabel: 'All Sources' },
                    ].map(({ label, value, onChange, options, allLabel }) => (
                      <div key={label}>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">{label}</label>
                        <select value={value} onChange={(e) => onChange(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                          <option value="ALL">{allLabel}</option>
                          {options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Assigned To</label>
                      <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20">
                        <option value="ALL">All Assignees</option>
                        {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                      </select>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between">
                      <button onClick={() => { setIndustryFilter('ALL'); setSourceFilter('ALL'); setAssigneeFilter('ALL'); }}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Reset</button>
                      <button onClick={() => setIsMoreFiltersOpen(false)}
                        className="text-[10px] font-bold text-brand-600 hover:text-brand-700 uppercase tracking-widest">Apply</button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {currentUser.role !== 'BDE' && (
            <button onClick={onExport}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
              <Download size={14} />Export
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              {['Lead Details', 'Status', 'Value', 'Industry / Source', 'Assigned To', 'Next Follow-up', 'Created', ''].map(h => (
                <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map(lead => (
              <tr key={lead.id} onClick={() => onSelectLead(lead)}
                className="data-grid-row cursor-pointer group">
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-slate-900 group-hover:text-brand-600">{lead.name}</span>
                  <span className="block text-xs text-slate-500 font-mono">{lead.phone}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn("status-pill", STAGE_CONFIG[lead.stage].color)}>{STAGE_CONFIG[lead.stage].label}</span>
                  {isFollowUpOverdue(lead) && (
                    <span className="block text-[8px] font-bold text-red-500 uppercase tracking-widest mt-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-red-50 rounded border border-red-100 w-fit">
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
                    <img src={MOCK_USERS.find(u => u.id === lead.assignedToId)?.avatar} alt="" className="w-6 h-6 rounded-full border border-slate-200" />
                    <span className="text-xs font-medium text-slate-600">{MOCK_USERS.find(u => u.id === lead.assignedToId)?.name}</span>
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
                <td className="px-6 py-4 text-right">
                  <button className="p-1 text-slate-300 hover:text-slate-600"><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLeads.length === 0 && (
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
  </div>
);
