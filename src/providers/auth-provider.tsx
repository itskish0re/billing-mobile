import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchProfile } from '@/lib/auth/fetch-profile';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/auth';

type AuthContextValue = {
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const nextProfile = await fetchProfile(userId);

    if (!nextProfile) {
      await supabase.auth.signOut();
      setProfile(null);
      return 'Could not load your profile. Contact an administrator.';
    }

    if (!nextProfile.is_active) {
      await supabase.auth.signOut();
      setProfile(null);
      return 'Your account is inactive. Contact an administrator.';
    }

    setProfile(nextProfile);
    return null;
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!isMounted) {
        return;
      }

      setSession(initialSession);

      if (initialSession?.user) {
        await loadProfile(initialSession.user.id);
      }

      if (isMounted) {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);

      if (nextSession?.user) {
        await loadProfile(nextSession.user.id);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const trimmedEmail = email.trim();

      if (!trimmedEmail || !password) {
        return 'Enter email and password.';
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        return error.message;
      }

      if (data.user) {
        return loadProfile(data.user.id);
      }

      return null;
    },
    [loadProfile]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      profile,
      isLoading,
      signIn,
      signOut,
    }),
    [session, profile, isLoading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
