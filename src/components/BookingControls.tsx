import { findAndFlattenSuperSets } from "@/utils/findAndFlattenSuperSets";
import { Info, RotateCcw } from "lucide-react";
import React from "react";
import styles from "./BookingControls.module.scss";

const bookinkTicketOptions: Record<number, number[][]> = {
  0: [],
  1: [[1]],
  2: [[2]],
  3: [[3]],
  4: [[4], [2, 2]],
  5: [[2, 3]],
  6: [
    [2, 4],
    [3, 3],
  ],
  7: [
    [2, 2, 3],
    [3, 4],
  ],
  8: [
    [4, 4],
    [2, 2, 4],
    [2, 2, 2, 2],
    [2, 3, 3],
  ],
};

interface BookingControlsProps {
  onReset?: () => void;
  onTicketCountChange?: (count: number) => void;
  onAdjacentSeatsChange?: (count: number) => void;
  onSelectedAdjacentOption: (option: number[]) => void;
  ticketCount?: number;
  adjacentSeats?: number;
  selectedAdjacentOption: number[];
  listAdjacentOptions: number[];
}

export const BookingControls: React.FC<BookingControlsProps> = ({
  onReset,
  onTicketCountChange,
  onAdjacentSeatsChange,
  onSelectedAdjacentOption,
  ticketCount,
  adjacentSeats,
  selectedAdjacentOption,
  listAdjacentOptions,
}) => {
  React.useEffect(() => {
    // Lấy các options dựa trên số lượng vé đã chọn
    const options: number[][] = bookinkTicketOptions[ticketCount || 0] || [];

    // Tìm và làm phẳng các superset thỏa mãn selectedAdjacentOption
    const optionAble = findAndFlattenSuperSets(
      options,
      selectedAdjacentOption,
    ).sort((a, b) => a - b);

    onAdjacentSeatsChange?.(optionAble[0]); // Cập nhật adjacentSeats dựa trên optionAble đầu tiên (nếu có)
    onSelectedAdjacentOption(optionAble);
  }, [
    ticketCount,
    selectedAdjacentOption,
    onAdjacentSeatsChange,
    onSelectedAdjacentOption,
  ]);

  // console.log("listAdjacentOptions", listAdjacentOptions);

  const handleTicketCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value);
    onTicketCountChange?.(value);
    onReset?.(); // Reset khi số lượng vé thay đổi
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
              className={`${styles["adjacent-button"]}
              ${
                count === adjacentSeats
                  ? styles.active
                  : listAdjacentOptions.includes(count)
                    ? styles.available
                    : styles.disabled
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
