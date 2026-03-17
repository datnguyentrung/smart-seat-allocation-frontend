import style from "./DateCarousel.module.scss";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface DateCarouselProps {
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
}

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTH_ABBR = [
  "Th1",
  "Th2",
  "Th3",
  "Th4",
  "Th5",
  "Th6",
  "Th7",
  "Th8",
  "Th9",
  "Th10",
  "Th11",
  "Th12",
];

function generateDatesAroundToday(): string[] {
  const dates: string[] = [];
  const center = new Date();
  center.setHours(0, 0, 0, 0);

  for (let i = 1; i <= 7; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export default function DateCarousel({
  selectedDate,
  onDateSelect,
}: DateCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dates = generateDatesAroundToday();

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: dir === "left" ? -240 : 240,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={style.carousel}>
      {/* Left arrow */}
      <button onClick={() => scroll("left")} className={style.arrowButton}>
        <ChevronLeft size={18} />
      </button>

      {/* Scrollable dates */}
      <div
        ref={scrollRef}
        className={style.dateScroller}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {dates.map((date) => {
          const d = new Date(date + "T00:00:00");
          const isSelected = date === selectedDate;
          const dayOfWeek = d.getDay();
          const dayLabel = DAY_LABELS[dayOfWeek];
          const dayNum = d.getDate();
          const monthLabel = MONTH_ABBR[d.getMonth()];
          const isToday = date === new Date().toISOString().slice(0, 10);

          return (
            <button
              key={date}
              onClick={() => onDateSelect(date)}
              className={`${style.dateButton} ${isSelected ? style.dateButtonSelected : style.dateButtonDefault}`}
            >
              <span
                className={`${style.dateDayLabel} ${isSelected ? style.dateDayLabelSelected : style.dateDayLabelDefault}`}
              >
                {dayLabel}
              </span>
              <span
                className={`${style.dateNumber} ${isSelected ? style.dateNumberSelected : ""}`}
              >
                {dayNum}
              </span>
              <span
                className={`${style.dateMonthLabel} ${isSelected ? style.dateMonthLabelSelected : style.dateMonthLabelDefault}`}
              >
                {monthLabel}
              </span>
              {isToday && !isSelected && <span className={style.todayDot} />}
            </button>
          );
        })}
      </div>

      {/* Right arrow */}
      <button onClick={() => scroll("right")} className={style.arrowButton}>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
