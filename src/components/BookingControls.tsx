import { Info, RotateCcw } from "lucide-react";
import React, { useState } from "react";

interface BookingControlsProps {
  onReset?: () => void;
  onTicketCountChange?: (count: number) => void;
  onAdjacentSeatsChange?: (count: number) => void;
}

export const BookingControls: React.FC<BookingControlsProps> = ({
  onReset,
  onTicketCountChange,
  onAdjacentSeatsChange,
}) => {
  const [ticketCount, setTicketCount] = useState(0);
  const [adjacentSeats, setAdjacentSeats] = useState(1);

  const handleTicketCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    setTicketCount(value);
    onTicketCountChange?.(value);
  };

  const handleAdjacentSeatsChange = (count: number) => {
    setAdjacentSeats(count);
    onAdjacentSeatsChange?.(count);
  };

  const handleReset = () => {
    setTicketCount(0);
    setAdjacentSeats(1);
    onReset?.();
  };

  return (
    <div className="bg-[#2A2A2A] rounded-lg p-6 shadow-lg border border-white/10">
      {/* Header Row */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Chọn ghế</h1>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-white/20 rounded-lg hover:bg-[#333] transition-colors text-white text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Đặt lại
        </button>
      </div>

      {/* Ticket Count Selection */}
      <div className="mb-6">
        <label
          htmlFor="ticketCount"
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          Số lượng vé
        </label>
        <select
          id="ticketCount"
          value={ticketCount}
          onChange={handleTicketCountChange}
          className="w-full px-4 py-2.5 bg-[#1A1A1A] border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent cursor-pointer"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Adjacent Seats Selection */}
      <div>
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-300">
              Chọn ghế liền nhau
            </label>
            <div className="group relative">
              <Info className="w-4 h-4 text-gray-400 cursor-help" />
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-700 text-white text-xs rounded shadow-lg z-10">
                Chọn số lượng ghế liền nhau bạn muốn đặt
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-400">
            Có thể chọn tối đa 8 người.(Max:8)
          </span>
        </div>

        {/* Radio Button Group */}
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4].map((count) => (
            <label
              key={count}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="radio"
                name="adjacentSeats"
                value={count}
                checked={adjacentSeats === count}
                onChange={() => handleAdjacentSeatsChange(count)}
                className="w-4 h-4 text-[#E50914] border-gray-600 focus:ring-2 focus:ring-[#E50914] cursor-pointer"
              />
              <div className="flex items-center gap-1">
                {/* Radio Circle Visual */}
                <div
                  className={`w-5 h-5 rounded-full border-2 transition-colors ${
                    adjacentSeats === count
                      ? "border-[#E50914] bg-[#E50914]"
                      : "border-gray-500 bg-transparent"
                  }`}
                >
                  {adjacentSeats === count && (
                    <div className="w-full h-full rounded-full bg-white scale-50" />
                  )}
                </div>
                {/* Seat Squares */}
                <div className="flex gap-0.5">
                  {Array.from({ length: count }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-sm border transition-colors ${
                        adjacentSeats === count
                          ? "border-[#E50914] bg-[#E50914]/20"
                          : "border-gray-500 bg-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
