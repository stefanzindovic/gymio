"use client";

import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { ExerciseBrowser } from "@/components/exercises/exercise-browser";
import { ActivityCalendar } from "@/components/activity/activity-calendar";
import { MyWorkoutsSection } from "@/components/workouts/my-workouts-section";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const authRedirect = useAuthRedirect({ requireAuth: true, redirectTo: "" });
  const myWorkoutsSectionRef = useRef<{
    openCreateModal: () => void;
  }>(null);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleFabClick = () => {
    myWorkoutsSectionRef.current?.openCreateModal();
  };

  if (authRedirect.isLoading) {
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: "#FC6500" }}>
                Gymio
              </h1>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-[#FC6500] hover:bg-[#E55A00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {user?.id && <ActivityCalendar userId={user.id} />}

          <MyWorkoutsSection ref={myWorkoutsSectionRef} />

          <ExerciseBrowser />
        </div>
      </main>

      <FloatingActionButton
        onClick={handleFabClick}
        ariaLabel="Create new workout"
      />
    </div>
  );
}
