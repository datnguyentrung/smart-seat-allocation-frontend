import { ChevronLeft, Info } from "lucide-react";
import React from "react";

interface HeaderProps {
  movieTitle: string;
  showTime: string;
  cinemaName: string;
}

export const Header: React.FC<HeaderProps> = ({
  movieTitle,
  showTime,
  cinemaName,
}) => {
  return (
    <header className="p-4 flex items-center justify-between text-white border-b border-white/5">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-lg font-bold leading-tight tracking-tight">
            {movieTitle}
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{showTime}</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>{cinemaName}</span>
          </div>
        </div>
      </div>
      <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
        <Info size={20} className="text-gray-400" />
      </button>
    </header>
  );
};
