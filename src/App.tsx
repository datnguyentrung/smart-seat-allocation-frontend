/* eslint-disable react-hooks/preserve-manual-memoization */
import { ShowtimeAPI } from "@/apis/ticketing/ShowtimeAPI";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { SeatAPI } from "./apis/catalog/SeatAPI";
import { BookingControls } from "./components/BookingControls";
import { ErrorModal } from "./components/ErrorModal";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Legend } from "./components/Legend";
import { Screen } from "./components/Screen";
import { Seat } from "./components/Seat";
import type {
  SeatResponse,
  SeatState,
  SeatType,
  ShowTimeWithSeatsResponse,
} from "./types/types";

const showtimeId = "e0000000-0000-0000-0000-000000000001";

const SEAT_PRICES: Record<SeatType, number> = {
  STANDARD: 80000,
  VIP: 120000,
  COUPLE: 200000,
};

export default function App() {
  const [seats, setSeats] = useState<SeatResponse[]>([]);
  const [showtimeDetails, setShowtimeDetails] =
    useState<ShowTimeWithSeatsResponse>(null!);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);
  const [adjacentSeatsCount, setAdjacentSeatsCount] = useState(1);

  const handleReset = () => {
    setSeats((prev) =>
      prev.map((seat) => ({
        ...seat,
        seatState: seat.seatState === "SELECTED" ? "AVAILABLE" : seat.seatState,
      })),
    );
    setTicketCount(0);
    setAdjacentSeatsCount(1);
  };

  useEffect(() => {
    // Chỉ chạy khi showtimeId thay đổi
    if (!showtimeId) return;

    ShowtimeAPI.getShowtimeWithSeats(showtimeId)
      .then((data: ShowTimeWithSeatsResponse) => {
        if (data) {
          setShowtimeDetails(data); // Cập nhật state (để render UI)

          // Trả về cả seatPromise VÀ data hiện tại để dùng ở bước sau
          return Promise.all([
            SeatAPI.getSeatsByRoomId(data.roomResponse.roomId),
            data, // Chuyền data xuống bước tiếp theo
          ]);
        }
        return Promise.reject("No showtime data");
      })
      .then(([seatData, currentShowtimeData]) => {
        // Nhận seatData và currentShowtimeData (chính là biến data ở trên)

        if (seatData) {
          seatData.forEach((seat) => {
            // LƯU Ý: Dùng currentShowtimeData thay vì state showtimeDetails
            const isBooked = currentShowtimeData.selectedSeats.some(
              (s) => s.seatId === seat.seatId,
            );
            if (isBooked) {
              seat.seatState = "BOOKED" as SeatState;
            }
          });

          setSeats(seatData);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [showtimeId]); // ✅ QUAN TRỌNG: Chỉ phụ thuộc vào showtimeId

  console.log("Rendered seats:", seats);
  console.log("Showtime details:", showtimeDetails);

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
    // Get unique row labels from seats data
    const uniqueRows = [...new Set(seats.map((s) => s.rowLabel))];

    uniqueRows.forEach((row) => {
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

      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 overflow-x-hidden">
        {/* Flex Container for BookingControls and Screen+Seats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col lg:flex-row gap-6 items-start mb-8"
        >
          {/* BookingControls - Left Side */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <BookingControls
              onReset={handleReset}
              onTicketCountChange={setTicketCount}
              onAdjacentSeatsChange={setAdjacentSeatsCount}
            />
          </div>

          {/* Screen and Seats - Right Side */}
          <div className="w-full lg:flex-1 flex flex-col items-center">
            <div className="w-full mb-6">
              <Screen />
            </div>

            {/* Seat Map Container */}
            {showtimeDetails && (
              <div className="w-full flex justify-center">
                <div
                  className="grid gap-1.5 sm:gap-2 justify-items-center items-center w-fit"
                  style={{
                    gridTemplateRows: `repeat(${showtimeDetails.roomResponse.totalRows}, minmax(0, 1fr))`,
                    gridTemplateColumns: `repeat(${showtimeDetails.roomResponse.totalCols}, minmax(0, 1fr))`,
                  }}
                >
                  {seats.map((seat) => (
                    <div
                      key={seat.seatId}
                      className={
                        seat.seatType === "COUPLE" ? "justify-self-start" : ""
                      }
                      style={{
                        gridRow: seat.gridRow,
                        gridColumn:
                          seat.seatType === "COUPLE"
                            ? `${seat.gridCol} / span 2`
                            : seat.gridCol,
                      }}
                    >
                      <Seat
                        id={seat.seatId}
                        type={seat.seatType}
                        state={seat.seatState}
                        label={seat.rowLabel + seat.seatNumber}
                        onClick={handleSeatClick}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

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
