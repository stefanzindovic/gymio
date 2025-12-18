"use client";

import { WgerExerciseInfo } from "@/types/exercise";
import { ExerciseCard } from "./exercise-card";

interface ExerciseListProps {
  exercises: WgerExerciseInfo[];
  isLoading?: boolean;
}

export function ExerciseList({
  exercises,
  isLoading,
}: ExerciseListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm h-96 animate-pulse"
          >
            <div className="w-full h-48 bg-gray-200" />
            <div className="p-6 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-6 bg-gray-100 rounded w-full" />
                <div className="h-6 bg-gray-100 rounded w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-lg">
          No exercises found. Try a different search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
        />
      ))}
    </div>
  );
}
