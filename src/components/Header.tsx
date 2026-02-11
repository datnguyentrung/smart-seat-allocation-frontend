import { ChevronLeft, Info } from "lucide-react";
import React from "react";
import styles from "./Header.module.scss";

interface HeaderProps {
  movieTitle: string;
  showTime: string;
  cinemaName: string;
}

export const Header: React.FC<HeaderProps> = ({
  movieTitle,
  showTime,
  cinemaName,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles["left-section"]}>
        <button className={styles["back-button"]}>
          <ChevronLeft size={24} />
        </button>
        <div className={styles.info}>
          <h1>{movieTitle}</h1>
          <div className={styles.meta}>
            <span>{showTime}</span>
            <span className={styles.dot} />
            <span>{cinemaName}</span>
          </div>
        </div>
      </div>
      <button className={styles["info-button"]}>
        <Info size={20} />
      </button>
    </header>
  );
};
