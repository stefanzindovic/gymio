"use client";

import { useMemo } from "react";
import { ActivityCalendarCell } from "./activity-calendar-cell";
import { ActivityData } from "@/types/workout";

interface ActivityCalendarGridProps {
  data: ActivityData;
  weeks?: number;
  startDate?: Date;
  endDate?: Date;
}

export function ActivityCalendarGrid({ data, weeks = 52, startDate: providedStart, endDate: providedEnd }: ActivityCalendarGridProps) {
  const { weeks: calendarWeeks, monthLabels } = useMemo(() => {
    let startDate: Date;
    let endDate: Date;

    if (providedStart && providedEnd) {
      startDate = new Date(providedStart);
      endDate = new Date(providedEnd);
    } else {
      endDate = new Date();
      endDate.setUTCHours(0, 0, 0, 0);

      startDate = new Date(endDate);
      startDate.setUTCDate(startDate.getUTCDate() - weeks * 7 + 1);
    }

    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);

    const calendarWeeks: Date[][] = [];
    const monthLabelMap: { [weekIndex: number]: string } = {};

    let currentDate = new Date(startDate);

    for (let w = 0; w < weeks; w++) {
      const week: Date[] = [];
      const weekStartMonth = currentDate.toLocaleDateString("en-US", { month: "short" });

      if (!monthLabelMap[w] || monthLabelMap[w] !== weekStartMonth) {
        if (currentDate.getUTCDate() <= 7) {
          monthLabelMap[w] = weekStartMonth;
        }
      }

      for (let d = 0; d < 7; d++) {
        week.push(new Date(currentDate));
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }

      calendarWeeks.push(week);
    }

    return { weeks: calendarWeeks, monthLabels: monthLabelMap };
  }, [weeks, providedStart, providedEnd]);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="inline-flex gap-1 sm:gap-[3px]">
        <div className="flex flex-col gap-1 sm:gap-[3px]">
          <div className="h-5" />
          <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Mon</div>
          <div className="h-3" />
          <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Wed</div>
          <div className="h-3" />
          <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Fri</div>
          <div className="h-3" />
          <div className="text-[10px] sm:text-xs text-gray-500 font-medium">Sun</div>
        </div>

        <div className="flex gap-1 sm:gap-[3px]">
          {calendarWeeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1 sm:gap-[3px]">
              <div className="text-[10px] sm:text-xs text-gray-500 font-medium min-h-5 flex items-center justify-center">
                {monthLabels[weekIndex]}
              </div>

              {week.map((date, dayIndex) => {
                const dateStr = date.toISOString().split("T")[0];
                const count = data[dateStr] || 0;

                return <ActivityCalendarCell key={`${weekIndex}-${dayIndex}`} date={date} count={count} />;
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
