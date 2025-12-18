import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const { data: activity, error: activityError } = await supabaseAdmin
      .from("workout_activities")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (activityError || !activity) {
      return NextResponse.json(
        { error: "Workout activity not found" },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from("workout_activities")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Database error deleting activity:", deleteError);
      return NextResponse.json(
        { error: "Failed to cancel workout" },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
