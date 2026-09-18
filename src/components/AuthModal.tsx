import React, { useState } from 'react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Upload,
  Database,
  Check,
} from 'lucide-react';
import { AuthMode, UserProfile } from '../types';
import { Identicon } from './Identicon';
import {
  generateRandomUsername,
  getNameSuggestions,
} from '../utils/nameGenerator';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import { authService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (profile: UserProfile) => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState(() => generateRandomUsername());
  const [avatarSeed, setAvatarSeed] = useState(() => username);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(() => getNameSuggestions(4));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleRefreshSuggestions = () => {
    setSuggestions(getNameSuggestions(4, username));
  };

  const handleRollRandomName = () => {
    const newName = generateRandomUsername();
    setUsername(newName);
    if (!customAvatar) {
      setAvatarSeed(newName);
    }
  };

  const handleSelectSuggestion = (sug: string) => {
    setUsername(sug);
    if (!customAvatar) {
      setAvatarSeed(sug);
    }
  };

  const handleRerollIdenticon = () => {
    const newSeed = `${username}-${Math.random().toString(36).substring(2, 8)}`;
    setAvatarSeed(newSeed);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setCustomAvatar(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!username.trim()) {
          throw new Error('Please choose a username');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        const profile = await authService.signUp(
          email,
          password,
          username,
          avatarSeed,
          customAvatar
        );
        setSuccessMsg('Account created successfully! Welcome to TypeFlow.');
        setTimeout(() => {
          onSuccess?.(profile);
          onClose();
        }, 800);
      } else {
        const profile = await authService.signIn(email, password);
        setSuccessMsg(`Welcome back, ${profile.username}!`);
        setTimeout(() => {
          onSuccess?.(profile);
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#131722] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-7 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-theme-main/10 border border-theme-main/30 flex items-center justify-center text-theme-main">
              {mode === 'signin' ? <LogIn size={18} /> : <UserPlus size={18} />}
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {mode === 'signin' ? 'Sign In to TypeFlow' : 'Create an Account'}
              </h2>
              <p className="text-xs text-theme-sub">
                {mode === 'signin'
                  ? 'Access your profile and saved records'
                  : 'Get a custom handle, GitHub avatar, and track tests'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-sub hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Backend Status Pill */}
        <div className="mb-4 flex items-center justify-between text-[11px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
          <div className="flex items-center gap-1.5 text-theme-sub">
            <Database size={12} className={isConfigured ? 'text-emerald-400' : 'text-cyan-400'} />
            <span>Backend: {isConfigured ? 'Supabase PostgreSQL Cloud' : 'Local Storage Engine'}</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl bg-white/5 p-1 mb-5 border border-white/5">
          <button
            type="button"
            onClick={() => handleSwitchMode('signin')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signin'
                ? 'bg-theme-main text-black font-semibold shadow-md'
                : 'text-theme-sub hover:text-white'
            }`}
          >
            <LogIn size={14} /> Sign In
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('signup')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-theme-main text-black font-semibold shadow-md'
                : 'text-theme-sub hover:text-white'
            }`}
          >
            <UserPlus size={14} /> Create Account
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
            <span className="flex-1">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
            <span className="flex-1">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Sign Up Fields */}
          {mode === 'signup' && (
            <>
              {/* Avatar Preview & Identicon Generator */}
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center gap-3.5">
                <div className="relative group shrink-0">
                  {customAvatar ? (
                    <img
                      src={customAvatar}
                      alt="Avatar"
                      className="w-14 h-14 rounded-xl object-cover ring-2 ring-theme-main/40"
                    />
                  ) : (
                    <Identicon
                      seed={avatarSeed}
                      size={56}
                      className="rounded-xl ring-1 ring-white/10"
                      alt="GitHub Identicon"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>{customAvatar ? 'Custom Photo' : 'GitHub 5x5 Identicon'}</span>
                  </div>
                  <p className="text-[11px] text-theme-sub truncate">
                    Unique avatar generated from your username
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={handleRerollIdenticon}
                      className="text-[11px] text-theme-sub hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw size={10} /> Re-roll
                    </button>
                    <label className="text-[11px] text-theme-main hover:underline cursor-pointer flex items-center gap-1">
                      <Upload size={10} /> Upload
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {customAvatar && (
                      <button
                        type="button"
                        onClick={() => setCustomAvatar(null)}
                        className="text-[11px] text-rose-400 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Username with Randomizer */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-theme-sub">Choose Username</label>
                  <button
                    type="button"
                    onClick={handleRollRandomName}
                    className="text-xs text-theme-main hover:underline flex items-center gap-1 transition-colors"
                  >
                    <Sparkles size={12} />
                    <span>Random Name</span>
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-sub font-mono text-sm">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    placeholder="e.g. CyberTypist"
                    autoFocus={mode === 'signup'}
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (!customAvatar && e.target.value.trim()) {
                        setAvatarSeed(e.target.value.trim());
                      }
                    }}
                    className="w-full pl-8 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-theme-main transition-colors font-medium"
                  />
                </div>

                {/* Suggestions */}
                <div className="mt-2 flex items-center flex-wrap gap-1.5">
                  <span className="text-[10px] text-theme-sub">Suggestions:</span>
                  {suggestions.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => handleSelectSuggestion(sug)}
                      className={`px-2 py-0.5 text-[11px] rounded-md border transition-all ${
                        username === sug
                          ? 'bg-theme-main/20 text-theme-main border-theme-main/40 font-semibold'
                          : 'bg-white/5 text-theme-sub border-white/5 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleRefreshSuggestions}
                    title="Get more suggestions"
                    className="p-1 rounded-md text-theme-sub hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <RefreshCw size={11} />
                  </button>
                </div>
              </div>
            </>
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
                autoFocus={mode === 'signin'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-theme-main transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-theme-sub">Password</label>
              {mode === 'signup' && (
                <span className="text-[10px] text-theme-sub">Min 6 characters</span>
              )}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-theme-main text-black font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <Check size={16} />
                {mode === 'signin' ? 'Sign In' : 'Create Free Account'}
              </>
            )}
          </button>
        </form>

        {/* Switch tab prompt */}
        <div className="mt-5 text-center text-xs text-theme-sub">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('signup')}
                className="text-theme-main hover:underline font-semibold"
              >
                Create one now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => handleSwitchMode('signin')}
                className="text-theme-main hover:underline font-semibold"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
