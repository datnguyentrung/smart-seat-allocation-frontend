/* eslint-disable react-hooks/preserve-manual-memoization */
import { SeatAPI } from "@/apis/catalog/SeatAPI";
import { ShowtimeAPI } from "@/apis/ticketing/ShowtimeAPI";
import type {
  SeatResponse,
  SeatState,
  SeatType,
  ShowTimeWithSeatsResponse,
} from "@/types/types";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import styles from "./App.module.scss";
import { BookingControls } from "./components/BookingControls";
import { ErrorModal } from "./components/ErrorModal";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Legend } from "./components/Legend";
import { SeatingChart } from "./components/SeatingChart";

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
  const [seatMatrix, setSeatMatrix] = useState<number[][]>([]);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [selectedAdjacentOption, setSelectedAdjacentOption] = useState<
    number[]
  >([]);
  const [listAdjacentOptions, setListAdjacentOptions] = useState<number[]>([]);

  // TicketCount dùng để theo dõi số lượng vé được chọn
  const [ticketCount, setTicketCount] = useState(0);

  // AdjacentSeats dùng để theo dõi số lượng ghế liền nhau được chọn
  const [adjacentSeats, setAdjacentSeats] = useState(0);

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

        const matrix: number[][] = [];
        for (let i = 0; i < currentShowtimeData.roomResponse.totalRows; i++) {
          matrix[i] = new Array(
            currentShowtimeData.roomResponse.totalCols,
          ).fill(0); // Mặc định tất cả ghế đều trống (1)
        }

        if (seatData) {
          seatData.forEach((seat) => {
            // LƯU Ý: Dùng currentShowtimeData thay vì state showtimeDetails
            const isBooked = currentShowtimeData.selectedSeats.some(
              (s) => s.seatId === seat.seatId,
            );
            if (isBooked) {
              seat.seatState = "BOOKED" as SeatState;
            }

            // Xác định vị trí trong ma trận dựa trên gridRow và gridCol
            const rowIndex = seat.gridRow - 1; // Giả sử gridRow bắt đầu từ 1
            const colIndex = seat.gridCol - 1; // Giả sử gridCol bắt đầu từ 1

            // Khởi tạo hàng nếu chưa tồn tại
            if (!matrix[rowIndex]) {
              matrix[rowIndex] = [];
            }
            matrix[rowIndex][colIndex] = seat.seatState === "BOOKED" ? 0 : 1;
          });

          setSeatMatrix(matrix); // Cập nhật ma trận vào state
          setSeats(seatData); // Cập nhật danh sách ghế vào state để render UI
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // console.log("Rendered seats:", seats);
  // console.log("Showtime details:", showtimeDetails);
  // console.log("Seat matrix:", seatMatrix);

  const handleSeatClick = (id: number[]) => {
    // Kiểm tra xem ghế đang được chọn hay bỏ chọn
    const isReleasing = seats.some(
      (seat) => id.includes(seat.seatId) && seat.seatState === "SELECTED",
    );

    setSeats((prev) =>
      prev.map((seat) => {
        if (id.includes(seat.seatId) && seat.seatState !== "BOOKED") {
          return {
            ...seat,
            seatState: seat.seatState === "SELECTED" ? "AVAILABLE" : "SELECTED",
          };
        }
        return seat;
      }),
    );

    if (isReleasing) {
      // Trường hợp release ghế: xóa số lượng ghế khỏi selectedAdjacentOption
      setSelectedAdjacentOption((prev) => {
        const newOptions = [...prev];
        const indexToRemove = newOptions.indexOf(id.length);
        if (indexToRemove > -1) {
          newOptions.splice(indexToRemove, 1);
        }
        return newOptions;
      });
    } else {
      // Trường hợp chọn ghế: thêm số lượng ghế vào selectedAdjacentOption
      setSelectedAdjacentOption([
        ...selectedAdjacentOption,
        ...(id.length > 0 ? [id.length] : []),
      ]);
    }
  };

  const handleNotify = () => {
    alert("Vui lòng chọn số ghế cần mua trước khi tiếp tục.");
    return;
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
            <BookingControls
              onReset={handleReset}
              onTicketCountChange={setTicketCount}
              onAdjacentSeatsChange={setAdjacentSeats}
              onSelectedAdjacentOption={setListAdjacentOptions}
              ticketCount={ticketCount}
              adjacentSeats={adjacentSeats}
              selectedAdjacentOption={selectedAdjacentOption}
              listAdjacentOptions={listAdjacentOptions}
            />
          </div>

          {/* Screen and Seats - Right Side */}
          <SeatingChart
            showtimeDetails={showtimeDetails}
            seats={seats}
            seatMatrix={seatMatrix}
            ticketCount={ticketCount}
            handleNotify={handleNotify}
            handleSeatClick={handleSeatClick}
            adjacentSeats={adjacentSeats}
            listAdjacentOptions={listAdjacentOptions}
          />
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
