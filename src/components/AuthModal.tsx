import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, AlertCircle, CheckCircle2, KeyRound, Sparkles, Database, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AuthModalMode } from '../types';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    signIn,
    signUp,
    isConfigured,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSwitchTab = (newMode: AuthModalMode) => {
    resetForm();
    openAuthModal(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isConfigured) {
      setErrorMsg(
        'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
      );
      return;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    if (authModalMode !== 'reset' && !password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    if (authModalMode === 'signup') {
      if (!username.trim()) {
        setErrorMsg('Please choose a username for your profile.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (authModalMode === 'signin') {
        await signIn(email, password);
        closeAuthModal();
      } else if (authModalMode === 'signup') {
        await signUp(email, password, username);
        setSuccessMsg('Account created successfully! You are now logged in.');
        setTimeout(() => {
          closeAuthModal();
        }, 800);
      }
    } catch (err: any) {
      console.error('[AuthModal] Submission error:', err);
      const message =
        err?.message ||
        'Authentication failed. Please check your credentials and try again.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl bg-[#141822] border border-white/10 shadow-2xl p-6 sm:p-8 text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-lg text-theme-sub hover:text-white hover:bg-white/5 transition-colors"
          title="Close (Esc)"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-theme-main/10 border border-theme-main/30 text-theme-main mb-3 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
            {authModalMode === 'signup' ? (
              <UserPlus size={22} />
            ) : authModalMode === 'reset' ? (
              <KeyRound size={22} />
            ) : (
              <LogIn size={22} />
            )}
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {authModalMode === 'signin' && 'Welcome Back to TypeFlow'}
            {authModalMode === 'signup' && 'Create Your TypeFlow Account'}
            {authModalMode === 'reset' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-theme-sub mt-1">
            {authModalMode === 'signin' && 'Log in to sync your typing records across all devices.'}
            {authModalMode === 'signup' && 'Track progress, claim your username, and join the leaderboard.'}
            {authModalMode === 'reset' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Configuration Notice if .env credentials missing */}
        {!isConfigured && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5 leading-relaxed">
            <Database size={16} className="shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold mb-0.5">Database Setup Required</p>
              <p className="text-[11px] text-amber-300/80">
                To connect real cloud accounts, configure <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">VITE_SUPABASE_URL</code> and <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">VITE_SUPABASE_ANON_KEY</code> in your <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">.env</code> file. Check <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">.env.example</code> & <code className="bg-black/30 px-1 py-0.5 rounded text-amber-200">supabase/schema.sql</code>.
              </p>
            </div>
          </div>
        )}

        {/* Tabs: Sign In / Create Account */}
        {authModalMode !== 'reset' && (
          <div className="flex rounded-xl bg-white/5 p-1 mb-5 border border-white/5">
            <button
              type="button"
              onClick={() => handleSwitchTab('signin')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                authModalMode === 'signin'
                  ? 'bg-theme-main text-black font-semibold shadow-md'
                  : 'text-theme-sub hover:text-white'
              }`}
            >
              <LogIn size={14} /> Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('signup')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                authModalMode === 'signup'
                  ? 'bg-theme-main text-black font-semibold shadow-md'
                  : 'text-theme-sub hover:text-white'
              }`}
            >
              <UserPlus size={14} /> Create Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
            <span className="flex-1">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username (Only for Sign Up) */}
          {authModalMode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-theme-sub mb-1.5">Username</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-sub" />
                <input
                  type="text"
                  required
                  placeholder="e.g. speedtyper99"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-theme-main transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div>
            <label className="block text-xs font-medium text-theme-sub mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-sub" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-theme-main transition-colors"
              />
            </div>
          </div>

          {/* Password (for Sign In and Sign Up) */}
          {authModalMode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-theme-sub">Password</label>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-sub" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-theme-main transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-theme-sub hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-theme-main text-black font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Sparkles size={16} />
                {authModalMode === 'signin' && 'Sign In'}
                {authModalMode === 'signup' && 'Create Free Account'}
                {authModalMode === 'reset' && 'Send Recovery Email'}
              </>
            )}
          </button>
        </form>

        {/* Footer info: guest continuation */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-theme-sub">
          <button
            type="button"
            onClick={closeAuthModal}
            className="hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            Practice Without Saving
          </button>
          <span className="text-[11px] text-white/30">100% Online &bull; PostgreSQL Powered</span>
        </div>
      </div>
    </div>
  );
};
