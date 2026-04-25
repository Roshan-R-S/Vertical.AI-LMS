import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppProvider from './context/AppContext';
import { useApp } from './context/AppContextCore';




import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import BDEDashboard from './pages/BDEDashboard';
import TLDashboard from './pages/TLDashboard';
import Leads from './pages/Leads';
import Clients from './pages/Clients';
import UserCreation from './pages/UserCreation';
import TeamPerformance from './pages/TeamPerformance';
import Leaderboard from './pages/Leaderboard';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Tasks from './pages/Tasks';
import WorkQueue from './pages/WorkQueue';
import Pipeline from './pages/Pipeline';
import Notifications from './pages/Notifications';
import ChannelPartners from './pages/ChannelPartners';
import GlobalSearch from './components/GlobalSearch';


function AppShell() {
  const { currentUser, loading, processing } = useApp();

  if (loading) return (
    <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
      <div className="animate-pulse" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>Initializing Vertical AI...</div>
    </div>
  );

  if (!currentUser) return <Login />;

  const isBDE = currentUser.role === 'BDE';
  const isTL = currentUser.role === 'Team Lead';

  return (
    <div className="app-layout">
      {processing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--card-bg)', padding: '24px 48px', borderRadius: '16px', boxShadow: '0 12px 48px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="spinner" style={{ width: '24px', height: '24px', border: '3px solid var(--brand-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>Processing...</span>
          </div>
        </div>
      )}
      <Sidebar />
      <div className="main-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
        <GlobalSearch />
        <main className="page-content" style={{ flex: 1, overflowY: 'auto' }}>
          <Routes>
            <Route path="/" element={
              isBDE ? <BDEDashboard /> : 
              isTL ? <TLDashboard /> : 
              <Dashboard />
            } />
            <Route path="/work-queue" element={<WorkQueue />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/users" element={<UserCreation />} />
            <Route path="/team" element={<TeamPerformance />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/partners" element={<ChannelPartners />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
