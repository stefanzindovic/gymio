import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { UpdateWorkoutRequest, WorkoutWithExercises } from "@/types/workout";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "Unauthorized" };
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: "Unauthorized" };
  }

  return { user, error: null };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { user, error: authError } = await getUser(request);
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { data: workout, error: workoutError } = await supabaseAdmin
      .from("workouts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single();

    if (workoutError || !workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    const { data: exercises, error: exercisesError } = await supabaseAdmin
      .from("workout_exercises")
      .select("*")
      .eq("workout_id", workout.id)
      .order("exercise_order", { ascending: true });

    if (exercisesError) {
      console.error("Database error:", exercisesError);
      return NextResponse.json(
        { error: "Failed to fetch exercises" },
        { status: 500 }
      );
    }

    const workoutWithExercises: WorkoutWithExercises = {
      ...workout,
      exercises: exercises || [],
    };

    return NextResponse.json(workoutWithExercises);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { user, error: authError } = await getUser(request);
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { data: workout, error: workoutError } = await supabaseAdmin
      .from("workouts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single();

    if (workoutError || !workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    const body: UpdateWorkoutRequest = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined)
      updateData.description = body.description?.trim() || null;

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from("workouts")
        .update(updateData)
        .eq("id", id);

      if (updateError) {
        console.error("Database error updating workout:", updateError);
        return NextResponse.json(
          { error: "Failed to update workout" },
          { status: 500 }
        );
      }
    }

    if (body.exercises && Array.isArray(body.exercises)) {
      await supabaseAdmin
        .from("workout_exercises")
        .delete()
        .eq("workout_id", id);

      const exercisesToInsert = body.exercises.map((ex) => ({
        workout_id: id,
        exercise_id: ex.exercise_id,
        exercise_name: ex.exercise_name,
        sets: ex.sets,
        reps: ex.reps,
        rest_time_seconds: ex.rest_time_seconds,
        exercise_order: ex.exercise_order,
      }));

      const { error: insertError } = await supabaseAdmin
        .from("workout_exercises")
        .insert(exercisesToInsert);

      if (insertError) {
        console.error("Database error inserting exercises:", insertError);
        return NextResponse.json(
          { error: "Failed to update exercises" },
          { status: 500 }
        );
      }
    }

    const { data: updatedWorkout, error: fetchError } = await supabaseAdmin
      .from("workouts")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Failed to fetch updated workout" }, { status: 500 });
    }

    const { data: exercises } = await supabaseAdmin
      .from("workout_exercises")
      .select("*")
      .eq("workout_id", id)
      .order("exercise_order", { ascending: true });

    const workoutWithExercises: WorkoutWithExercises = {
      ...updatedWorkout,
      exercises: exercises || [],
    };

    return NextResponse.json(workoutWithExercises);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { user, error: authError } = await getUser(request);
    if (authError) {
      return NextResponse.json({ error: authError }, { status: 401 });
    }

    const { data: workout, error: workoutError } = await supabaseAdmin
      .from("workouts")
      .select("*")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single();

    if (workoutError || !workout) {
      return NextResponse.json({ error: "Workout not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from("workouts")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Database error deleting workout:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete workout" },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
