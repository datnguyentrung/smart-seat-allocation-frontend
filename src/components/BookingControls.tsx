import { Info, RotateCcw } from "lucide-react";
import React from "react";
import styles from "./BookingControls.module.scss";

interface BookingControlsProps {
  onReset?: () => void;
  onTicketCountChange?: (count: number) => void;
  onAdjacentSeatsChange?: (count: number) => void;
  ticketCount?: number;
  adjacentSeats?: number;
}

export const BookingControls: React.FC<BookingControlsProps> = ({
  onReset,
  onTicketCountChange,
  onAdjacentSeatsChange,
  ticketCount = 0,
  adjacentSeats = 1,
}) => {
  const handleTicketCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    onTicketCountChange?.(value);
  };

  const handleAdjacentSeatsChange = (count: number) => {
    onAdjacentSeatsChange?.(count);
  };

  const handleReset = () => {
    onReset?.();
  };

  return (
    <div className={styles.controls}>
      {/* Header Row */}
      <div className={styles.header}>
        <h1>Chọn ghế</h1>
        <button onClick={handleReset} className={styles["reset-button"]}>
          <RotateCcw className="w-4 h-4" />
          Đặt lại
        </button>
      </div>

      {/* Ticket Count Selection */}
      <div className={styles.section}>
        <label htmlFor="ticketCount" className={styles.label}>
          Số lượng vé
        </label>
        <select
          id="ticketCount"
          value={ticketCount}
          onChange={handleTicketCountChange}
          className={styles.select}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {/* Adjacent Seats Selection */}
      <div className={styles.section}>
        <div className={styles["adjacent-section"]}>
          <div className={styles["adjacent-header"]}>
            <label className={styles.label}>Chọn ghế liền nhau</label>
            <div className={styles["info-icon-wrapper"]}>
              <Info className={styles["info-icon"]} />
              <div className={styles.tooltip}>
                Chọn số lượng ghế liền nhau bạn muốn đặt
              </div>
            </div>
          </div>
          <span className={styles["adjacent-description"]}>
            Có thể chọn tối đa 8 người.(Max:8)
          </span>
        </div>

        {/* Button Group */}
        <div className={styles["button-group"]}>
          {[1, 2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => handleAdjacentSeatsChange(count)}
              disabled={ticketCount === 0}
              className={`${styles["adjacent-button"]} ${adjacentSeats === count ? styles.active : ""}`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
