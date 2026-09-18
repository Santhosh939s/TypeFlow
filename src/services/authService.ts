import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { UserProfile } from '../types';

const LOCAL_AUTH_KEY = 'typeflow_auth_user';
const LOCAL_ACCOUNTS_KEY = 'typeflow_local_accounts';

interface StoredAccount {
  email: string;
  passwordHash: string;
  profile: UserProfile;
}

// Simple hash for local credential simulation
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

function getLocalAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAccounts(accounts: StoredAccount[]) {
  try {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save local accounts:', e);
  }
}

export const authService = {
  async signUp(
    email: string,
    password: string,
    username: string,
    avatarSeed?: string,
    customAvatar?: string | null
  ): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim() || 'Typist';
    const seed = avatarSeed || cleanUsername;

    const newProfile: UserProfile = {
      email: cleanEmail,
      username: cleanUsername,
      display_name: cleanUsername,
      title: 'Keyboard Speedster',
      bio: 'Typing at the speed of thought with TypeFlow.',
      customAvatar: customAvatar || null,
      avatarSeed: seed,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    // Always register in local account database as safety net
    const accounts = getLocalAccounts();
    const existingIdx = accounts.findIndex((a) => a.email === cleanEmail);
    if (existingIdx >= 0) {
      accounts[existingIdx] = {
        email: cleanEmail,
        passwordHash: simpleHash(password),
        profile: newProfile,
      };
    } else {
      accounts.push({
        email: cleanEmail,
        passwordHash: simpleHash(password),
        profile: newProfile,
      });
    }
    saveLocalAccounts(accounts);

    // Try Supabase Auth if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: cleanUsername,
              display_name: cleanUsername,
              avatar_seed: seed,
              custom_avatar: customAvatar || null,
            },
          },
        });

        if (error) {
          console.warn('[Supabase Auth] SignUp notice:', error.message);
          const isRateLimitOrNetwork =
            error.message.toLowerCase().includes('rate limit') ||
            error.message.toLowerCase().includes('rate_limit') ||
            (error as any).status === 429;

          if (!isRateLimitOrNetwork) {
            // Re-throw if email syntax is explicitly invalid
            if (error.message.toLowerCase().includes('invalid email')) {
              throw new Error(error.message);
            }
          }
        } else if (data.user) {
          newProfile.id = data.user.id;
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: cleanEmail,
              username: cleanUsername,
              display_name: cleanUsername,
              avatar_seed: seed,
              custom_avatar: customAvatar || null,
              joined_date: newProfile.joinedDate,
            });
          } catch {
            // SQL trigger pending or ignored
          }
        }
      } catch (err: any) {
        console.warn('Supabase signup handled gracefully:', err.message);
        const isRateLimitOrNetwork =
          err.message?.toLowerCase().includes('rate limit') ||
          err.message?.toLowerCase().includes('rate_limit') ||
          err.status === 429;

        if (!isRateLimitOrNetwork && err.message?.toLowerCase().includes('invalid email')) {
          throw err;
        }
      }
    }

    // Persist authenticated profile in current session
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newProfile));
    return newProfile;
  },

  async signIn(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();
    let supabaseErr: Error | null = null;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (!error && data.user) {
          // Fetch remote profile
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          const loadedProfile: UserProfile = {
            id: data.user.id,
            email: cleanEmail,
            username: profileRow?.username || data.user.user_metadata?.username || cleanEmail.split('@')[0],
            display_name: profileRow?.display_name || data.user.user_metadata?.display_name || cleanEmail.split('@')[0],
            title: profileRow?.title || 'Keyboard Speedster',
            bio: profileRow?.bio || '',
            customAvatar: profileRow?.custom_avatar || data.user.user_metadata?.custom_avatar || null,
            avatarSeed: profileRow?.avatar_seed || data.user.user_metadata?.avatar_seed || cleanEmail,
            joinedDate: profileRow?.joined_date || new Date().toISOString().split('T')[0],
          };

          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(loadedProfile));
          return loadedProfile;
        } else if (error) {
          supabaseErr = error;
        }
      } catch (err: any) {
        supabaseErr = err;
      }
    }

    // Check local accounts fallback
    const accounts = getLocalAccounts();
    const match = accounts.find(
      (a) => a.email === cleanEmail && a.passwordHash === simpleHash(password)
    );

    if (match) {
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(match.profile));
      return match.profile;
    }

    if (supabaseErr) {
      if (supabaseErr.message.toLowerCase().includes('rate limit')) {
        throw new Error('Cloud email rate limit reached. If you just created an account, try signing in again.');
      }
      throw new Error(supabaseErr.message);
    }

    throw new Error('Invalid email or password. Please try again.');
  },

  async signOut(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signout error:', e);
      }
    }
    localStorage.removeItem(LOCAL_AUTH_KEY);
  },

  async resetPassword(email: string) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured. Please add your credentials in .env');
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin,
    });

    if (error) throw error;
    return data;
  },

  async getSession() {
    if (!isSupabaseConfigured() || !supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('[authService] getSession error:', error);
      return null;
    }
    return data.session;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured() || !supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[authService] getUserProfile error:', error);
      return null;
    }

    return data as UserProfile | null;
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    if (!isSupabaseConfigured() || !supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  },

  getInitialUser(): UserProfile | null {
    try {
      const raw = localStorage.getItem(LOCAL_AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  saveUser(profile: UserProfile): void {
    try {
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile:', e);
    }
  },
};
