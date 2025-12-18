"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export function RegisterForm() {
  const { register, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setFormError("All fields are required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await register({ email, password });
    } catch (err) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white px-8 py-8 shadow-sm rounded-lg">
          <h1 className="text-center text-3xl font-semibold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-center text-gray-600 text-sm mb-8">
            Join Gymio and start your fitness journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {(formError || error?.message) && (
              <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                <p className="text-sm text-red-800">
                  {formError || error?.message}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#FC6500] focus:outline-none focus:ring-2 focus:ring-[#FC6500] focus:ring-opacity-20 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#FC6500] focus:outline-none focus:ring-2 focus:ring-[#FC6500] focus:ring-opacity-20 disabled:bg-gray-50 disabled:text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#FC6500] focus:outline-none focus:ring-2 focus:ring-[#FC6500] focus:ring-opacity-20 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#FC6500] py-2 px-4 font-semibold text-white hover:bg-[#E55A00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#FC6500] hover:text-[#E55A00]">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
