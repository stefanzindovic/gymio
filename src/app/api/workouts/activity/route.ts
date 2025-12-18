import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ActivityResponse, ActivitySummary } from "@/types/workout";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function calculateStreaks(dates: string[]): {
  current_streak: number;
  longest_streak: number;
} {
  if (dates.length === 0) {
    return { current_streak: 0, longest_streak: 0 };
  }

  const sortedDates = dates.map((d) => new Date(d)).sort((a, b) => a.getTime() - b.getTime());
  let longest_streak = 1;
  let current_streak = 1;
  let tempStreak = 1;

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const lastDate = sortedDates[sortedDates.length - 1];

  const dayDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currentDate = new Date(sortedDates[i]);

    prevDate.setUTCHours(0, 0, 0, 0);
    currentDate.setUTCHours(0, 0, 0, 0);

    const diff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      tempStreak++;
      if (tempStreak > longest_streak) {
        longest_streak = tempStreak;
      }
    } else {
      tempStreak = 1;
    }
  }

  if (dayDiff <= 1) {
    current_streak = tempStreak;
  } else {
    current_streak = 0;
  }

  return { current_streak, longest_streak };
}

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

    const url = new URL(request.url);
    const startDateParam = url.searchParams.get("start_date");
    const endDateParam = url.searchParams.get("end_date");

    let startDateStr: string;
    let endDateStr: string;

    if (endDateParam) {
      endDateStr = endDateParam;
    } else {
      const today = new Date();
      endDateStr = today.toISOString().split("T")[0];
    }

    if (startDateParam) {
      startDateStr = startDateParam;
    } else {
      const endDate = new Date(endDateStr);
      const startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
      startDateStr = startDate.toISOString().split("T")[0];
    }

    const { data: activities, error: dbError } = await supabaseAdmin
      .from("workout_activities")
      .select("activity_date")
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("activity_date", startDateStr)
      .lte("activity_date", endDateStr);

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }

    const activityMap: { [date: string]: number } = {};
    const activeDates: string[] = [];

    activities?.forEach((activity) => {
      const dateStr = activity.activity_date;

      activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
      if (!activeDates.includes(dateStr)) {
        activeDates.push(dateStr);
      }
    });

    const startDateObj = new Date(startDateStr);
    const endDateObj = new Date(endDateStr);

    for (let d = new Date(startDateObj); d <= endDateObj; d.setUTCDate(d.getUTCDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      if (!(dateStr in activityMap)) {
        activityMap[dateStr] = 0;
      }
    }

    const { current_streak, longest_streak } = calculateStreaks(activeDates);

    const summary: ActivitySummary = {
      total_workouts: activities?.length || 0,
      active_days: activeDates.length,
      current_streak,
      longest_streak,
    };

    const response: ActivityResponse = {
      data: activityMap,
      summary,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
