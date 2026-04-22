import { AlertCircle, ArrowRight, Lock, User as UserIcon } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { cn } from '@lib/utils';
import { InteractiveVisuals } from '@components/InteractiveVisuals';

export const LoginPage = ({ onSwitchToRegister, onForgotPassword }: { onSwitchToRegister: () => void, onForgotPassword: () => void }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden font-sans">
      <InteractiveVisuals />

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative border-l border-slate-200">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden text-slate-900 font-bold text-xl mb-12 text-center">Vertical</div>

          <div>
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Identity Access</h2>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Enterprise Authentication System</p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[10px] font-bold uppercase tracking-widest mb-6">
                <AlertCircle size={14} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Principal Identifier</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <UserIcon size={16} />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Username or Email" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secret Key</label>
                  <button type="button" onClick={onForgotPassword} className="text-[10px] font-bold text-brand-600 hover:text-brand-700">Recovery</button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all font-bold"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={cn(
                  "w-full py-3 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 mt-2",
                  isSubmitting 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                    : "bg-slate-900 text-white hover:bg-slate-800"
                )}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate Session</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                System Access Request? <button onClick={onSwitchToRegister} className="text-brand-600 hover:text-brand-700 ml-1">Registration</button>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="absolute bottom-8 text-center w-full max-w-sm left-1/2 -translate-x-1/2">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">
            Certified Enterprise Environment
          </p>
        </div>
      </div>
    </div>
  );
};
