import { AuthSession } from "@/lib/supabase/types";
import { AUTH_TOKEN_KEY } from "@/constants/api";

export function syncSessionToLocalStorage(session: AuthSession | null) {
  if (!session) {
    clearSessionFromLocalStorage();
    return;
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, session.access_token);
  }
}

export function clearSessionFromLocalStorage() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function getTokenFromSession(session: AuthSession | null): string | null {
  if (!session) {
    return null;
  }

  return session.access_token;
}
