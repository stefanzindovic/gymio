"use client";

import { useMemo } from "react";
import { useApiQuery } from "@/hooks/use-api-query";
import { ActivityResponse } from "@/types/workout";
import { ActivityCalendarGrid } from "./activity-calendar-grid";
import { ActivityCalendarLegend } from "./activity-calendar-legend";

interface ActivityCalendarProps {
  userId: string;
}

function StatCard({ label, value }: { label: string; value?: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <p className="text-xs sm:text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900">{value ?? "-"}</p>
    </div>
  );
}

function ActivityCalendarSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-64 mb-6" />
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded" />
        ))}
      </div>
      <div className="h-40 bg-gray-100 rounded" />
    </div>
  );
}

export function ActivityCalendar({ userId }: ActivityCalendarProps) {
  const { startDate, endDate, weeks } = useMemo(() => {
    const today = new Date();
    const currentYear = today.getFullYear();

    const start = new Date(currentYear, 0, 1);
    const end = new Date(currentYear, 11, 31);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const calculatedWeeks = Math.ceil(diffDays / 7);

    return { startDate: start, endDate: end, weeks: calculatedWeeks };
  }, []);

  const startDateStr = startDate.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  const { data, isLoading, error } = useApiQuery<ActivityResponse>(
    ["workout-activity", userId, startDateStr, endDateStr],
    "GET",
    `/workouts/activity?start_date=${startDateStr}&end_date=${endDateStr}`,
    true,
    undefined,
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading) {
    return <ActivityCalendarSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Workout Activity</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load activity data. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Workout Activity</h2>
        <ActivityCalendarLegend />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Workouts" value={data.summary.total_workouts} />
        <StatCard label="Active Days" value={data.summary.active_days} />
        <StatCard label="Current Streak" value={data.summary.current_streak} />
        <StatCard label="Longest Streak" value={data.summary.longest_streak} />
      </div>

      <ActivityCalendarGrid data={data.data} weeks={weeks} startDate={startDate} endDate={endDate} />
    </div>
  );
}
