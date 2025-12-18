import { InProgressWorkout } from "@/types/workout";

const ACTIVE_WORKOUT_KEY = "active_workout";

export function saveWorkoutToLocalStorage(workout: InProgressWorkout): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(workout));
  } catch (error) {
    console.error("Failed to save workout to localStorage:", error);
  }
}

export function loadWorkoutFromLocalStorage(): InProgressWorkout | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(ACTIVE_WORKOUT_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as InProgressWorkout;
  } catch (error) {
    console.error("Failed to load workout from localStorage:", error);
    return null;
  }
}

export function clearWorkoutFromLocalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACTIVE_WORKOUT_KEY);
  } catch (error) {
    console.error("Failed to clear workout from localStorage:", error);
  }
}
