import { motion } from "motion/react";

interface HeaderProps {
  movieTitle: string;
  showTime: string;
  cinemaName: string;
}

export function Header({ movieTitle, showTime, cinemaName }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full border-b border-gray-800 bg-[#1A1A1A]/80 backdrop-blur-sm sticky top-0 z-10"
    >
      <div className="max-w-2xl mx-auto px-4 py-4">
        <h1 className="text-lg font-bold text-white mb-1">{movieTitle}</h1>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{showTime}</span>
          <span>•</span>
          <span>{cinemaName}</span>
        </div>
      </div>
    </motion.header>
  );
}
