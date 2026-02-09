import { motion } from "motion/react";

interface FooterProps {
  selectedSeats: string[];
  totalPrice: number;
  onContinue: () => void;
}

export function Footer({ selectedSeats, totalPrice, onContinue }: FooterProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <motion.footer
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-[#0F0F0F] border-t border-gray-800 shadow-2xl"
    >
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Selected Seats</p>
            <p className="text-sm font-semibold text-white">
              {selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Total</p>
            <p className="text-lg font-bold text-[#E50914]">
              {formatPrice(totalPrice)}
            </p>
          </div>
        </div>
        <button
          onClick={onContinue}
          disabled={selectedSeats.length === 0}
          className="w-full bg-[#E50914] hover:bg-[#E50914]/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 text-sm"
        >
          Continue
        </button>
      </div>
    </motion.footer>
  );
}
