"use client";

import React from "react";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
  ariaLabel?: string;
  icon?: React.ReactNode;
}

export function FloatingActionButton({
  onClick,
  ariaLabel = "Create new item",
  icon = <Plus size={24} />,
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full bg-[#FC6500] hover:bg-[#E55A00] shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white"
    >
      {icon}
    </button>
  );
}
