import React from "react";
import styles from "./Legend.module.scss";

export const Legend: React.FC = () => {
  const items = [
    { label: "Available", style: "available" },
    { label: "Booked", style: "booked" },
    { label: "Selected", style: "selected" },
    { label: "Unavailable", style: "unavailable" },
    { label: "VIP", style: "vip" },
    { label: "Couple", style: "couple" },
  ];

  return (
    <div className={styles.legend}>
      {items.map((item) => (
        <div key={item.label} className={styles.item}>
          <div className={`${styles.box} ${styles[item.style]}`} />
          <span className={styles.label}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
