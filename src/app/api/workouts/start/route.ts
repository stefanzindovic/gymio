import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { StartWorkoutRequest, StartWorkoutResponse, WorkoutWithExercises } from "@/types/workout";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: StartWorkoutRequest = await request.json();

    if (!body.workout_id) {
      return NextResponse.json(
        { error: "Workout ID is required" },
        { status: 400 }
      );
    }

    const { data: workout, error: workoutError } = await supabaseAdmin
      .from("workouts")
      .select("*")
      .eq("id", body.workout_id)
      .eq("user_id", user.id)
      .single();

    if (workoutError || !workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    const today = new Date();
    const activityDate = today.toISOString().split("T")[0];

    const { data: activity, error: activityError } = await supabaseAdmin
      .from("workout_activities")
      .insert({
        user_id: user.id,
        workout_id: body.workout_id,
        completed: false,
        activity_date: activityDate,
      })
      .select()
      .single();

    if (activityError) {
      console.error("Database error creating activity:", activityError);
      return NextResponse.json(
        { error: "Failed to start workout" },
        { status: 500 }
      );
    }

    const { data: exercises, error: exercisesError } = await supabaseAdmin
      .from("workout_exercises")
      .select("*")
      .eq("workout_id", body.workout_id)
      .order("exercise_order", { ascending: true });

    if (exercisesError) {
      console.error("Database error fetching exercises:", exercisesError);
      return NextResponse.json(
        { error: "Failed to fetch exercises" },
        { status: 500 }
      );
    }

    const workoutWithExercises: WorkoutWithExercises = {
      ...workout,
      exercises: exercises || [],
    };

    const response: StartWorkoutResponse = {
      workout_activity_id: activity.id,
      workout: workoutWithExercises,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
