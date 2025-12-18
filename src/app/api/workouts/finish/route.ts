import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { FinishWorkoutRequest } from "@/types/workout";

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

    const body: FinishWorkoutRequest = await request.json();

    if (!body.workout_activity_id) {
      return NextResponse.json(
        { error: "Workout activity ID is required" },
        { status: 400 }
      );
    }

    const { data: activity, error: activityError } = await supabaseAdmin
      .from("workout_activities")
      .select("*")
      .eq("id", body.workout_activity_id)
      .eq("user_id", user.id)
      .single();

    if (activityError || !activity) {
      return NextResponse.json(
        { error: "Workout activity not found" },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from("workout_activities")
      .update({
        completed: true,
        notes: body.notes || null,
      })
      .eq("id", body.workout_activity_id);

    if (updateError) {
      console.error("Database error updating activity:", updateError);
      return NextResponse.json(
        { error: "Failed to finish workout" },
        { status: 500 }
      );
    }

    const exercisesToInsert = body.exercises.map((ex) => ({
      workout_activity_id: body.workout_activity_id,
      workout_exercise_id: ex.workout_exercise_id,
      sets_completed: ex.sets_completed,
      reps_completed: ex.reps_completed,
      notes: ex.notes || null,
    }));

    const { error: exercisesError } = await supabaseAdmin
      .from("workout_activity_exercises")
      .insert(exercisesToInsert);

    if (exercisesError) {
      console.error("Database error inserting exercise performance:", exercisesError);
      return NextResponse.json(
        { error: "Failed to save exercise performance" },
        { status: 500 }
      );
    }

    return NextResponse.json({ activity }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
