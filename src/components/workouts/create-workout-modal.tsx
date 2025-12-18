"use client";

import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ExerciseSearchModal } from "./exercise-search-modal";
import { useApiMutation } from "@/hooks/use-api-query";
import { useAuth } from "@/hooks/use-auth";
import { WgerExerciseInfo } from "@/types/exercise";
import {
  WorkoutWithExercises,
  CreateWorkoutRequest,
  CreateWorkoutExerciseRequest,
} from "@/types/workout";
import { BaseModalProps } from "@/types/modal";
import { useQueryClient } from "@tanstack/react-query";

interface CreateWorkoutModalProps extends BaseModalProps {
  workout?: WorkoutWithExercises;
  onSuccess?: (workout: WorkoutWithExercises) => void;
}

interface SelectedExercise extends CreateWorkoutExerciseRequest {
  tempId: string;
}

export function CreateWorkoutModal({
  isOpen,
  onClose,
  workout,
  onSuccess,
}: CreateWorkoutModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>(
    []
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (workout) {
      setName(workout.name);
      setDescription(workout.description || "");
      setSelectedExercises(
        workout.exercises.map((ex, idx) => ({
          ...ex,
          tempId: `${ex.id}-${idx}`,
        }))
      );
    } else {
      setName("");
      setDescription("");
      setSelectedExercises([]);
    }
    setErrors({});
  }, [workout, isOpen]);

  const isEditing = !!workout;
  const isCreateMutation = useApiMutation<
    { workout: WorkoutWithExercises },
    CreateWorkoutRequest
  >("POST", "/workouts", true);

  const isEditMutation = useApiMutation<
    WorkoutWithExercises,
    CreateWorkoutRequest
  >("PUT", `/workouts/${workout?.id}`, true);

  const mutation = isEditing ? isEditMutation : isCreateMutation;

  const handleAddExercise = (exercise: WgerExerciseInfo) => {
    const exerciseName =
      exercise.translations?.find((t) => t.language === "en")?.name ||
      exercise.translations?.[0]?.name ||
      "Unnamed Exercise";

    const newExercise: SelectedExercise = {
      exercise_id: exercise.id,
      exercise_name: exerciseName,
      sets: 3,
      reps: 10,
      rest_time_seconds: 60,
      exercise_order: selectedExercises.length,
      tempId: `${exercise.id}-${Date.now()}`,
    };
    setSelectedExercises([...selectedExercises, newExercise]);
  };

  const handleRemoveExercise = (tempId: string) => {
    setSelectedExercises(
      selectedExercises
        .filter((ex) => ex.tempId !== tempId)
        .map((ex, idx) => ({ ...ex, exercise_order: idx }))
    );
  };

  const handleUpdateExercise = (
    tempId: string,
    updates: Partial<SelectedExercise>
  ) => {
    setSelectedExercises(
      selectedExercises.map((ex) =>
        ex.tempId === tempId ? { ...ex, ...updates } : ex
      )
    );
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Workout name is required";
    }

    if (selectedExercises.length === 0) {
      newErrors.exercises = "At least one exercise is required";
    }

    selectedExercises.forEach((ex, idx) => {
      if (ex.sets < 1 || ex.sets > 10) {
        newErrors[`exercise-${idx}-sets`] = "Sets must be between 1 and 10";
      }
      if (ex.reps < 1 || ex.reps > 100) {
        newErrors[`exercise-${idx}-reps`] = "Reps must be between 1 and 100";
      }
      if (ex.rest_time_seconds < 0 || ex.rest_time_seconds > 600) {
        newErrors[`exercise-${idx}-rest`] = "Rest time must be between 0 and 600";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload: CreateWorkoutRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      exercises: selectedExercises.map((ex) => ({
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        sets: ex.sets,
        reps: ex.reps,
        rest_time_seconds: ex.rest_time_seconds,
        exercise_order: ex.exercise_order,
      })),
    };

    mutation.mutate(payload, {
      onSuccess: (data) => {
        const workoutData = isEditing
          ? (data as WorkoutWithExercises)
          : (data as any).workout;

        queryClient.invalidateQueries({ queryKey: ["workouts", user?.id] });
        onSuccess?.(workoutData);
        onClose();
      },
      onError: (error: any) => {
        console.error("Error saving workout:", error);
        setErrors({
          submit:
            error.response?.data?.error ||
            "Failed to save workout. Please try again.",
        });
      },
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={isEditing ? "Edit Workout" : "Create Workout"}
        size="lg"
        showCloseButton={true}
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Workout Name *
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              placeholder="e.g., Chest & Triceps"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#FC6500] focus:outline-none focus:ring-2 focus:ring-[#FC6500] focus:ring-opacity-20"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes about this workout..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-[#FC6500] focus:outline-none focus:ring-2 focus:ring-[#FC6500] focus:ring-opacity-20 resize-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-900">
                Exercises *
              </label>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 text-sm font-medium text-[#FC6500] hover:text-[#E55A00] transition-colors"
              >
                <Plus size={16} />
                Add Exercise
              </button>
            </div>

            {errors.exercises && (
              <p className="text-red-600 text-sm mb-2">{errors.exercises}</p>
            )}

            <div className="space-y-3">
              {selectedExercises.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No exercises added yet
                </p>
              ) : (
                selectedExercises.map((exercise, idx) => (
                  <div
                    key={exercise.tempId}
                    className="bg-gray-50 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {exercise.exercise_name}
                        </h4>
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(exercise.tempId)}
                        className="p-1 hover:bg-red-100 rounded transition-colors text-red-600"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Sets
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={exercise.sets}
                          onChange={(e) =>
                            handleUpdateExercise(exercise.tempId, {
                              sets: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-[#FC6500] focus:outline-none focus:ring-1 focus:ring-[#FC6500]"
                        />
                        {errors[`exercise-${idx}-sets`] && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors[`exercise-${idx}-sets`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Reps
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={exercise.reps}
                          onChange={(e) =>
                            handleUpdateExercise(exercise.tempId, {
                              reps: parseInt(e.target.value) || 1,
                            })
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-[#FC6500] focus:outline-none focus:ring-1 focus:ring-[#FC6500]"
                        />
                        {errors[`exercise-${idx}-reps`] && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors[`exercise-${idx}-reps`]}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Rest (sec)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="600"
                          value={exercise.rest_time_seconds}
                          onChange={(e) =>
                            handleUpdateExercise(exercise.tempId, {
                              rest_time_seconds: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-[#FC6500] focus:outline-none focus:ring-1 focus:ring-[#FC6500]"
                        />
                        {errors[`exercise-${idx}-rest`] && (
                          <p className="text-red-600 text-xs mt-1">
                            {errors[`exercise-${idx}-rest`]}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={mutation.isPending}
              className="px-6 py-2 bg-[#FC6500] hover:bg-[#E55A00] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {mutation.isPending
                ? "Saving..."
                : isEditing
                ? "Update Workout"
                : "Create Workout"}
            </button>
          </div>
        </div>
      </Modal>

      <ExerciseSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectExercise={handleAddExercise}
      />
    </>
  );
}
