"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useApiQuery, useApiMutation } from "@/hooks/use-api-query";
import { useQueryClient } from "@tanstack/react-query";
import { WorkoutList } from "./workout-list";
import { CreateWorkoutModal } from "./create-workout-modal";
import { ActiveWorkoutModal } from "./active-workout-modal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import {
  WorkoutWithExercises,
  InProgressWorkout,
  StartWorkoutResponse,
  CompletedSet,
} from "@/types/workout";
import {
  loadWorkoutFromLocalStorage,
  saveWorkoutToLocalStorage,
} from "@/lib/workouts/storage";

interface WorkoutsResponse {
  workouts: WorkoutWithExercises[];
}

export const MyWorkoutsSection = forwardRef<
  { openCreateModal: () => void },
  {}
>(function MyWorkoutsSectionComponent({}, ref) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<
    WorkoutWithExercises | null
  >(null);
  const [activeWorkout, setActiveWorkout] = useState<InProgressWorkout | null>(
    null
  );
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useImperativeHandle(ref, () => ({
    openCreateModal: () => setIsCreateModalOpen(true),
  }));

  const { data: workoutsData, isLoading, error } = useApiQuery<WorkoutsResponse>(
    ["workouts", user?.id],
    "GET",
    "/workouts",
    true,
    undefined,
    { staleTime: 5 * 60 * 1000 }
  );

  const workouts = workoutsData?.workouts || [];

  const startWorkoutMutation = useApiMutation<StartWorkoutResponse>(
    "POST",
    "/workouts/start",
    true
  );

  const deleteWorkoutMutation = useApiMutation<any, {}, any>(
    "DELETE",
    "",
    true
  );

  useEffect(() => {
    const savedWorkout = loadWorkoutFromLocalStorage();
    if (savedWorkout && !activeWorkout) {
      setActiveWorkout(savedWorkout);
      setIsCreateModalOpen(false);
      setEditingWorkout(null);
    }
  }, []);

  useEffect(() => {
    if (editingWorkout) {
      setIsCreateModalOpen(true);
    }
  }, [editingWorkout]);

  const handleStartWorkout = (workout: WorkoutWithExercises) => {
    startWorkoutMutation.mutate(
      { workout_id: workout.id },
      {
        onSuccess: (data) => {
          const inProgressWorkout: InProgressWorkout = {
            workoutId: workout.id,
            workoutActivityId: data.workout_activity_id,
            workoutName: workout.name,
            startedAt: new Date().toISOString(),
            exercises: data.workout.exercises.map((ex) => ({
              workoutExerciseId: ex.id,
              exerciseId: ex.exercise_id,
              exerciseName: ex.exercise_name,
              targetSets: ex.sets,
              targetReps: ex.reps,
              restTimeSeconds: ex.rest_time_seconds,
              exerciseOrder: ex.exercise_order,
              completedSets: Array.from({ length: ex.sets }, (_, i) => ({
                setNumber: i + 1,
                reps: 0,
                completed: false,
              } as CompletedSet)),
            })),
          };
          setActiveWorkout(inProgressWorkout);
          saveWorkoutToLocalStorage(inProgressWorkout);
        },
        onError: (error: any) => {
          console.error("Error starting workout:", error);
        },
      }
    );
  };

  const handleEditWorkout = (workout: WorkoutWithExercises) => {
    setEditingWorkout(workout);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setDeletingWorkoutId(workoutId);
    setShowCancelModal(true);
  };

  const confirmDeleteWorkout = async () => {
    if (!deletingWorkoutId) return;

    deleteWorkoutMutation.mutate(
      {},
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["workouts", user?.id] });
          setDeletingWorkoutId(null);
          setShowCancelModal(false);
        },
        onError: (error: any) => {
          console.error("Error deleting workout:", error);
        },
      }
    );
  };

  useEffect(() => {
    if (deletingWorkoutId) {
      deleteWorkoutMutation.mutate(
        {},
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["workouts", user?.id],
            });
            setDeletingWorkoutId(null);
          },
        }
      );
    }
  }, [deletingWorkoutId]);

  const handleFinishWorkout = () => {
    setActiveWorkout(null);
  };

  const handleCancelWorkout = () => {
    setActiveWorkout(null);
    setShowCancelModal(false);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    setEditingWorkout(null);
  };

  const handleCreateSuccess = (workout: WorkoutWithExercises) => {
    queryClient.invalidateQueries({ queryKey: ["workouts", user?.id] });
    handleCloseCreateModal();
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Workouts</h2>

        <WorkoutList
          workouts={workouts}
          isLoading={isLoading}
          error={error}
          onStartWorkout={handleStartWorkout}
          onEditWorkout={handleEditWorkout}
          onDeleteWorkout={handleDeleteWorkout}
          deletingId={deletingWorkoutId || undefined}
        />
      </div>

      <CreateWorkoutModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        workout={editingWorkout || undefined}
        onSuccess={handleCreateSuccess}
      />

      {activeWorkout && (
        <ActiveWorkoutModal
          isOpen={!!activeWorkout}
          onClose={() => setActiveWorkout(null)}
          inProgressWorkout={activeWorkout}
          onFinish={handleFinishWorkout}
          onCancel={handleCancelWorkout}
        />
      )}

      <ConfirmationDialog
        isOpen={showCancelModal && !!deletingWorkoutId}
        onClose={() => {
          setShowCancelModal(false);
          setDeletingWorkoutId(null);
        }}
        title="Delete Workout?"
        message="Are you sure you want to delete this workout? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDeleteWorkout}
        isDestructive={true}
        isLoading={deleteWorkoutMutation.isPending}
      />
    </>
  );
});
