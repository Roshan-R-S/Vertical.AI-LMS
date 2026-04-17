import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { requestPasswordReset } from '@lib/api';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export const ForgotPassword = ({ onBackToLogin }: ForgotPasswordProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] mix-blend-screen" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6 relative">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center backdrop-blur-sm border border-brand-500/30">
                <div className="w-6 h-6 rounded-full bg-brand-500" />
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center backdrop-blur-sm border border-indigo-500/30">
                <div className="w-6 h-6 rounded-full bg-indigo-500" />
              </div>
            </div>
            <span className="text-3xl font-black text-white tracking-widest uppercase">
              Vertical<span className="text-brand-400">.AI</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Reset your password</h1>
          <p className="text-slate-400">Enter your email and we'll send you a link to reset your password.</p>
        </div>

        <div className="backdrop-blur-xl bg-white/3 border border-white/8 p-8 rounded-3xl shadow-2xl relative">
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Check your email</h3>
                <p className="text-slate-400 text-sm">
                  We've sent a password reset link to <span className="font-semibold text-white">{email}</span>.
                </p>
              </div>
              <button
                onClick={onBackToLogin}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10"
              >
                Back to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-transparent transition-all"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full relative group overflow-hidden rounded-xl"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-brand-600 to-indigo-600 group-hover:opacity-90 transition-opacity" />
                  <div className="relative flex items-center justify-center py-4 text-white font-bold tracking-wide">
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Send Reset Link"
                    )}
                  </div>
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
