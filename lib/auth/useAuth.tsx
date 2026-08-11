"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

export type SupabaseAuthUser = {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
};

export type AuthState =
  | { status: "loading" }
  | { status: "authed"; user: SupabaseAuthUser }
  | { status: "signedOut" }
  | { status: "error"; message: string };

function toUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}): SupabaseAuthUser {
  const meta = user.user_metadata ?? {};
  const fullName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    undefined;
  const avatarUrl =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture) ||
    undefined;

  return {
    id: user.id,
    email: user.email ?? undefined,
    fullName,
    avatarUrl,
  };
}

export function getUserDisplayName(user: SupabaseAuthUser): string {
  if (user.fullName?.trim()) return user.fullName.trim();
  if (user.email) return user.email.split("@")[0] ?? user.email;
  return "Learner";
}

export function getUserInitials(user: SupabaseAuthUser): string {
  const name = getUserDisplayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

type AuthApi = {
  state: AuthState;
  signUpWithPassword: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (nextPath: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setState({ status: "authed", user: toUser(session.user) });
      } else {
        setState({ status: "signedOut" });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setState({ status: "authed", user: toUser(session.user) });
      } else {
        setState({ status: "signedOut" });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUpWithPassword = useCallback(
    async (fullName: string, email: string, password: string) => {
      const supabase = createClient();
      const name = fullName.trim();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name,
            name,
          },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error("Sign up failed");

      // Duplicate email often returns a user with empty identities when confirm is on.
      if (data.user.identities && data.user.identities.length === 0) {
        throw new Error("An account with this email already exists. Please log in.");
      }

      // Always finish signed out — signup should send the user to the login screen.
      if (data.session) {
        await supabase.auth.signOut();
      }
      setState({ status: "signedOut" });
    },
    [],
  );

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error("Login failed");
      setState({ status: "authed", user: toUser(data.user) });
    },
    [],
  );

  const signInWithGoogle = useCallback(async (nextPath: string) => {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setState({ status: "signedOut" });
  }, []);

  const api = useMemo(
    () => ({
      state,
      signUpWithPassword,
      signInWithPassword,
      signInWithGoogle,
      signOut,
    }),
    [
      state,
      signUpWithPassword,
      signInWithPassword,
      signInWithGoogle,
      signOut,
    ],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (ctx) return ctx;

  // Fallback for any tree outside AuthProvider (should not happen in app shell).
  return {
    state: { status: "signedOut" },
    async signUpWithPassword() {
      throw new Error("AuthProvider is missing");
    },
    async signInWithPassword() {
      throw new Error("AuthProvider is missing");
    },
    async signInWithGoogle() {
      throw new Error("AuthProvider is missing");
    },
    async signOut() {},
  };
}
