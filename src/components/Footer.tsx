import { AnimatePresence, motion } from "motion/react";
import React from "react";

interface FooterProps {
  selectedSeats: string[];
  totalPrice: number;
  onContinue: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  selectedSeats,
  totalPrice,
  onContinue,
}) => {
  const isActive = selectedSeats.length > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A1A]/80 backdrop-blur-md border-t border-white/5 p-4 pb-8 flex items-center justify-between z-50">
      <div className="flex flex-col">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold h-4">
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
          className="text-xl font-bold text-white"
        >
          {totalPrice.toLocaleString()}{" "}
          <span className="text-xs font-normal text-gray-500">VND</span>
        </motion.span>
      </div>

      <motion.button
        whileHover={{ scale: isActive ? 1.02 : 1 }}
        whileTap={{ scale: isActive ? 0.98 : 1 }}
        disabled={!isActive}
        onClick={onContinue}
        className={`px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 ${
          isActive
            ? "bg-[#E50914] text-white shadow-[0_4px_20px_rgba(229,9,20,0.3)] opacity-100"
            : "bg-gray-800 text-gray-500 opacity-50 cursor-not-allowed"
        }`}
      >
        CONTINUE
      </motion.button>
    </div>
  );
};
