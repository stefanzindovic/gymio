"use client";

import { useEffect } from "react";
import { ReactNode } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";
import { initializeAuthConfig } from "@/lib/auth/config";
import { syncSessionToLocalStorage, clearSessionFromLocalStorage } from "@/lib/auth/session-sync";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize);
  const setSession = useAuthStore((state) => state.setSession);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    initializeAuthConfig();
    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);

        if (session) {
          setSession(session as any);
          const user = await supabase.auth.getUser();
          if (user.data.user) {
            setUser(user.data.user as any);
          }
        } else {
          setSession(null);
          setUser(null);
          clearSessionFromLocalStorage();
        }

        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [initialize, setSession, setUser, setLoading]);

  return <>{children}</>;
}
