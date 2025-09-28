// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import { supabase, SUPABASE_URL_CONST } from '../supabaseClient';

// PRODUCTION NOTES:
// - Rotate Supabase keys regularly for security
// - Do not store secrets in code - use environment variables
// - Consider implementing token refresh logic for long-lived sessions
// - Add proper error boundaries and user feedback

// Types
export interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

export interface Session {
  access_token: string;
  refresh_token?: string | null;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleDeepLink: (url: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Restore session from secure storage (simple MVP approach)
    (async () => {
      try {
        const s = await SecureStore.getItemAsync('supabase_session');
        if (s) {
          const parsed = JSON.parse(s);
          setSession(parsed);
          setUser(parsed.user ?? null);
        }
      } catch (e) {
        console.warn('restore session error', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    // Listen to deep links (app opened via magic link)
    const sub = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url).catch(console.error);
    });
    // also handle initial URL if app opened via link
    (async () => {
      const initial = await Linking.getInitialURL();
      if (initial) {
        handleDeepLink(initial).catch(console.error);
      }
    })();

    return () => sub.remove();
  }, []);

  const signInWithMagicLink = async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const redirectTo = `${Linking.createURL('auth-callback')}`; // will produce auramate://auth-callback
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) throw error;
      // Supabase will send the magic link — UI should notify the user
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeepLink = async (url: string) => {
    try {
      if (!url) return;

      // Extract fragment after '#' (works even if Linking.parse doesn't return fragment)
      const hashIndex = url.indexOf('#');
      const fragment = hashIndex >= 0 ? url.substring(hashIndex + 1) : '';

      // Some providers might put tokens in query params instead (after '?')
      const queryIndex = url.indexOf('?');
      const query = queryIndex >= 0 ? url.substring(queryIndex + 1, hashIndex >= 0 ? hashIndex : url.length) : '';

      const params = new URLSearchParams(fragment || query);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (!access_token) {
        // nothing to do
        return;
      }

      const sessionObj = { access_token, refresh_token };
      await SecureStore.setItemAsync('supabase_session', JSON.stringify(sessionObj));
      setSession(sessionObj);

      // fetch user info using Supabase auth endpoint with the token
      const res = await fetch(`${SUPABASE_URL_CONST}/auth/v1/user`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        console.warn('Failed to fetch user from supabase /auth/v1/user', res.status);
      }
    } catch (e) {
      console.warn('handleDeepLink error', e);
    }
  };
  

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      await SecureStore.deleteItemAsync('supabase_session');
      setUser(null);
      setSession(null);
    } catch (e) {
      console.warn('signOut error', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, error, signInWithMagicLink, signOut, handleDeepLink }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
