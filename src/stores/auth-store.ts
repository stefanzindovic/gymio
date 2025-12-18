"use client";

import { create } from "zustand";
import { AuthUser, AuthSession, LoginCredentials, RegisterCredentials, AuthError } from "@/lib/supabase/types";
import * as authLib from "@/lib/supabase/auth";
import { syncSessionToLocalStorage, clearSessionFromLocalStorage } from "@/lib/auth/session-sync";

interface AuthStore {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  setSession: (session: AuthSession | null) => void;
  setLoading: (loading: boolean) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  error: AuthError | null;
  setError: (error: AuthError | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  setUser: (user) => {
    set({ user, isAuthenticated: user !== null });
  },

  setSession: (session) => {
    set({
      session,
      isAuthenticated: session !== null
    });
    syncSessionToLocalStorage(session as AuthSession | null);
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authLib.signIn(credentials);
      if (data.session && data.user) {
        set({
          session: data.session as AuthSession,
          user: data.user as AuthUser,
          isAuthenticated: true,
          error: null,
        });
        syncSessionToLocalStorage(data.session as AuthSession);
      }
    } catch (error) {
      const authError = error as AuthError;
      set({ error: authError, isAuthenticated: false });
      throw authError;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authLib.signUp(credentials);
      if (data.session && data.user) {
        set({
          session: data.session as AuthSession,
          user: data.user as AuthUser,
          isAuthenticated: true,
          error: null,
        });
        syncSessionToLocalStorage(data.session as AuthSession);
      }
    } catch (error) {
      const authError = error as AuthError;
      set({ error: authError, isAuthenticated: false });
      throw authError;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authLib.signOut();
      clearSessionFromLocalStorage();
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      const authError = error as AuthError;
      set({ error: authError });
      throw authError;
    } finally {
      set({ isLoading: false });
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const session = await authLib.getSession();
      if (session) {
        const user = await authLib.getCurrentUser();
        set({
          session: session as AuthSession,
          user: user as AuthUser,
          isAuthenticated: true,
        });
        syncSessionToLocalStorage(session as AuthSession);
      } else {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
        });
        clearSessionFromLocalStorage();
      }
    } catch (error) {
      set({
        user: null,
        session: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
