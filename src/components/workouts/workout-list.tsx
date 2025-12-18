"use client";

import React from "react";
import { WorkoutCard } from "./workout-card";
import { WorkoutWithExercises } from "@/types/workout";

interface WorkoutListProps {
  workouts: WorkoutWithExercises[];
  isLoading: boolean;
  error?: Error | null;
  onStartWorkout: (workout: WorkoutWithExercises) => void;
  onEditWorkout: (workout: WorkoutWithExercises) => void;
  onDeleteWorkout: (workoutId: string) => void;
  deletingId?: string;
}

function WorkoutSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-100 rounded w-full mb-2" />
      <div className="h-4 bg-gray-100 rounded w-5/6 mb-6" />
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-100 rounded w-24" />
        <div className="h-10 bg-gray-200 rounded w-20" />
      </div>
    </div>
  );
}

export function WorkoutList({
  workouts,
  isLoading,
  error,
  onStartWorkout,
  onEditWorkout,
  onDeleteWorkout,
  deletingId,
}: WorkoutListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <WorkoutSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load workouts. Please try again.</p>
      </div>
    );
  }

  if (!workouts || workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg mb-2">No workouts yet</p>
        <p className="text-gray-500">Create your first workout to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          onStart={onStartWorkout}
          onEdit={onEditWorkout}
          onDelete={onDeleteWorkout}
          isDeleting={deletingId === workout.id}
        />
      ))}
    </div>
  );
}
