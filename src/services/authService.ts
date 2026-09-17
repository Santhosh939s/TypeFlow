import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { UserProfile } from '../types';

export const authService = {
  async signUp(email: string, password: string, username: string) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured. Please add your credentials in .env');
    }

    const trimmedUsername = username.trim();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          username: trimmedUsername,
          display_name: trimmedUsername,
        },
      },
    });

    if (error) throw error;

    // Insert or update profile directly in case trigger is pending or omitted
    if (data.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          username: trimmedUsername,
          display_name: trimmedUsername,
        });
      } catch {
        // Ignored if handled by SQL trigger
      }
    }

    return data;
  },

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error('Supabase is not configured. Please add your credentials in .env');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!isSupabaseConfigured() || !supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
};
