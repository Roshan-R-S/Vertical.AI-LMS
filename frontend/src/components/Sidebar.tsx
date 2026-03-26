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
    X
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { User } from '../types';

const SidebarItem = ({ icon: Icon, label, active, onClick }: {
  icon: any; label: string; active?: boolean; onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-xl mb-1 group relative overflow-hidden",
      active
        ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
        : "text-slate-600 hover:bg-slate-50 hover:text-brand-600"
    )}
  >
    <Icon size={18} className={cn("transition-transform", active ? "scale-110" : "group-hover:scale-110")} />
    <span>{label}</span>
    {active && (
      <motion.div 
        layoutId="activeTab"
        className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
      />
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
  const nav = (tab: string) => { setActiveTab(tab); setIsMobileMenuOpen(false); };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 w-64 bg-white/80 backdrop-blur-2xl border-r border-slate-200/60 flex flex-col z-40 transition-transform duration-300 lg:relative lg:translate-x-0",
      isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Brand Section */}
      <div className="p-6 flex items-center justify-between lg:justify-start gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-600/20">
            <TrendingUp className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-lg">Vertical</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise CRM</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="p-2 text-slate-400 hover:bg-white/5 rounded-lg lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_ADMIN' || currentUser.role === 'TEAM_LEAD') && (
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => nav('dashboard')} />
        )}
        <SidebarItem icon={Target} label="Leads" active={activeTab === 'leads'} onClick={() => nav('leads')} />
        {(currentUser.role === 'SALES_ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
          <SidebarItem icon={BarChart3} label="Targets" active={activeTab === 'targets'} onClick={() => nav('targets')} />
        )}
        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_ADMIN' || currentUser.role === 'TEAM_LEAD') && (
          <SidebarItem icon={History} label="Status History" active={activeTab === 'stage-history'} onClick={() => nav('stage-history')} />
        )}
        <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => nav('settings')} />
        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_ADMIN') && (
          <SidebarItem icon={Users} label="Clients" active={activeTab === 'clients'} onClick={() => nav('clients')} />
        )}
        {(currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SALES_ADMIN' || currentUser.role === 'TEAM_LEAD') && (
          <SidebarItem icon={FileText} label="Reports" active={activeTab === 'reports'} onClick={() => nav('reports')} />
        )}
        {currentUser.role === 'SUPER_ADMIN' && (
          <>
            <div className="my-6 border-t border-white/5 mx-2" />
            <SidebarItem icon={UserCircle} label="User Management" active={activeTab === 'users'} onClick={() => nav('users')} />
          </>
        )}
      </nav>

      {/* User Session Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200/50 shadow-sm">
          <div className="relative">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full border border-slate-100 ring-2 ring-brand-500/10" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate leading-tight">{currentUser.name}</p>
            <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">{currentUser.role.replace('_', ' ')}</p>
          </div>
          <button 
            onClick={onLogout} 
            className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};
