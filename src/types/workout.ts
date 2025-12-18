export interface Workout {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: number;
  exercise_name: string;
  sets: number;
  reps: number;
  rest_time_seconds: number;
  exercise_order: number;
  created_at: string;
}

export interface WorkoutActivity {
  id: string;
  user_id: string;
  workout_id: string;
  completed: boolean;
  activity_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityData {
  [date: string]: number;
}

export interface ActivitySummary {
  total_workouts: number;
  active_days: number;
  current_streak: number;
  longest_streak: number;
}

export interface ActivityResponse {
  data: ActivityData;
  summary: ActivitySummary;
}

export interface WorkoutActivityExercise {
  id: string;
  workout_activity_id: string;
  workout_exercise_id: string;
  sets_completed: number;
  reps_completed: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutWithExercises extends Workout {
  exercises: WorkoutExercise[];
}

export interface CompletedSet {
  setNumber: number;
  reps: number;
  completed: boolean;
}

export interface InProgressExercise {
  workoutExerciseId: string;
  exerciseId: number;
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  restTimeSeconds: number;
  exerciseOrder: number;
  completedSets: CompletedSet[];
}

export interface InProgressWorkout {
  workoutId: string;
  workoutActivityId: string;
  workoutName: string;
  startedAt: string;
  exercises: InProgressExercise[];
}

export interface CreateWorkoutExerciseRequest {
  exercise_id: number;
  exercise_name: string;
  sets: number;
  reps: number;
  rest_time_seconds: number;
  exercise_order: number;
}

export interface CreateWorkoutRequest {
  name: string;
  description?: string;
  exercises: CreateWorkoutExerciseRequest[];
}

export interface UpdateWorkoutRequest {
  name?: string;
  description?: string;
  exercises?: CreateWorkoutExerciseRequest[];
}

export interface StartWorkoutRequest {
  workout_id: string;
}

export interface StartWorkoutResponse {
  workout_activity_id: string;
  workout: WorkoutWithExercises;
}

export interface FinishWorkoutExerciseRequest {
  workout_exercise_id: string;
  sets_completed: number;
  reps_completed: number;
  notes?: string;
}

export interface FinishWorkoutRequest {
  workout_activity_id: string;
  exercises: FinishWorkoutExerciseRequest[];
  notes?: string;
}
