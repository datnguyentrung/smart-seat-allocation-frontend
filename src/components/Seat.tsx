import { motion } from "motion/react";

export type SeatType = "standard" | "vip" | "couple";
export type SeatState = "available" | "selected" | "booked";

interface SeatProps {
  id: string;
  type: SeatType;
  state: SeatState;
  label: string;
  onClick: (id: string) => void;
}

export function Seat({ id, type, state, onClick }: SeatProps) {
  const isCouple = type === "couple";

  const getColors = () => {
    if (state === "booked") {
      return "bg-gray-700 cursor-not-allowed";
    }
    if (state === "selected") {
      return type === "vip"
        ? "bg-amber-500 hover:bg-amber-600"
        : "bg-[#E50914] hover:bg-[#E50914]/90";
    }
    // available
    if (type === "vip") {
      return "bg-purple-900/30 hover:bg-purple-800/50 border border-purple-700/50";
    }
    return "bg-gray-800 hover:bg-gray-700 border border-gray-700";
  };

  return (
    <motion.button
      whileHover={{ scale: state !== "booked" ? 1.1 : 1 }}
      whileTap={{ scale: state !== "booked" ? 0.95 : 1 }}
      onClick={() => state !== "booked" && onClick(id)}
      disabled={state === "booked"}
      className={`
        ${isCouple ? "w-12 h-6" : "w-6 h-6"}
        rounded-sm transition-all duration-200
        ${getColors()}
      `}
      aria-label={`Seat ${id}, ${type}, ${state}`}
    />
  );
}
