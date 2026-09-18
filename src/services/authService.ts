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
      title: 'Keyboard Speedster',
      bio: 'Typing at the speed of thought with TypeFlow.',
      customAvatar: customAvatar || null,
      avatarSeed: seed,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    // Try Supabase Auth first if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: cleanUsername,
              avatar_seed: seed,
              custom_avatar: customAvatar || null,
            },
          },
        });

        if (error) {
          // If Supabase returns an error, rethrow unless it's a network/rate limit
          console.warn('[Supabase Auth] SignUp warning:', error.message);
          throw new Error(error.message);
        }

        if (data.user) {
          newProfile.id = data.user.id;
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: cleanEmail,
              username: cleanUsername,
              avatar_seed: seed,
              custom_avatar: customAvatar || null,
              joined_date: newProfile.joinedDate,
            });
          } catch {
            // Handled or trigger pending
          }
        }
      } catch (err: any) {
        // If Supabase throws an error (e.g. invalid credentials or network error), let the user know
        console.warn('Supabase signup issue:', err);
        throw err;
      }
    } else {
      // Local Auth Mode
      const accounts = getLocalAccounts();
      if (accounts.some((a) => a.email === cleanEmail)) {
        throw new Error('An account with this email already exists.');
      }
      accounts.push({
        email: cleanEmail,
        passwordHash: simpleHash(password),
        profile: newProfile,
      });
      saveLocalAccounts(accounts);
    }

    // Persist authenticated profile in current session
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(newProfile));
    return newProfile;
  },

  async signIn(email: string, password: string): Promise<UserProfile> {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.user) {
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
            title: profileRow?.title || 'Keyboard Speedster',
            bio: profileRow?.bio || '',
            customAvatar: profileRow?.custom_avatar || data.user.user_metadata?.custom_avatar || null,
            avatarSeed: profileRow?.avatar_seed || data.user.user_metadata?.avatar_seed || cleanEmail,
            joinedDate: profileRow?.joined_date || new Date().toISOString().split('T')[0],
          };

          localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(loadedProfile));
          return loadedProfile;
        }
      } catch (err: any) {
        console.warn('Supabase signIn error:', err);
        throw err;
      }
    }

    // Fallback: Local Account Auth
    const accounts = getLocalAccounts();
    const match = accounts.find(
      (a) => a.email === cleanEmail && a.passwordHash === simpleHash(password)
    );

    if (!match) {
      throw new Error('Invalid email or password. Please try again.');
    }

    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(match.profile));
    return match.profile;
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
