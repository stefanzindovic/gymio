"use client";

export function ActivityCalendarLegend() {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <span>Less</span>
      <div className="flex gap-1">
        <div className="w-3 h-3 sm:w-[15px] sm:h-[15px] bg-gray-200 rounded-sm" title="0 workouts" />
        <div className="w-3 h-3 sm:w-[15px] sm:h-[15px] bg-[#FCD6B3] rounded-sm" title="1 workout" />
        <div className="w-3 h-3 sm:w-[15px] sm:h-[15px] bg-[#FCA757] rounded-sm" title="2-3 workouts" />
        <div className="w-3 h-3 sm:w-[15px] sm:h-[15px] bg-[#FC6500] rounded-sm" title="4+ workouts" />
      </div>
      <span>More</span>
    </div>
  );
}
