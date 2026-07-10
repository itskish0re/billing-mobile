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
import { updateProfileName as persistProfileName } from '@/lib/auth/update-profile-name';
import { supabase } from '@/lib/supabase';
import { useNetworkStatus } from '@/hooks/use-network-status';
import type { UserProfile } from '@/types/auth';

type AuthContextValue = {
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  updateProfileName: (fullName: string) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isOffline, isChecking } = useNetworkStatus();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    let nextProfile: UserProfile | null = null;

    try {
      nextProfile = await fetchProfile(userId);
    } catch {
      setProfile(null);
      return 'Could not connect to the server. Check your internet connection and try again.';
    }

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
    if (isChecking) {
      return;
    }

    if (isOffline) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession } }) => {
        if (!isMounted) {
          return;
        }

        setSession(initialSession);

        if (initialSession?.user) {
          await loadProfile(initialSession.user.id);
        }
      })
      .catch(() => {
        // Keep any locally restored session on transient network failures.
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted || isOffline) {
        return;
      }

      setSession(nextSession);

      try {
        if (nextSession?.user) {
          await loadProfile(nextSession.user.id);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isChecking, isOffline, loadProfile]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth
        .signInWithPassword({
          email,
          password,
        })
        .catch(() => ({
          data: { user: null, session: null },
          error: {
            message: 'Could not connect to the server. Check your internet connection and try again.',
          },
        }));

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
    await supabase.auth.signOut().catch(() => undefined);
    setProfile(null);
  }, []);

  const updateProfileName = useCallback(
    async (fullName: string) => {
      if (!session?.user) {
        return 'You must be signed in to update your name.';
      }

      try {
        await persistProfileName(session.user.id, fullName);
      } catch (error) {
        if (error instanceof Error) {
          return error.message;
        }

        return 'Could not update your name. Try again.';
      }

      setProfile((currentProfile) =>
        currentProfile
          ? {
              ...currentProfile,
              full_name: fullName.trim(),
            }
          : currentProfile
      );

      return null;
    },
    [session?.user]
  );

  const value = useMemo(
    () => ({
      session,
      profile,
      isLoading,
      signIn,
      signOut,
      updateProfileName,
    }),
    [session, profile, isLoading, signIn, signOut, updateProfileName]
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
