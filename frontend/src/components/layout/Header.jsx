import { Globe, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContextCore';

const PAGE_META = {
  '/': { title: 'Dashboard', subtitle: 'Real-time business intelligence & analytics' },
  '/leads': { title: 'Leads', subtitle: 'Manage and track your sales pipeline' },
  '/clients': { title: 'Clients', subtitle: 'Post-conversion client relationship management' },
  '/team': { title: 'Team Performance', subtitle: 'Pipeline management & productivity tracking' },
  '/users': { title: 'User Management', subtitle: 'Roles, permissions & team hierarchy' },
  '/billing': { title: 'Billing & Invoices', subtitle: 'Financial management & payment tracking' },
  '/settings': { title: 'Settings', subtitle: 'Disposition management & system configuration' },
};

export default function Header({ pathname }) {
  useApp();
  const currentPath = Object.keys(PAGE_META).find(k => k === pathname) || '/';
  const meta = PAGE_META[currentPath] || PAGE_META['/'];

  return (
    <header className="top-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-ghost btn-sm" style={{ padding: 4, height: 24, width: 24, border: '1px solid var(--border-default)', borderRadius: '50%' }}>
          <ChevronLeft size={14} />
        </button>
        <div style={{ fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
          HOME <ChevronRight size={10} /> [ {meta.title} ]
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'Space Mono', color: 'var(--text-muted)' }}>
          <Globe size={14} />
          <span>(GMT+5:30) Chennai, ..</span>
        </div>
        <button className="btn btn-ghost btn-sm btn-icon" title="Refresh">
          <RefreshCw size={14} color="var(--text-muted)" />
        </button>
      </div>
    </header>
  );
}
