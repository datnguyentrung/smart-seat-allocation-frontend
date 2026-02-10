import { clsx, type ClassValue } from "clsx";
import { X } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { type SeatState, type SeatType } from "../types/types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SeatProps {
  id: number;
  type: SeatType;
  state: SeatState | undefined;
  onClick: (id: number) => void;
  label?: string;
}

export const Seat: React.FC<SeatProps> = ({
  id,
  type,
  state = "AVAILABLE",
  onClick,
  label,
}) => {
  const isSelected = state === "SELECTED";
  const isBooked = state === "BOOKED";

  const baseStyles =
    "relative flex items-center justify-center rounded-sm transition-all duration-200 cursor-pointer text-[10px] font-medium";

  const typeStyles = {
    STANDARD: "w-8 h-8",
    VIP: "w-8 h-8 border-2 border-[#FFD700]",
    COUPLE: "w-[72px] h-8 rounded-md",
  };

  const stateStyles = {
    AVAILABLE: "border border-white/30 text-white/50 hover:border-white/60",
    BOOKED: "bg-gray-800 text-gray-600 cursor-not-allowed border-none",
    SELECTED:
      "bg-[#E50914] text-white border-none shadow-[0_0_10px_rgba(229,9,20,0.4)]",
  };

  if (type === "COUPLE") {
    return (
      <motion.button
        whileTap={{ scale: isBooked ? 1 : 0.95 }}
        onClick={() => !isBooked && onClick(id)}
        disabled={isBooked}
        className={cn(
          baseStyles,
          typeStyles.COUPLE,
          stateStyles[state],
          state === "AVAILABLE" && "border-[#FF69B4]/40 text-[#FF69B4]/60",
          state === "SELECTED" &&
            "bg-[#FF69B4] text-white shadow-[0_0_10px_rgba(255,105,180,0.4)]",
        )}
      >
        {isBooked ? <X size={14} /> : isSelected ? label : "Couple"}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: isBooked ? 1 : 0.9 }}
      onClick={() => !isBooked && onClick(id)}
      disabled={isBooked}
      className={cn(baseStyles, typeStyles[type], stateStyles[state])}
    >
      {isBooked ? <X size={14} /> : isSelected ? label : ""}
    </motion.button>
  );
};
