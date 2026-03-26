import React from 'react';
import {
  Search, Bell, Plus, ChevronDown, X, FileSpreadsheet, UserCircle, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { cn } from '../lib/utils';

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
  <header className="h-16 bg-white/40 backdrop-blur-xl border-b border-slate-200/60 px-4 lg:px-8 flex items-center justify-between z-10">
    <div className="flex items-center gap-4 flex-1 max-w-xl">
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="p-2 text-slate-400 hover:bg-white/5 rounded-lg lg:hidden transition-colors"
      >
        <LayoutDashboard size={20} />
      </button>
      <div className="relative w-full group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
        <input
          type="text"
          placeholder="Search global workspace..."
          className="w-full pl-10 pr-4 py-2 bg-slate-100/50 border border-slate-200/60 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>

    <div className="flex items-center gap-2 lg:gap-5">
      {/* Notifications */}
      <div className="relative group">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all">
          <Bell size={20} />
          {notifications.length > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full border-2 border-white" />
          )}
        </button>
        <div className="absolute right-0 mt-2 w-72 sm:w-80 glass-card rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 border border-slate-200/60">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notifications</h3>
            <button onClick={() => setNotifications([])} className="text-[10px] font-bold text-brand-600 hover:text-brand-500">Clear All</button>
          </div>
          <div className="max-h-96 overflow-y-auto p-1 space-y-1 mt-1">
            {notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell size={24} className="mx-auto text-slate-700 mb-2 opacity-20" />
                <p className="text-[10px] font-bold text-slate-600 tracking-widest uppercase">System Clear</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/40 relative group/n transition-colors">
                  <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">{n.title}</p>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{n.message}</p>
                  <button
                    onClick={() => setNotifications(prev => prev.filter(x => x.id !== n.id))}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover/n:opacity-100 transition-all"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="h-6 w-px bg-white/10 hidden sm:block" />

      {/* New Lead Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsNewLeadDropdownOpen(!isNewLeadDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-500 shadow-lg shadow-brand-500/20 transition-all active:scale-95 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform" />
          <span className="hidden sm:inline">New Action</span>
          <ChevronDown size={14} className={cn("transition-transform opacity-60", isNewLeadDropdownOpen && "rotate-180")} />
        </button>
        <AnimatePresence>
          {isNewLeadDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNewLeadDropdownOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-56 glass-card rounded-2xl shadow-2xl z-50 overflow-hidden border border-white/10 p-1"
              >
                <button
                  onClick={() => { setIsAddModalOpen(true); setIsNewLeadDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                    <UserCircle size={18} className="text-brand-500" />
                  </div>
                  Single Opportunity
                </button>
                <button
                  onClick={() => { setIsBulkModalOpen(true); setIsNewLeadDropdownOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <FileSpreadsheet size={18} className="text-emerald-500" />
                  </div>
                  Bulk Ingestion
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  </header>
);
