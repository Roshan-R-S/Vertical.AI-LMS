import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail, User } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { cn } from '@lib/utils';
import { Role } from '@/types';
import { InteractiveVisuals } from '@components/ui/InteractiveVisuals';

export const RegisterPage = ({ onSwitchToLogin }: { onSwitchToLogin: () => void }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('BDE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      const data = await register(email, password, name, role);
      setMessage(data.message);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden font-sans">
      <InteractiveVisuals />

      <div className="flex-1 flex items-center justify-center p-8 bg-white relative border-l border-slate-200 shadow-2xl">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-brand-600 font-bold text-2xl mb-12 text-center">Vertical.AI</div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-left mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Join the Elite</h2>
              <p className="text-slate-500">Unlock the full potential of your team today.</p>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm mb-6">
                <AlertCircle size={18} className="shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {message ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Check your email</h3>
                <p className="text-slate-500 mb-8">{message}</p>
                <button 
                  onClick={onSwitchToLogin}
                  className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-500 transition-all"
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-brand-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Roshan RS" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Assign Role</label>
                  <div className="relative group">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 transition-all font-bold appearance-none cursor-pointer"
                    >
                      <option value="BDE">Sales Representative (BDE)</option>
                      <option value="TEAM_LEAD">Team Leader</option>
                      <option value="SALES_ADMIN">Sales Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                      <ArrowRight size={18} className="rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Login Email</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-brand-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Create Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-brand-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 transition-all font-medium"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={cn(
                    "w-full py-4 rounded-xl text-sm font-bold shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 group",
                    isSubmitting 
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                      : "bg-brand-600 text-white hover:bg-brand-500 shadow-brand-500/20"
                  )}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-500 border-t-brand-500 rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}

            {!message && (
              <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                  Already part of Vertical.AI? <button onClick={onSwitchToLogin} className="font-bold text-brand-600 hover:text-brand-500 ml-1">Sign in</button>
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
