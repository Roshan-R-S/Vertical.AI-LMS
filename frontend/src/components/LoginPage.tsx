import { AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { InteractiveVisuals } from './InteractiveVisuals';

export const LoginPage = ({ onSwitchToRegister, onForgotPassword }: { onSwitchToRegister: () => void, onForgotPassword: () => void }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden font-sans">
      <InteractiveVisuals />

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative border-l border-slate-200 shadow-2xl">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden text-brand-600 font-bold text-2xl mb-12 text-center">Vertical.AI</div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 mb-10">Sign in to your intelligent workspace.</p>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm mb-6"
              >
                <AlertCircle size={18} className="shrink-0" />
                <p className="font-medium">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Work Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center text-slate-500 group-focus-within:text-brand-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    placeholder="name@vertical.ai" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                  <button type="button" onClick={onForgotPassword} className="text-xs font-bold text-brand-500 hover:text-brand-400">Forgot?</button>
                </div>
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
                  "w-full py-4 rounded-xl text-sm font-bold shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 relative overflow-hidden group",
                  isSubmitting 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed" 
                    : "bg-brand-600 text-white hover:bg-brand-500 shadow-brand-500/20"
                )}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-500 border-t-brand-500 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                New to Vertical.AI? <button onClick={onSwitchToRegister} className="font-bold text-brand-600 hover:text-brand-500 ml-1">Create Account</button>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Footer Info */}
        <div className="absolute bottom-8 text-center w-full max-w-sm left-1/2 -translate-x-1/2">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] mb-1">
            Secure Enterprise Access
          </p>
          <div className="h-0.5 w-8 bg-brand-500/30 mx-auto rounded-full" />
        </div>
      </div>
    </div>
  );
};
