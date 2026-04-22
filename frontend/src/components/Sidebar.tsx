import React, { useState } from 'react';
import {
    BarChart3,
    FileText,
    History,
    LayoutDashboard,
    LogOut,
    Settings,
    Target,
    TrendingUp,
    UserCircle,
    Users,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowLeftFromLine,
    ArrowRightFromLine
} from 'lucide-react';
import { cn } from '@lib/utils';
import { User } from '@/types';

const SidebarItem = ({ icon: Icon, label, active, onClick }: {
  icon: any; label: string; active?: boolean; onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1 group relative overflow-hidden",
      active
        ? "bg-brand-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-50 hover:text-brand-600"
    )}
  >
    <Icon size={18} className="shrink-0" />
    {label && <span className="truncate">{label}</span>}
    {active && (
      <div className="absolute right-2 w-1 h-4 bg-white/20 rounded-full" />
    )}
  </button>
);

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onLogout: () => void;
}

export const Sidebar = ({
  currentUser, activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen, onLogout
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const nav = (tab: string) => { setActiveTab(tab); setIsMobileMenuOpen(false); };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 bg-white border-r border-slate-200 flex flex-col z-40 transition-all duration-200 lg:relative lg:translate-x-0",
      isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Brand Section */}
      <div className={cn("p-6 flex items-center justify-between gap-3", isCollapsed && "px-4")}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
            <TrendingUp className="text-white" size={20} />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight text-base leading-tight">Vertical</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Enterprise CRM</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-2 space-y-0.5 overflow-y-auto scrollbar-hide">
        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_HEAD' || currentUser.role === 'TEAM_LEAD') && (
          <SidebarItem icon={LayoutDashboard} label={isCollapsed ? "" : "Dashboard"} active={activeTab === 'dashboard'} onClick={() => nav('dashboard')} />
        )}
        <SidebarItem icon={Target} label={isCollapsed ? "" : "Leads"} active={activeTab === 'leads' || activeTab === 'lead-details'} onClick={() => nav('leads')} />
        {(currentUser.role === 'SALES_HEAD' || currentUser.role === 'SUPER_ADMIN') && (
          <SidebarItem icon={BarChart3} label={isCollapsed ? "" : "Targets"} active={activeTab === 'targets'} onClick={() => nav('targets')} />
        )}
        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_HEAD' || currentUser.role === 'TEAM_LEAD') && (
          <SidebarItem icon={History} label={isCollapsed ? "" : "Status History"} active={activeTab === 'stage-history'} onClick={() => nav('stage-history')} />
        )}
        <SidebarItem icon={Settings} label={isCollapsed ? "" : "Settings"} active={activeTab === 'settings'} onClick={() => nav('settings')} />
        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_HEAD') && (
          <SidebarItem icon={Users} label={isCollapsed ? "" : "Clients"} active={activeTab === 'clients'} onClick={() => nav('clients')} />
        )}
        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_HEAD' || currentUser.role === 'TEAM_LEAD') && (
          <SidebarItem icon={FileText} label={isCollapsed ? "" : "Reports"} active={activeTab === 'reports'} onClick={() => nav('reports')} />
        )}
        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_HEAD' || currentUser.role === 'TEAM_LEAD') && (
          <>
            <div className="my-6 border-t border-slate-100 mx-2" />
            <SidebarItem icon={UserCircle} label={isCollapsed ? "" : "Users & Teams"} active={activeTab === 'users'} onClick={() => nav('users')} />
          </>
        )}
      </nav>

      {/* Expand/Collapse Footer Button */}
      <div className="px-4 mb-2 hidden lg:block">
        {isCollapsed ? (
          <button 
            onClick={() => setIsCollapsed(false)}
            className="w-full flex items-center justify-center p-3 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors relative group"
            title="Expand Sidebar"
          >
            <ArrowRightFromLine size={18} />
          </button>
        ) : (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors group"
          >
            <ArrowLeftFromLine size={18} />
            <span>Collapse</span>
          </button>
        )}
      </div>

      {/* User Session Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-200 shadow-sm transition-colors",
          isCollapsed ? "justify-center px-1" : "px-3"
        )}>
          <div className="relative shrink-0">
            <img 
              src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`} 
              alt={currentUser.name} 
              className="w-8 h-8 rounded-full border border-slate-100 object-cover" 
              crossOrigin="anonymous"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate leading-tight">{currentUser.name}</p>
              <p className="text-[9px] font-bold text-brand-600 uppercase tracking-widest">{currentUser.role.replace('_', ' ')}</p>
            </div>
          )}
          {!isCollapsed && (
            <button 
              onClick={onLogout} 
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
