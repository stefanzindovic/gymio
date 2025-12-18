"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const redirect = useAuthRedirect({
    requireAuth: false,
    redirectTo: "/dashboard",
  });

  if (redirect.isLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FC6500]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="text-2xl font-bold" style={{ color: "#FC6500" }}>
              Gymio
            </div>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#FC6500] hover:bg-[#E55A00] transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#FC6500] hover:bg-[#E55A00] transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900">
            Welcome to <span style={{ color: "#FC6500" }}>Gymio</span>
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Your personal fitness journey starts here. Track your workouts, monitor your progress, and achieve your goals.
          </p>

          {!isAuthenticated && (
            <div className="flex flex-col gap-4 sm:flex-row justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-[#FC6500] hover:bg-[#E55A00] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
