"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./use-auth";

interface UseAuthRedirectOptions {
  requireAuth: boolean;
  redirectTo: string;
}

export function useAuthRedirect({ requireAuth, redirectTo }: UseAuthRedirectOptions) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.push("/login");
    } else if (!requireAuth && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  return { isLoading };
}
