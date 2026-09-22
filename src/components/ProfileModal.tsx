import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  RefreshCw,
  Trash2,
  Sparkles,
  Check,
  Trophy,
  Zap,
  Target,
  Clock,
  Award,
  ShieldCheck,
  User,
  LogOut,
  Brain,
} from 'lucide-react';
import { UserProfile, TestResult } from '../types';
import { Identicon } from './Identicon';
import { WeaknessTrainer } from './WeaknessTrainer';
import {
  generateRandomUsername,
  getNameSuggestions,
  DEFAULT_DEV_TITLES,
} from '../utils/nameGenerator';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onSignOut: () => void;
  history: TestResult[];
  personalBests: Record<string, number>;
  onStartDrill: (text: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onSignOut,
  history,
  personalBests,
  onStartDrill,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'trainer'>('profile');
  const [username, setUsername] = useState(profile?.username || '');
  const [title, setTitle] = useState(profile?.title || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [customAvatar, setCustomAvatar] = useState<string | null>(profile?.customAvatar || null);
  const [avatarSeed, setAvatarSeed] = useState(profile?.avatarSeed || profile?.username || 'Typist');
  const [suggestions, setSuggestions] = useState<string[]>(() => getNameSuggestions(4, profile?.username || ''));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever profile opens or changes
  useEffect(() => {
    if (isOpen && profile) {
      setUsername(profile.username);
      setTitle(profile.title || '');
      setBio(profile.bio || '');
      setCustomAvatar(profile.customAvatar || null);
      setAvatarSeed(profile.avatarSeed || profile.username);
      setSuggestions(getNameSuggestions(4, profile.username));
      setSavedSuccess(false);
      setActiveTab('profile'); // always start on profile tab
    }
  }, [isOpen, profile]);
  if (!isOpen || !profile) return null;

  // Compute player stats
  const totalTests = history.length;
  const highestWpm = Object.values(personalBests).length > 0
    ? Math.max(...Object.values(personalBests), 0)
    : 0;
  const avgAccuracy = totalTests > 0
    ? Math.round(history.reduce((acc, h) => acc + h.accuracy, 0) / totalTests)
    : 0;

  // Badges calculation
  const badges = [
    {
      id: 'first_test',
      label: 'Novice Typist',
      desc: 'Completed your first typing session',
      unlocked: totalTests >= 1,
      icon: Zap,
    },
    {
      id: 'speed_demon',
      label: 'Speed Demon',
      desc: 'Reached 75+ WPM in any mode',
      unlocked: highestWpm >= 75,
      icon: Trophy,
    },
    {
      id: 'centurion',
      label: 'Centurion (100+ WPM)',
      desc: 'Achieved triple digit speed',
      unlocked: highestWpm >= 100,
      icon: Award,
    },
    {
      id: 'perfectionist',
      label: 'Precision King',
      desc: 'Achieved 98%+ overall accuracy',
      unlocked: avgAccuracy >= 98 && totalTests >= 3,
      icon: Target,
    },
    {
      id: 'veteran',
      label: 'Dedicated Coder',
      desc: 'Logged 15+ practice tests',
      unlocked: totalTests >= 15,
      icon: ShieldCheck,
    },
  ];

  // Refresh suggestion chips
  const handleRefreshSuggestions = () => {
    setSuggestions(getNameSuggestions(4, username));
  };

  // Roll fresh random name into input
  const handleRollRandomName = () => {
    const newName = generateRandomUsername();
    setUsername(newName);
    // If not using custom avatar, also sync identicon seed to the new name
    if (!customAvatar) {
      setAvatarSeed(newName);
    }
  };

  // Select a suggestion
  const handleSelectSuggestion = (suggested: string) => {
    setUsername(suggested);
    if (!customAvatar) {
      setAvatarSeed(suggested);
    }
  };

  // Re-roll GitHub identicon seed
  const handleRerollIdenticon = () => {
    const newSeed = `${username}-${Math.random().toString(36).substring(2, 9)}`;
    setAvatarSeed(newSeed);
  };

  // Handle custom photo upload with client-side canvas compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB raw)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress to 200x200 canvas
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCustomAvatar(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setCustomAvatar(null);
  };

  const handleSave = () => {
    const cleanUsername = username.trim() || generateRandomUsername();
    onUpdateProfile({
      username: cleanUsername,
      title: title.trim(),
      bio: bio.trim(),
      customAvatar,
      avatarSeed,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#131722] border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-7 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-theme-main/10 border border-theme-main/30 flex items-center justify-center text-theme-main">
              {activeTab === 'profile' ? <User size={18} /> : <Brain size={18} />}
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Player Profile &amp; Account</h2>
              <p className="text-xs text-theme-sub">
                {activeTab === 'profile'
                  ? 'Customize your identity, avatar, and view badges'
                  : 'AI practice lessons & weakness analysis'}
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

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-xl mb-5">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-theme-main text-black shadow'
                : 'text-theme-sub hover:text-white hover:bg-white/5'
            }`}
          >
            <User size={13} />
            <span>Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('trainer')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'trainer'
                ? 'bg-theme-main text-black shadow'
                : 'text-theme-sub hover:text-white hover:bg-white/5'
            }`}
          >
            <Brain size={13} />
            <span>🧠 AI Trainer</span>
          </button>
        </div>

        {activeTab === 'trainer' ? (
          /* ── AI Weakness Trainer Tab ─────────────────────────────────── */
          <WeaknessTrainer
            history={history}
            onStartDrill={(text) => {
              onClose();
              onStartDrill(text);
            }}
          />
        ) : (
        <>
        {/* Profile Card & Avatar Section */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar Display */}
          <div className="relative group shrink-0">
            {customAvatar ? (
              <img
                src={customAvatar}
                alt={username}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-theme-main/40 shadow-lg shadow-black/40"
              />
            ) : (
              <Identicon
                seed={avatarSeed}
                size={108}
                className="rounded-2xl ring-2 ring-theme-main/30 shadow-lg shadow-black/40"
                alt="GitHub-style Identicon"
              />
            )}

            {/* Badge indicating avatar type */}
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[#1e2433] border border-white/10 text-theme-sub whitespace-nowrap shadow-sm">
              {customAvatar ? 'Custom Photo' : 'GitHub Identicon'}
            </span>
          </div>

          {/* Avatar Controls */}
          <div className="flex-1 text-center sm:text-left space-y-2.5">
            <div>
              <div className="text-sm font-semibold text-white flex items-center justify-center sm:justify-start gap-1.5">
                <span>Avatar Management</span>
                <span className="text-[11px] font-normal text-theme-sub">
                  (GitHub 5x5 Identicon or Custom Photo)
                </span>
              </div>
              <p className="text-xs text-theme-sub mt-0.5">
                Unique pixel avatars are mathematically generated just like on GitHub. You can also upload any image.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageUpload}
                className="hidden"
                id="profile-photo-upload"
              />
              <label
                htmlFor="profile-photo-upload"
                className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-medium bg-theme-main/15 text-theme-main border border-theme-main/30 hover:bg-theme-main/25 transition-all flex items-center gap-1.5"
              >
                <Upload size={14} />
                <span>Upload Photo</span>
              </label>

              {!customAvatar ? (
                <button
                  type="button"
                  onClick={handleRerollIdenticon}
                  title="Generate a new GitHub-style identicon pattern"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-theme-sub border border-white/10 hover:border-white/20 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <RefreshCw size={14} />
                  <span>Re-roll Pattern</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  title="Remove uploaded photo and return to GitHub-style identicon"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Use Identicon</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Username & Details Form */}
        <div className="space-y-4 mb-6">
          {/* Username with randomizer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-theme-sub">
                Username
              </label>
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
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-sub font-mono text-sm">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (!customAvatar && e.target.value.trim()) {
                    setAvatarSeed(e.target.value.trim());
                  }
                }}
                maxLength={24}
                placeholder="e.g. CyberTypist"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder-theme-sub/50 focus:outline-none focus:border-theme-main transition-colors font-medium"
              />
            </div>

            {/* Suggestions Chips */}
            <div className="mt-2 flex items-center flex-wrap gap-1.5">
              <span className="text-[11px] text-theme-sub flex items-center gap-1 mr-1">
                Suggestions:
              </span>
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => handleSelectSuggestion(sug)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    username === sug
                      ? 'bg-theme-main/20 text-theme-main border-theme-main/40 font-semibold'
                      : 'bg-white/5 text-theme-sub border-white/5 hover:border-white/20 hover:text-white'
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
                <RefreshCw size={12} />
              </button>
            </div>
          </div>

          {/* Dev Title / Role */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-theme-sub">
                Tagline / Title
              </label>
              <span className="text-[11px] text-theme-sub">e.g. Mechanical Switch Enthusiast</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. O(1) Typist, Vim Wizard"
              maxLength={40}
              list="dev-titles-list"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-theme-sub/50 focus:outline-none focus:border-theme-main transition-colors"
            />
            <datalist id="dev-titles-list">
              {DEFAULT_DEV_TITLES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-sub mb-1.5">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other speedsters about your typing setup, keyboard switches, or coding goals..."
              rows={2}
              maxLength={120}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-theme-sub/50 focus:outline-none focus:border-theme-main transition-colors resize-none"
            />
          </div>
        </div>

        {/* Player Stats & Badges Section */}
        <div className="border-t border-white/10 pt-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-theme-sub flex items-center gap-1.5">
              <Trophy size={14} className="text-theme-main" />
              <span>Career Stats & Milestones</span>
            </h3>
            <span className="text-[11px] text-theme-sub flex items-center gap-1">
              <Clock size={12} /> Member since {profile.joinedDate || 'Recently'}
            </span>
          </div>

          {/* Stat Pills */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <div className="text-[11px] text-theme-sub uppercase">Tests Taken</div>
              <div className="text-xl font-black text-white mt-0.5">{totalTests}</div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <div className="text-[11px] text-theme-sub uppercase">Top Speed</div>
              <div className="text-xl font-black text-theme-main mt-0.5">{highestWpm} <span className="text-xs font-normal text-theme-sub">WPM</span></div>
            </div>
            <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
              <div className="text-[11px] text-theme-sub uppercase">Avg Accuracy</div>
              <div className="text-xl font-black text-white mt-0.5">{avgAccuracy}%</div>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.id}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                    b.unlocked
                      ? 'bg-white/5 border-theme-main/30 text-white'
                      : 'bg-white/[0.02] border-white/5 text-theme-sub/40 opacity-60'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      b.unlocked
                        ? 'bg-theme-main/20 text-theme-main'
                        : 'bg-white/5 text-theme-sub/30'
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate flex items-center gap-1">
                      {b.label}
                      {b.unlocked && <Check size={12} className="text-theme-main shrink-0" />}
                    </div>
                    <div className="text-[10px] text-theme-sub truncate">{b.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions — shown only in profile tab */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => {
              onSignOut();
              onClose();
            }}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 border border-rose-500/20"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>

          {activeTab === 'profile' && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-white/5 text-theme-sub hover:text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-theme-main text-black hover:opacity-90 transition-all flex items-center gap-1.5 shadow-lg shadow-theme-main/20"
              >
                {savedSuccess ? (
                  <>
                    <Check size={14} />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Profile</span>
                )}
              </button>
            </div>
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};
