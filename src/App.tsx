/* eslint-disable react-hooks/preserve-manual-memoization */
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { ErrorModal } from "./components/ErrorModal";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Legend } from "./components/Legend";
import { Screen } from "./components/Screen";
import { Seat } from "./components/Seat";
import { type SeatData, type SeatState, type SeatType } from "./types/types";

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const COLS = 16;

const INITIAL_BOOKED = [
  "A3",
  "A4",
  "B1",
  "C8",
  "D3",
  "D7",
  "F2",
  "F3",
  "G10",
  "H4",
  "I1",
  "I2",
];
const PRE_SELECTED = ["D4", "D6", "E4", "E5"];

const generateSeats = (): SeatData[] => {
  const seats: SeatData[] = [];
  let seatIdCounter = 1;

  ROWS.forEach((row, rowIndex) => {
    const isCoupleRow = row === "J";
    const numCols = isCoupleRow ? 5 : COLS;

    for (let i = 1; i <= numCols; i++) {
      const seatLabel = `${row}${i}`;
      let type: SeatType = "STANDARD";

      if (row === "J") {
        type = "COUPLE";
      } else if (["E", "F", "G"].includes(row) && i >= 3 && i <= 8) {
        type = "VIP";
      }

      let state: SeatState = "AVAILABLE";
      if (INITIAL_BOOKED.includes(seatLabel)) state = "BOOKED";
      if (PRE_SELECTED.includes(seatLabel)) state = "SELECTED";

      seats.push({
        seatId: seatIdCounter++,
        rowLabel: row,
        seatNumber: i,
        gridRow: rowIndex,
        gridCol: i - 1,
        seatType: type,
        seatState: state,
      });
    }
  });

  return seats;
};

const SEAT_PRICES: Record<SeatType, number> = {
  STANDARD: 80000,
  VIP: 120000,
  COUPLE: 200000,
};

export default function App() {
  const [seats, setSeats] = useState<SeatData[]>(generateSeats());
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const handleSeatClick = (id: number) => {
    setSeats((prev) =>
      prev.map((seat) => {
        if (seat.seatId === id && seat.seatState !== "BOOKED") {
          return {
            ...seat,
            seatState: seat.seatState === "SELECTED" ? "AVAILABLE" : "SELECTED",
          };
        }
        return seat;
      }),
    );
  };

  const validateOrphans = () => {
    // Check for orphan seats (gap of 1)
    let hasOrphan = false;
    ROWS.forEach((row) => {
      const rowSeats = seats
        .filter((s) => s.rowLabel === row)
        .sort((a, b) => a.seatNumber - b.seatNumber);
      for (let i = 0; i < rowSeats.length; i++) {
        const current = rowSeats[i];
        if (current.seatState === "AVAILABLE") {
          const left = rowSeats[i - 1];
          const right = rowSeats[i + 1];
          if (
            left?.seatState === "SELECTED" &&
            right?.seatState === "SELECTED"
          ) {
            hasOrphan = true;
          }
        }
      }
    });

    if (hasOrphan) {
      setIsErrorOpen(true);
    } else {
      console.log("Proceeding with:", selectedLabels);
    }
  };

  const selectedSeats = useMemo(
    () => seats.filter((s) => s.seatState === "SELECTED"),
    [seats],
  );

  const totalPrice = useMemo(
    () => selectedSeats.reduce((sum, s) => sum + SEAT_PRICES[s.seatType], 0),
    [selectedSeats],
  );

  const selectedLabels = selectedSeats.map((s) => s.rowLabel + s.seatNumber);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#1A1A1A] font-sans text-white flex flex-col pb-32 selection:bg-[#E50914]/30"
    >
      <Header
        movieTitle="Avatars: The Way of Water"
        showTime="19:30 - 22:30"
        cinemaName="CGV Aeon Ha Dong - Room 01"
      />

      <main className="flex-1 w-full max-w-2xl mx-auto px-2 sm:px-4 overflow-x-hidden">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Screen />
        </motion.div>

        {/* Seat Map Container */}
        <div className="flex flex-col gap-2.5 items-center scale-[0.9] sm:scale-100 origin-top">
          {ROWS.map((row, rowIndex) => (
            <motion.div
              key={row}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 + rowIndex * 0.05 }}
              className="flex items-center gap-3 sm:gap-4 w-full"
            >
              {/* Row Label Left */}
              <span className="w-4 text-[10px] text-gray-700 font-bold">
                {row}
              </span>

              {/* Seats Row */}
              <div className="flex flex-1 justify-center gap-1.5 sm:gap-2">
                {seats
                  .filter((s) => s.rowLabel === row)
                  .map((seat) => (
                    <Seat
                      key={seat.seatId}
                      id={seat.seatId}
                      type={seat.seatType}
                      state={seat.seatState}
                      label={seat.rowLabel + seat.seatNumber}
                      onClick={handleSeatClick}
                    />
                  ))}
              </div>

              {/* Row Label Right */}
              <span className="w-4 text-[10px] text-gray-700 font-bold text-right">
                {row}
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Legend />
        </motion.div>

        <div className="mt-12 mb-8 text-center px-4">
          <p className="text-white-900 text-[10px] leading-relaxed max-w-xs mx-auto uppercase tracking-tighter opacity-50">
            Terms & Conditions apply. Seat reservation is valid for 10 minutes.
          </p>
        </div>
      </main>

      <Footer
        selectedSeats={selectedLabels}
        totalPrice={totalPrice}
        onContinue={validateOrphans}
      />

      <ErrorModal
        isOpen={isErrorOpen}
        onClose={() => setIsErrorOpen(false)}
        title="Booking Restriction"
        message="Leaving a single empty seat between selected seats is not allowed. Please select contiguous seats to optimize space."
      />
    </motion.div>
  );
}
