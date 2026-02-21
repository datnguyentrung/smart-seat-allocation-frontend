import { SeatAPI } from "@/apis/catalog/SeatAPI";
import { ShowtimeAPI } from "@/apis/ticketing/ShowtimeAPI";
import type {
  SeatResponse,
  SeatState,
  SeatType,
  ShowTimeWithSeatsResponse,
} from "@/types/types";
import { findOptimalSeats } from "@/utils/findOptimalSeats";
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
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [selectedAdjacentOption, setSelectedAdjacentOption] = useState<
    number[]
  >([]);
  const [listAdjacentOptions, setListAdjacentOptions] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TicketCount dùng để theo dõi số lượng vé được chọn
  const [ticketCount, setTicketCount] = useState(0);

  // AdjacentSeats = tổng số đơn vị ghế cần chọn
  // (CHÚ Ý: COUPLE = 2 đơn vị, STANDARD = 1 đơn vị)
  const [adjacentSeats, setAdjacentSeats] = useState(0);

  const handleReset = () => {
    // Reset trạng thái ghế
    setSeats((prev) =>
      prev.map((seat) => ({
        ...seat,
        seatState: seat.seatState === "SELECTED" ? "AVAILABLE" : seat.seatState,
      })),
    );

    // Reset tất cả các state liên quan
    setSelectedAdjacentOption([]);
    setListAdjacentOptions([]);
    setAdjacentSeats(0);
  };

  useEffect(() => {
    // Chỉ chạy khi showtimeId thay đổi
    if (!showtimeId) return;

    // console.log("Fetching showtime data for ID:", showtimeId);

    ShowtimeAPI.getShowtimeWithSeats(showtimeId)
      .then((data: ShowTimeWithSeatsResponse) => {
        // console.log("Showtime data received:", data);
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
        // console.log("Seat data received:", seatData);

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

          setSeats(seatData); // Cập nhật danh sách ghế vào state để render UI
          setIsLoading(false); // Data đã load xong
          // console.log("Data loaded successfully!");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, []);

  // Tính toán seatMatrix từ seats state (useMemo)
  // CHÚ Ý: Matrix này dùng cho thuật toán findOptimalSeats, chỉ quan tâm BOOKED
  // UNAVAILABLE là UI state tạm thời, không ảnh hưởng đến logic tìm ghế
  const seatMatrix = useMemo(() => {
    if (!showtimeDetails || seats.length === 0) return [];

    const matrix: number[][] = [];
    for (let i = 0; i < showtimeDetails.roomResponse.totalRows; i++) {
      matrix[i] = new Array(showtimeDetails.roomResponse.totalCols).fill(0);
    }

    seats.forEach((seat) => {
      const rowIndex = seat.gridRow - 1;
      const colIndex = seat.gridCol - 1;

      // 0 = ghế đã đặt hoặc không tồn tại (BOOKED)
      // 1 = ghế có thể đặt (AVAILABLE, SELECTED, hoặc chưa có state)
      // 2 = ghế COUPLE (chiếm 2 vị trí, tính là 2 vé)
      // KHÔNG tính UNAVAILABLE vào đây vì nó chỉ là UI state
      if (!matrix[rowIndex]) {
        matrix[rowIndex] = [];
      }

      if (seat.seatType === "COUPLE") {
        // Ghế COUPLE: đánh dấu giá trị 2 để thuật toán biết đây là ghế đôi
        // Chỉ đánh dấu ở vị trí đầu tiên (colIndex), vị trí thứ 2 sẽ bị skip
        if (seat.seatState === "BOOKED") {
          matrix[rowIndex][colIndex] = 0;
          // Đánh dấu cả ô thứ 2 của couple seat
          if (colIndex + 1 < matrix[rowIndex].length) {
            matrix[rowIndex][colIndex + 1] = 0;
          }
        } else {
          matrix[rowIndex][colIndex] = 2; // 2 = COUPLE seat available
          // Ô thứ 2 cũng cần đánh dấu (có thể dùng -1 để biết đây là phần 2 của COUPLE)
          if (colIndex + 1 < matrix[rowIndex].length) {
            matrix[rowIndex][colIndex + 1] = -1; // -1 = phần thứ 2 của COUPLE, skip
          }
        }
      } else if (seat.seatState === "SELECTED") {
        matrix[rowIndex][colIndex] = 0; // Mark as unavailable in matrix
      } else {
        // Ghế thường: 0 = BOOKED, 1 = AVAILABLE
        matrix[rowIndex][colIndex] = seat.seatState === "BOOKED" ? 0 : 1;
      }
    });

    return matrix;
  }, [seats, showtimeDetails]);

  // Tính toán enhancedSeats với UNAVAILABLE state (useMemo)
  const enhancedSeats = useMemo(() => {
    if (!showtimeDetails || seatMatrix.length === 0 || seats.length === 0) {
      return seats;
    }

    // Nếu adjacentSeats = 0, trả về seats gốc (không cần tính UNAVAILABLE)
    if (adjacentSeats === 0) {
      return seats;
    }

    return seats.map((seat) => {
      // Không thay đổi ghế đã BOOKED hoặc SELECTED
      if (seat.seatState === "BOOKED" || seat.seatState === "SELECTED") {
        return seat;
      }

      // COUPLE seat đặc biệt: cần ít nhất 2 vé để đặt (vì COUPLE = 2 vé)
      if (seat.seatType === "COUPLE" && ticketCount !== 0 && ticketCount < 2) {
        return {
          ...seat,
          seatState: "UNAVAILABLE" as SeatState,
        };
      }

      try {
        // Kiểm tra xem ghế này có thể tạo ra suggestedSeats hợp lệ không
        const seatX = seat.gridCol - 1;
        const seatY = seat.gridRow - 1;

        const optimalSeats = findOptimalSeats(
          seatMatrix,
          adjacentSeats, // adjacentSeats = số đơn vị (COUPLE=2, STANDARD=1)
          seatX,
          seatY,
        );

        // Tính tổng số đơn vị từ optimalSeats
        let totalUnits = 0;
        optimalSeats.forEach((pos) => {
          const targetSeat = seats.find(
            (s) => s.gridCol - 1 === pos.x && s.gridRow - 1 === pos.y,
          );
          if (targetSeat) {
            totalUnits += targetSeat.seatType === "COUPLE" ? 2 : 1;
          }
        });

        // Debug log
        if (seat.seatType === "COUPLE" && adjacentSeats > 0) {
          console.log(`COUPLE Seat ${seat.rowLabel}${seat.seatNumber}:`, {
            seatX,
            seatY,
            matrixValue: seatMatrix[seatY]?.[seatX],
            adjacentSeats,
            ticketCount,
            optimalSeats,
            totalUnits,
            willBeAvailable: totalUnits >= adjacentSeats,
          });
        }

        // Nếu không tìm được đủ đơn vị thì mark là UNAVAILABLE
        if (
          ticketCount !== 0 &&
          (optimalSeats.length === 0 || totalUnits < adjacentSeats)
        ) {
          return {
            ...seat,
            seatState: "UNAVAILABLE" as SeatState,
          };
        }

        // Nếu có thể tạo suggestedSeats, giữ là AVAILABLE
        return {
          ...seat,
          seatState: "AVAILABLE" as SeatState,
        };
      } catch (error) {
        console.error("Error processing seat:", seat, error);
        // Nếu có lỗi, giữ seat ở trạng thái AVAILABLE
        return {
          ...seat,
          seatState: "AVAILABLE" as SeatState,
        };
      }
    });
  }, [seats, adjacentSeats, showtimeDetails, seatMatrix, ticketCount]);

  // console.log("Rendered seats:", seats);
  // console.log("Showtime details:", showtimeDetails);
  // console.log("Seat matrix:", seatMatrix);

  const handleSeatClick = (id: number[]) => {
    // Kiểm tra xem ghế đang được chọn hay bỏ chọn
    const isReleasing = seats.some(
      (seat) => id.includes(seat.seatId) && seat.seatState === "SELECTED",
    );

    // Tính tổng số vé (COUPLE = 2 vé, STANDARD/VIP = 1 vé)
    const selectedSeatsInfo = seats.filter((seat) => id.includes(seat.seatId));
    const totalTickets = selectedSeatsInfo.reduce((sum, seat) => {
      return sum + (seat.seatType === "COUPLE" ? 2 : 1);
    }, 0);

    setSeats((prev) =>
      prev.map((seat) => {
        if (
          id.includes(seat.seatId) &&
          seat.seatState !== "BOOKED" &&
          seat.seatState !== "UNAVAILABLE"
        ) {
          return {
            ...seat,
            seatState: seat.seatState === "SELECTED" ? "AVAILABLE" : "SELECTED",
          };
        }
        return seat;
      }),
    );

    if (isReleasing) {
      // Trường hợp release ghế: xóa số lượng vé khỏi selectedAdjacentOption
      setSelectedAdjacentOption((prev) => {
        const newOptions = [...prev];
        const indexToRemove = newOptions.indexOf(totalTickets);
        if (indexToRemove > -1) {
          newOptions.splice(indexToRemove, 1);
        }
        return newOptions;
      });
    } else {
      // Trường hợp chọn ghế: thêm số lượng vé vào selectedAdjacentOption
      setSelectedAdjacentOption([
        ...selectedAdjacentOption,
        ...(totalTickets > 0 ? [totalTickets] : []),
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
    () => enhancedSeats.filter((s) => s.seatState === "SELECTED"),
    [enhancedSeats],
  );

  const totalPrice = useMemo(
    () => selectedSeats.reduce((sum, s) => sum + SEAT_PRICES[s.seatType], 0),
    [selectedSeats],
  );

  const selectedLabels = selectedSeats.map((s) => s.rowLabel + s.seatNumber);

  // Hiển thị loading khi dữ liệu chưa sẵn sàng
  if (isLoading || !showtimeDetails || seats.length === 0) {
    return (
      <div
        className={styles.app}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center", color: "white" }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

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
            seats={enhancedSeats}
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
