"use client";

import { ReactNode } from "react";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

interface LoginRedirectWrapperProps {
  children: ReactNode;
}

export function LoginRedirectWrapper({ children }: LoginRedirectWrapperProps) {
  const { isLoading } = useAuthRedirect({
    requireAuth: false,
    redirectTo: "/dashboard",
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FC6500]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
