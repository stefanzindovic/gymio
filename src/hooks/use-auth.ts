"use client";

import { useAuthStore } from "@/stores/auth-store";

export function useAuth() {
  const {
    user,
    session,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
  } = useAuthStore();

  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
  };
}
