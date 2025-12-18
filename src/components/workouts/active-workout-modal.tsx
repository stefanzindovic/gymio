"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, CheckCircle2, Circle, X } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useApiMutation } from "@/hooks/use-api-query";
import { useAuth } from "@/hooks/use-auth";
import {
  InProgressWorkout,
  InProgressExercise,
  FinishWorkoutRequest,
} from "@/types/workout";
import { BaseModalProps } from "@/types/modal";
import {
  saveWorkoutToLocalStorage,
  clearWorkoutFromLocalStorage,
} from "@/lib/workouts/storage";
import { useQueryClient } from "@tanstack/react-query";

interface ActiveWorkoutModalProps extends BaseModalProps {
  inProgressWorkout: InProgressWorkout;
  onFinish: () => void;
  onCancel: () => void;
}

export function ActiveWorkoutModal({
  isOpen,
  onClose,
  inProgressWorkout,
  onFinish,
  onCancel,
}: ActiveWorkoutModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [workout, setWorkout] = useState(inProgressWorkout);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(
    workout.exercises[0]?.workoutExerciseId || null
  );
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const finishMutation = useApiMutation<any, FinishWorkoutRequest>(
    "POST",
    "/workouts/finish",
    true
  );

  const cancelMutation = useApiMutation<any, {}, any>(
    "DELETE",
    `/workouts/activity/${workout.workoutActivityId}`,
    true
  );

  useEffect(() => {
    setWorkout(inProgressWorkout);
  }, [inProgressWorkout]);

  useEffect(() => {
    if (isOpen) {
      saveWorkoutToLocalStorage(workout);
    }
  }, [workout, isOpen]);

  const handleCompleteSet = (exerciseId: string, setNumber: number) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.workoutExerciseId === exerciseId) {
          return {
            ...ex,
            completedSets: ex.completedSets.map((s) =>
              s.setNumber === setNumber ? { ...s, completed: !s.completed } : s
            ),
          };
        }
        return ex;
      }),
    }));
  };

  const handleUpdateReps = (
    exerciseId: string,
    setNumber: number,
    reps: number
  ) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.workoutExerciseId === exerciseId) {
          return {
            ...ex,
            completedSets: ex.completedSets.map((s) =>
              s.setNumber === setNumber ? { ...s, reps } : s
            ),
          };
        }
        return ex;
      }),
    }));
  };

  const getCompletedCount = (): number => {
    return workout.exercises.filter((ex) =>
      ex.completedSets.every((s) => s.completed)
    ).length;
  };

  const handleFinish = async () => {
    const payload: FinishWorkoutRequest = {
      workout_activity_id: workout.workoutActivityId,
      exercises: workout.exercises.map((ex) => {
        const completedReps = ex.completedSets
          .filter((s) => s.completed)
          .reduce((sum, s) => sum + s.reps, 0);
        const completedSets = ex.completedSets.filter(
          (s) => s.completed
        ).length;

        return {
          workout_exercise_id: ex.workoutExerciseId,
          sets_completed: completedSets,
          reps_completed:
            completedSets > 0
              ? Math.round(completedReps / completedSets)
              : 0,
        };
      }),
    };

    finishMutation.mutate(payload, {
      onSuccess: () => {
        clearWorkoutFromLocalStorage();
        queryClient.invalidateQueries({
          queryKey: ["workout-activity", user?.id],
        });
        onFinish();
        onClose();
      },
      onError: (error: any) => {
        console.error("Error finishing workout:", error);
      },
    });
  };

  const handleCancelWorkout = async () => {
    cancelMutation.mutate(
      {},
      {
        onSuccess: () => {
          clearWorkoutFromLocalStorage();
          onCancel();
          setShowCancelDialog(false);
          onClose();
        },
        onError: (error: any) => {
          console.error("Error canceling workout:", error);
        },
      }
    );
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {}}
        title={workout.workoutName}
        size="xl"
        showCloseButton={false}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              Progress: {getCompletedCount()} of {workout.exercises.length}{" "}
              exercises completed
            </p>
          </div>

          <div className="space-y-2">
            {workout.exercises.map((exercise, idx) => {
              const isExpanded =
                expandedExercise === exercise.workoutExerciseId;
              const allSetsDone = exercise.completedSets.every(
                (s) => s.completed
              );

              return (
                <div key={exercise.workoutExerciseId} className="space-y-2">
                  <button
                    onClick={() =>
                      setExpandedExercise(
                        isExpanded ? null : exercise.workoutExerciseId
                      )
                    }
                    className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-4 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {allSetsDone ? (
                        <CheckCircle2 size={24} className="text-green-600" />
                      ) : (
                        <Circle size={24} className="text-gray-400" />
                      )}
                      <div className="text-left">
                        <h4 className="font-medium text-gray-900">
                          {exercise.exerciseName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {exercise.targetSets} sets × {exercise.targetReps} reps
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-600 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4 ml-8 space-y-3">
                      <div className="grid gap-2">
                        {exercise.completedSets.map((set) => (
                          <div
                            key={set.setNumber}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                              set.completed
                                ? "bg-green-50 border border-green-200"
                                : "bg-gray-50 border border-gray-200"
                            }`}
                          >
                            <button
                              onClick={() =>
                                handleCompleteSet(
                                  exercise.workoutExerciseId,
                                  set.setNumber
                                )
                              }
                              className="flex-shrink-0"
                            >
                              {set.completed ? (
                                <CheckCircle2
                                  size={24}
                                  className="text-green-600"
                                />
                              ) : (
                                <Circle
                                  size={24}
                                  className="text-gray-400 hover:text-gray-600"
                                />
                              )}
                            </button>

                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">
                                Set {set.setNumber}
                              </p>
                            </div>

                            <input
                              type="number"
                              min="0"
                              value={set.reps}
                              onChange={(e) =>
                                handleUpdateReps(
                                  exercise.workoutExerciseId,
                                  set.setNumber,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder="Reps"
                              className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:border-[#FC6500] focus:outline-none focus:ring-1 focus:ring-[#FC6500]"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          Rest: {exercise.restTimeSeconds}s
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowCancelDialog(true)}
              disabled={finishMutation.isPending || cancelMutation.isPending}
              className="flex-1 px-4 py-3 border border-red-300 rounded-lg text-red-600 font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Cancel Workout
            </button>
            <button
              onClick={handleFinish}
              disabled={finishMutation.isPending || cancelMutation.isPending}
              className="flex-1 px-4 py-3 bg-[#FC6500] hover:bg-[#E55A00] text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {finishMutation.isPending ? "Finishing..." : "Finish Workout"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        title="Cancel Workout?"
        message="Are you sure you want to cancel this workout? Your progress will be lost."
        confirmText="Cancel Workout"
        cancelText="Keep Workout"
        onConfirm={handleCancelWorkout}
        isDestructive={true}
        isLoading={cancelMutation.isPending}
      />
    </>
  );
}
