import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { CreateWorkoutRequest, WorkoutWithExercises } from "@/types/workout";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: workouts, error: workoutsError } = await supabaseAdmin
      .from("workouts")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (workoutsError) {
      console.error("Database error:", workoutsError);
      return NextResponse.json({ error: "Failed to fetch workouts" }, { status: 500 });
    }

    const workoutsWithExercises: WorkoutWithExercises[] = [];

    for (const workout of workouts || []) {
      const { data: exercises, error: exercisesError } = await supabaseAdmin
        .from("workout_exercises")
        .select("*")
        .eq("workout_id", workout.id)
        .order("exercise_order", { ascending: true });

      if (exercisesError) {
        console.error("Database error fetching exercises:", exercisesError);
        continue;
      }

      workoutsWithExercises.push({
        ...workout,
        exercises: exercises || [],
      });
    }

    return NextResponse.json({
      workouts: workoutsWithExercises,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CreateWorkoutRequest = await request.json();
    console.log("Creating workout with body:", JSON.stringify(body, null, 2));

    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: "Workout name is required" },
        { status: 400 }
      );
    }

    if (!body.exercises || body.exercises.length === 0) {
      return NextResponse.json(
        { error: "At least one exercise is required" },
        { status: 400 }
      );
    }

    const { data: workout, error: workoutError } = await supabaseAdmin
      .from("workouts")
      .insert({
        user_id: user.id,
        name: body.name.trim(),
        description: body.description?.trim() || null,
      })
      .select();

    if (workoutError || !workout || workout.length === 0) {
      console.error("Database error creating workout:", workoutError);
      return NextResponse.json(
        { error: "Failed to create workout", details: workoutError?.message },
        { status: 500 }
      );
    }

    const createdWorkout = workout[0];

    const exercisesToInsert = body.exercises.map((ex) => ({
      workout_id: createdWorkout.id,
      exercise_id: ex.exercise_id,
      exercise_name: ex.exercise_name,
      sets: ex.sets,
      reps: ex.reps,
      rest_time_seconds: ex.rest_time_seconds,
      exercise_order: ex.exercise_order,
    }));

    const { data: exercises, error: exercisesError } = await supabaseAdmin
      .from("workout_exercises")
      .insert(exercisesToInsert)
      .select();

    if (exercisesError) {
      console.error("Database error creating exercises:", exercisesError);
      await supabaseAdmin.from("workouts").delete().eq("id", createdWorkout.id);
      return NextResponse.json(
        { error: "Failed to create workout exercises", details: exercisesError?.message },
        { status: 500 }
      );
    }

    const workoutWithExercises: WorkoutWithExercises = {
      ...createdWorkout,
      exercises: exercises || [],
    };

    return NextResponse.json(
      { workout: workoutWithExercises },
      { status: 201 }
    );
  } catch (error) {
    console.error("API error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
