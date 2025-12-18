"use client";

import { useState } from "react";

interface ActivityCalendarCellProps {
  date: Date;
  count: number;
}

export function ActivityCalendarCell({ date, count }: ActivityCalendarCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getBackgroundColor = () => {
    if (count === 0) return "bg-gray-200";
    if (count === 1) return "bg-[#FCD6B3]";
    if (count <= 3) return "bg-[#FCA757]";
    return "bg-[#FC6500]";
  };

  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative inline-block">
      <div
        className={`w-3 h-3 sm:w-[15px] sm:h-[15px] rounded-sm ${getBackgroundColor()} border border-transparent hover:border-gray-400 cursor-pointer transition-all`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title={`${dateStr}: ${count} workout${count !== 1 ? "s" : ""}`}
      />
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
          {dateStr}
          <br />
          {count} workout{count !== 1 ? "s" : ""}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  );
}
