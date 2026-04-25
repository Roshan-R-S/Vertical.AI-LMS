import { useState } from 'react';
import { useApp } from '../context/AppContextCore';
import { Shield, UserCheck, User, Zap, ChevronRight, Lock } from 'lucide-react';

export default function Login() {
  const { login, formatError } = useApp();
  const [selectedRole, setSelectedRole] = useState('Super Admin');
  const [loading, setLoading] = useState(false);

  const roles = [
    { name: 'Super Admin', icon: Shield, color: '#6366f1', desc: 'Full system access & billing' },
    { name: 'Team Lead', icon: UserCheck, color: '#06b6d4', desc: 'Team pipeline & analytics' },
    { name: 'BDE', icon: User, color: '#10b981', desc: 'Individual leads & calling' }
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(selectedRole);
    } catch (err) {
      alert(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        
        {/* Branding header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(16,185,129,0.2)' }}>
            <Zap size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vertical AI LMS</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Select a role to preview the customized workspace</p>
        </div>

        {/* Login Card */}
        <form onSubmit={handleLogin} className="studio-card" style={{ padding: 32, border: '1px solid var(--border-subtle)' }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Select Access Level
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {roles.map(r => (
                <div 
                  key={r.name} 
                  onClick={() => setSelectedRole(r.name)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px', 
                    borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                    background: selectedRole === r.name ? `${r.color}15` : 'var(--bg-surface)',
                    border: `1px solid ${selectedRole === r.name ? r.color : 'var(--border-default)'}`
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${r.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <r.icon size={20} color={r.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: selectedRole === r.name ? r.color : 'var(--text-primary)' }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{r.desc}</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedRole === r.name ? r.color : 'var(--border-subtle)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedRole === r.name && <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.color }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
             <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Password</label>
             <div style={{ position: 'relative' }}>
               <input type="password" value="demo-password" readOnly style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, color: 'var(--text-muted)', fontSize: 14, cursor: 'not-allowed' }} />
               <Lock size={16} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
             </div>
             <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>* Password is pre-filled for this interactive demo.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', padding: '14px', background: 'var(--text-primary)', color: 'var(--bg-page)', 
              border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.2s',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Authenticating...' : `Login as ${selectedRole}`}
            {!loading && <ChevronRight size={18} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--text-muted)' }}>
          © 2026 The Vertical AI • Private Access
        </p>
      </div>
    </div>
  );
}
