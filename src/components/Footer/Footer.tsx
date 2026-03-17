import { AnimatePresence, motion } from "motion/react";
import React from "react";
import styles from "./Footer.module.scss";

interface FooterProps {
  active: boolean;
  selectedSeats: string[];
  totalPrice: number;
  onContinue: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  active,
  selectedSeats,
  totalPrice,
  onContinue,
}) => {
  return (
    <div className={styles.footer}>
      <div className={styles["info-section"]}>
        <span className={styles.label}>
          <AnimatePresence mode="wait">
            <motion.span
              key={selectedSeats.join(",")}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
            >
              {selectedSeats.length > 0
                ? selectedSeats.join(", ")
                : "No seats selected"}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.span
          key={totalPrice}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className={styles.price}
        >
          {totalPrice.toLocaleString()}{" "}
          <span className={styles.currency}>VND</span>
        </motion.span>
      </div>

      <motion.button
        whileHover={{ scale: active ? 1.02 : 1 }}
        whileTap={{ scale: active ? 0.98 : 1 }}
        disabled={!active}
        onClick={onContinue}
        className={styles["continue-button"]}
      >
        CONTINUE
      </motion.button>
    </div>
  );
};
