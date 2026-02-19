import type { SeatResponse, ShowTimeWithSeatsResponse } from "@/types/types";
import { findOptimalSeats } from "@/utils/findOptimalSeats";
import React from "react";
import { Screen } from "./Screen";
import { Seat } from "./Seat";
import styles from "./SeatingChart.module.scss";

interface SeatingChartProps {
  showtimeDetails: ShowTimeWithSeatsResponse;
  seats: SeatResponse[];
  seatMatrix: number[][];
  ticketCount: number;
  handleNotify: () => void;
  handleSeatClick: (id: number[]) => void;
  adjacentSeats: number;
}

export function SeatingChart({
  showtimeDetails,
  seats,
  seatMatrix,
  ticketCount,
  handleNotify,
  handleSeatClick,
  adjacentSeats,
}: SeatingChartProps) {
  const [suggestedSeats, setSuggestedSeats] = React.useState<
    { x: number; y: number }[]
  >([]);

  const handleMouseEnter = (hoveredSeatX: number, hoveredSeatY: number) => {
    // Ví dụ: Khi hover vào ghế, tìm vị trí của nó trong ma trận và gọi findOptimalSeats
    const seatSuggestions = findOptimalSeats(
      seatMatrix, // Ma trận ghế đã được xây dựng từ dữ liệu
      adjacentSeats, // Số lượng ghế cần đặt
      hoveredSeatX, // Vị trí cột của ghế đang hover
      hoveredSeatY, // Vị trí hàng của ghế đang hover
    );
    console.log("Suggested seats based on hover:", seatSuggestions);
    setSuggestedSeats(seatSuggestions);
  };

  console.log("Hovered seat suggestions:", suggestedSeats);

  const handChooseSeatSuggested = () => {
    if (suggestedSeats.length > 0) {
      // Chuyển đổi suggestedSeats (x, y) thành seatId để gọi handleSeatClick
      const seatIdsToSelect = suggestedSeats
        .map((pos) => {
          const seat = seats.find(
            (s) => s.gridCol - 1 === pos.x && s.gridRow - 1 === pos.y,
          );
          return seat ? seat.seatId : null;
        })
        .filter((id): id is number => id !== null); // Lọc ra các id hợp lệ

      console.log("Seat IDs to select based on suggestions:", seatIdsToSelect);
      handleSeatClick(seatIdsToSelect);
    }
  };

  return (
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
                onMouseEnter={() =>
                  handleMouseEnter(seat.gridCol - 1, seat.gridRow - 1)
                }
              >
                <Seat
                  id={seat.seatId}
                  type={seat.seatType}
                  state={seat.seatState}
                  label={seat.rowLabel + seat.seatNumber}
                  onClick={
                    ticketCount < 1 ? handleNotify : handChooseSeatSuggested
                  }
                  suggested={suggestedSeats.some(
                    (s) => s.x === seat.gridCol - 1 && s.y === seat.gridRow - 1,
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
