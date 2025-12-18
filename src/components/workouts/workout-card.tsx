"use client";

import React, { useState } from "react";
import { Play, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { WorkoutWithExercises } from "@/types/workout";

interface WorkoutCardProps {
  workout: WorkoutWithExercises;
  onStart: (workout: WorkoutWithExercises) => void;
  onEdit: (workout: WorkoutWithExercises) => void;
  onDelete: (workoutId: string) => void;
  isDeleting?: boolean;
}

export function WorkoutCard({
  workout,
  onStart,
  onEdit,
  onDelete,
  isDeleting = false,
}: WorkoutCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 relative">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-gray-900 flex-1 pr-2">
          {workout.name}
        </h3>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Workout options"
          >
            <MoreVertical size={20} className="text-gray-600" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onEdit(workout);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-gray-700 font-medium text-sm"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onDelete(workout.id);
                }}
                disabled={isDeleting}
                className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-3 text-red-600 font-medium text-sm disabled:opacity-50"
              >
                <Trash2 size={16} />
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>

      {workout.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {workout.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-3 py-1">
          {workout.exercises.length} exercise{workout.exercises.length !== 1 ? "s" : ""}
        </span>

        <button
          onClick={() => onStart(workout)}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 bg-[#FC6500] hover:bg-[#E55A00] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play size={16} />
          Start
        </button>
      </div>
    </div>
  );
}
