import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, User, Phone, Building, ChevronRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';

export default function PartnerSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', companyName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/partner-signup', form);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const iconStyle = { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}>
            <Zap size={32} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Vertical AI LMS
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {submitted ? 'Request submitted!' : 'Request Channel Partner Access'}
          </p>
        </div>

        <div className="studio-card" style={{ padding: 32, border: '1px solid var(--border-subtle)' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={28} color="#6366f1" />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Request Submitted!</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
                Your request has been sent to the administrator. You'll receive an email once your access is approved.
              </p>
              <button
                onClick={() => navigate('/')}
                style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--brand-primary-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto' }}
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={iconStyle} />
                  <input className="form-input" type="text" placeholder="John Doe" value={form.name} onChange={set('name')} required style={{ paddingLeft: 36 }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Work Email *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={iconStyle} />
                  <input className="form-input" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} required style={{ paddingLeft: 36 }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <div style={{ position: 'relative' }}>
                  <Building size={15} style={iconStyle} />
                  <input className="form-input" type="text" placeholder="Acme Corp" value={form.companyName} onChange={set('companyName')} required style={{ paddingLeft: 36 }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={iconStyle} />
                  <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} style={{ paddingLeft: 36 }} />
                </div>
              </div>

              {error && (
                <div style={{ fontSize: 13, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Submitting...' : 'Request Access'}
                {!loading && <ChevronRight size={18} />}
              </button>

              <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--brand-primary-light)', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0 }}>
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--text-muted)' }}>
          © 2026 The Vertical AI • Private Access
        </p>
      </div>
    </div>
  );
}
