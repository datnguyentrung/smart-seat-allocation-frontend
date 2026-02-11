/* eslint-disable react-hooks/preserve-manual-memoization */
import { ShowtimeAPI } from "@/apis/ticketing/ShowtimeAPI";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { SeatAPI } from "./apis/catalog/SeatAPI";
import styles from "./App.module.scss";
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
} from "@/types/types";

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

  const handleReset = () => {
    setSeats((prev) =>
      prev.map((seat) => ({
        ...seat,
        seatState: seat.seatState === "SELECTED" ? "AVAILABLE" : seat.seatState,
      })),
    );
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
  }, []);

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
      className={styles.app}
    >
      <Header
        movieTitle="Avatars: The Way of Water"
        showTime="19:30 - 22:30"
        cinemaName="CGV Aeon Ha Dong - Room 01"
      />

      <main className={styles.main}>
        {/* Flex Container for BookingControls and Screen+Seats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={styles.container}
        >
          {/* BookingControls - Left Side */}
          <div className={styles["controls-section"]}>
            <BookingControls onReset={handleReset} />
          </div>

          {/* Screen and Seats - Right Side */}
          <div className={styles["seats-section"]}>
            <div className={styles["screen-wrapper"]}>
              <Screen />
            </div>

            {/* Seat Map Container */}
            {showtimeDetails && (
              <div className={styles["seat-map-container"]}>
                <div
                  className={styles["seat-grid"]}
                  style={{
                    gridTemplateRows: `repeat(${showtimeDetails.roomResponse.totalRows}, minmax(0, 1fr))`,
                    gridTemplateColumns: `repeat(${showtimeDetails.roomResponse.totalCols}, minmax(0, 1fr))`,
                  }}
                >
                  {seats.map((seat) => (
                    <div
                      key={seat.seatId}
                      className={
                        seat.seatType === "COUPLE"
                          ? `${styles["seat-wrapper"]} ${styles.couple}`
                          : styles["seat-wrapper"]
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
          className={styles["legend-wrapper"]}
        >
          <Legend />
        </motion.div>

        <div className={styles.terms}>
          <p>
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
