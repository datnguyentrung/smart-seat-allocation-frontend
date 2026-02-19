import { X } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { type SeatState, type SeatType } from "../types/types";
import styles from "./Seat.module.scss";

interface SeatProps {
  id: number;
  type: SeatType;
  state: SeatState | undefined;
  onClick: (id: number) => void;
  label?: string;
  suggested: boolean;
}

export const Seat: React.FC<SeatProps> = ({
  id,
  type,
  state = "AVAILABLE",
  onClick,
  label,
  suggested,
}) => {
  const isSelected = state === "SELECTED";
  const isBooked = state === "BOOKED";

  const getSeatClasses = () => {
    const classes = [styles.seat];

    // Nếu không phải ghế được gợi ý, áp dụng các lớp khác như bình thường

    // Type classes
    if (type === "STANDARD") classes.push(styles.standard);
    if (type === "VIP") classes.push(styles.vip);
    if (type === "COUPLE") classes.push(styles.couple);

    // Suggested class (nếu có)
    if (suggested) return [...classes, styles.suggested].join(" ");

    // State classes
    if (state === "AVAILABLE") classes.push(styles.available);
    if (state === "BOOKED") classes.push(styles.booked);
    if (state === "SELECTED") classes.push(styles.selected);

    return classes.join(" ");
  };

  if (type === "COUPLE") {
    return (
      <motion.button
        whileTap={{ scale: isBooked ? 1 : 0.95 }}
        onClick={() => !isBooked && onClick(id)}
        disabled={isBooked}
        className={getSeatClasses()}
      >
        {isBooked ? (
          <X size={14} className={styles["close-icon"]} />
        ) : isSelected ? (
          label
        ) : (
          "Couple"
        )}
      </motion.button>
    );
  }

  if (type === "VIP") {
    return (
      <motion.button
        whileTap={{ scale: isBooked ? 1 : 0.9 }}
        onClick={() => !isBooked && onClick(id)}
        disabled={isBooked}
        className={getSeatClasses()}
      >
        {isBooked ? <X size={14} className={styles["close-icon"]} /> : label}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: isBooked ? 1 : 0.9 }}
      onClick={() => !isBooked && onClick(id)}
      disabled={isBooked}
      className={getSeatClasses()}
    >
      {isBooked ? <X size={14} className={styles["close-icon"]} /> : label}
    </motion.button>
  );
};
