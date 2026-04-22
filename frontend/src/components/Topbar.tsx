import {
  Bell,
  ChevronDown,
  FileSpreadsheet,
  LayoutDashboard,
  Plus,
  Search,
  UserCircle,
  X
} from 'lucide-react';
import React from 'react';
import { cn } from '@lib/utils';
import { User } from '@/types';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'REMINDER' | 'INFO';
}

interface TopbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  isNewLeadDropdownOpen: boolean;
  setIsNewLeadDropdownOpen: (open: boolean) => void;
  setIsAddModalOpen: (open: boolean) => void;
  setIsBulkModalOpen: (open: boolean) => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  currentUser: User;
}

export const Topbar = ({
  searchQuery, setSearchQuery, notifications, setNotifications,
  isNewLeadDropdownOpen, setIsNewLeadDropdownOpen,
  setIsAddModalOpen, setIsBulkModalOpen, setIsMobileMenuOpen, currentUser
}: TopbarProps) => (
  <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between z-10">
    <div className="flex items-center gap-4 flex-1 max-w-xl">
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg lg:hidden transition-colors"
      >
        <LayoutDashboard size={18} />
      </button>
      <div className="relative w-full group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={16} />
        <input
          type="text"
          placeholder="Search Leads, Tasks, Clients..."
          className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>

    <div className="flex items-center gap-2 lg:gap-4">
      {/* Notifications */}
      <div className="relative group">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell size={18} />
          {notifications.length > 0 && (
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-brand-600 rounded-full border border-white" />
          )}
        </button>
        <div className="absolute right-0 mt-2 w-72 surface-card rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 p-1 border-slate-200">
          <div className="p-2 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Notifications</h3>
            <button onClick={() => setNotifications([])} className="text-[10px] font-bold text-brand-600 hover:text-brand-700 px-1">Clear</button>
          </div>
          <div className="max-h-80 overflow-y-auto p-1 space-y-1">
            {notifications.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">No Active Notifications</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-3 hover:bg-slate-50 rounded-md relative group/n transition-colors border border-transparent hover:border-slate-100">
                  <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-0.5">{n.title}</p>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{n.message}</p>
                  <button
                    onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}
                    className="absolute top-1 right-1 p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover/n:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="h-6 w-px bg-slate-200 hidden sm:block" />

      {/* New Lead Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsNewLeadDropdownOpen(!isNewLeadDropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Lead</span>
          <ChevronDown size={12} className={cn("transition-transform opacity-50", isNewLeadDropdownOpen && "rotate-180")} />
        </button>
        
        {isNewLeadDropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsNewLeadDropdownOpen(false)} />
            <div className="absolute right-0 mt-2 w-48 surface-card rounded-lg shadow-lg z-50 overflow-hidden p-1 border-slate-200 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => { setIsAddModalOpen(true); setIsNewLeadDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-md transition-colors text-left"
              >
                <div className="w-6 h-6 rounded bg-brand-50 flex items-center justify-center">
                  <UserCircle size={14} className="text-brand-600" />
                </div>
                Single Lead
              </button>
              {(currentUser.role !== 'BDE' || currentUser.canBulkUpload) && (
                <button
                  onClick={() => { setIsBulkModalOpen(true); setIsNewLeadDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-md transition-colors text-left"
                >
                  <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center">
                    <FileSpreadsheet size={14} className="text-emerald-600" />
                  </div>
                  Bulk Upload
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  </header>
);
