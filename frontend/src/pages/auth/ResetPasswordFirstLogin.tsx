import React, { useState } from 'react';
import { Lock, Loader2, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { changePassword } from '@lib/api';
import { useAuth } from '@contexts/AuthContext';
import { motion } from 'motion/react';

export const ResetPasswordFirstLogin = () => {
  const { user, token, updateUser, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return;
    }

    if (newPassword === currentPassword) {
      setError("New password cannot be the same as current password");
      return;
    }

    setIsLoading(true);

    try {
      if (!token) throw new Error("No active session");
      await changePassword(token, currentPassword, newPassword);
      setIsSuccess(true);
      // Wait a bit then update user state to proceed to dashboard
      setTimeout(() => {
        updateUser({ mustResetPassword: false });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-brand-500/20 mb-6 border border-brand-500/30 text-brand-400">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Secure Your Account</h1>
          <p className="text-slate-400">Since this is your first login, please update your password to continue.</p>
        </div>

        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-lg shadow-2xl relative">
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-4"
            >
              <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Password Updated!</h3>
                <p className="text-slate-400">
                  Redirecting you to your dashboard...
                </p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Current Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <KeyRound className="h-5 w-5 text-slate-500 group-focus-within:text-brand-500 transition-colors" />
                    </div>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-4 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all font-medium"
                      placeholder="Enter temporary password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-brand-500 transition-colors" />
                    </div>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-4 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all font-medium"
                      placeholder="At least 8 characters"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Confirm New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-brand-500 transition-colors" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-4 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all font-medium"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full relative group overflow-hidden rounded-lg bg-brand-600 hover:bg-brand-500 transition-all active:scale-[0.98]"
                >
                  <div className="relative flex items-center justify-center py-4 text-white font-bold tracking-wide">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Set New Password & Continue"
                    )}
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-3 text-slate-500 hover:text-slate-300 text-sm font-bold transition-colors"
                >
                  Cancel & Sign Out
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
