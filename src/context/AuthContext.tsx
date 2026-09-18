import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { authService } from '../services/authService';
import { UserProfile, AuthModalMode } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  authModalOpen: boolean;
  authModalMode: AuthModalMode;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('signin');

  const configured = useMemo(() => isSupabaseConfigured(), []);

  const openAuthModal = useCallback((mode: AuthModalMode = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const loadUserProfile = useCallback(async (userId: string, currentUser?: User) => {
    try {
      const userProfile = await authService.getUserProfile(userId);
      if (userProfile) {
        setProfile(userProfile);
      } else if (currentUser) {
        // Fallback profile if profile row is still being populated by trigger
        const defaultProfile: UserProfile = {
          id: currentUser.id,
          email: currentUser.email,
          username:
            currentUser.user_metadata?.username ||
            currentUser.email?.split('@')[0] ||
            'Typist',
          display_name:
            currentUser.user_metadata?.display_name ||
            currentUser.user_metadata?.username ||
            'Typist',
        };
        setProfile(defaultProfile);
      }
    } catch (err) {
      console.warn('[AuthContext] Failed to load user profile:', err);
    }
  }, []);

  // Initialize session and auth state listener
  useEffect(() => {
    if (!configured || !supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    authService.getSession().then((currSession) => {
      if (!isMounted) return;
      setSession(currSession);
      setUser(currSession?.user || null);
      if (currSession?.user) {
        loadUserProfile(currSession.user.id, currSession.user);
      }
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user || null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          await loadUserProfile(newSession.user.id, newSession.user);
          setAuthModalOpen(false);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [configured, loadUserProfile]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.signIn(email, password);
      if (res) {
        setProfile(res);
        if (supabase) {
          const { data } = await supabase.auth.getUser();
          if (data?.user) setUser(data.user);
        }
        setAuthModalOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      const res = await authService.signUp(email, password, username);
      if (res) {
        setProfile(res);
        if (supabase) {
          const { data } = await supabase.auth.getUser();
          if (data?.user) setUser(data.user);
        }
        setAuthModalOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id, user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        isConfigured: configured,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
