import { AlertTriangle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";
import styles from "./ErrorModal.module.scss";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={styles["modal-overlay"]}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={styles.modal}
          >
            <div className={styles.header}>
              <div className={styles["icon-wrapper"]}>
                <AlertTriangle />
              </div>
              <div className={styles.content}>
                <h2>{title}</h2>
                <p>{message}</p>
              </div>
            </div>

            <div className={styles.footer}>
              <button
                onClick={onClose}
                className={`${styles.button} ${styles.primary}`}
              >
                Understood
              </button>
            </div>

            <button
              onClick={onClose}
              className={`${styles.button} ${styles.close}`}
              style={{ position: "absolute", top: "1rem", right: "1rem" }}
            >
              <X size={20} />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
