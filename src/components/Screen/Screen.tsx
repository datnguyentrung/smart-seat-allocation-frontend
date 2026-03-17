import React from "react";
import styles from "./Screen.module.scss";

export const Screen: React.FC = () => {
  return (
    <div className={styles["screen-container"]}>
      <div className={styles.screen} />
      <div className={styles.label}>Screen</div>
      <div className={styles.glow} />
    </div>
  );
};
