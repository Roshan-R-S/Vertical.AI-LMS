import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContextCore';
import { Zap, Mail, Lock, User, ChevronRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';

export default function Signup() {
  const { loginWithToken } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');

    setLoading(true);
    try {
      const res = await api.post('/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      await loginWithToken(res.token, res.user);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputIcon = (Icon) => (
    <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
  );

  const inputStyle = { paddingLeft: 36 };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(16,185,129,0.2)' }}>
            <Zap size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Vertical AI LMS
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Create your admin account to get started</p>
        </div>

        <div className="studio-card" style={{ padding: 32, border: '1px solid var(--border-subtle)' }}>
          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                {inputIcon(User)}
                <input className="form-input" type="text" placeholder="Arjun Mehta" value={form.name} onChange={set('name')} required style={inputStyle} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Work Email</label>
              <div style={{ position: 'relative' }}>
                {inputIcon(Mail)}
                <input className="form-input" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required style={inputStyle} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                {inputIcon(Lock)}
                <input className="form-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required style={inputStyle} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                {inputIcon(Lock)}
                <input className="form-input" type="password" placeholder="Repeat password" value={form.confirm} onChange={set('confirm')} required style={inputStyle} />
              </div>
            </div>

            {error && (
              <div style={{ fontSize: 13, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                {error}
              </div>
            )}

            {/* What gets created */}
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>This will set up your workspace:</div>
              {['Super Admin account', '10 default pipeline milestones', 'Default dispositions per stage', 'System settings'].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle size={12} color="#10b981" /> {item}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '13px', background: 'var(--text-primary)', color: 'var(--bg-page)', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Setting up workspace...' : 'Create Account'}
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <button
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', color: 'var(--brand-primary-light)', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0 }}
            >
              Sign in
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--text-muted)' }}>
          © 2026 The Vertical AI • Private Access
        </p>
      </div>
    </div>
  );
}
