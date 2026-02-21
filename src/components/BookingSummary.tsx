import {
  Calendar,
  ChevronLeft,
  Clock,
  CreditCard,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { motion } from "motion/react";
import React, { useState } from "react";
import { formatDateDMY, formatTimeHM } from "../utils/format";
import styles from "./BookingSummary.module.scss";

interface BookingSummaryProps {
  movieTitle: string;
  selectedSeats: string[];
  seatPrice: number;
  onBack: () => void;
  onConfirm: () => void;
}

interface SnackItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

const SNACKS: SnackItem[] = [
  {
    id: "1",
    name: "Combo Solo",
    price: 85000,
    image:
      "https://images.unsplash.com/photo-1751823886813-0cfc86cb9478?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWElMjBwb3Bjb3JuJTIwY29tYm98ZW58MXx8fHwxNzcxNjQzMjEyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "1 Popcorn (M) + 1 Coke (M)",
  },
  {
    id: "2",
    name: "Combo Couple",
    price: 120000,
    image:
      "https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&q=80&w=1080",
    description: "1 Popcorn (L) + 2 Coke (M)",
  },
  {
    id: "3",
    name: "Family Pack",
    price: 180000,
    image:
      "https://images.unsplash.com/photo-1572177191856-3cde618dee1f?auto=format&fit=crop&q=80&w=1080",
    description: "2 Popcorn (L) + 4 Coke (M)",
  },
  {
    id: "4",
    name: "Nachos Special",
    price: 95000,
    image:
      "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=1080",
    description: "Nachos with Cheese + 1 Coke (L)",
  },
];

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  movieTitle,
  selectedSeats,
  seatPrice,
  onBack,
  onConfirm,
}) => {
  const [cart, setCart] = useState<Record<string, number>>({});

  const updateCart = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const snacksTotal = SNACKS.reduce(
    (sum, item) => sum + item.price * (cart[item.id] || 0),
    0,
  );
  const total = seatPrice + snacksTotal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={styles.container}
    >
      {/* Header */}
      <div className={styles.header}>
        <button onClick={onBack} className={styles["back-button"]}>
          <ChevronLeft />
        </button>
        <h2>Booking Summary</h2>
      </div>

      <div className={styles.content}>
        {/* Movie Info Card */}
        <div className={styles["movie-card"]}>
          <div className={styles["movie-header"]}>
            <div className={styles["movie-info"]}>
              <h3>{movieTitle}</h3>
              <p className={styles["cinema-name"]}>
                CGV Aeon Ha Dong • Room 01
              </p>
            </div>
            <div className={styles.badge}>IMAX 3D</div>
          </div>

          <div className={styles["movie-details"]}>
            <div className={styles["detail-item"]}>
              <Calendar />
              <span>{formatDateDMY(new Date())}</span>
            </div>
            <div className={styles["detail-item"]}>
              <Clock />
              <span>Lượt chiếu: {formatTimeHM(new Date())}</span>
            </div>
          </div>

          <div className={styles["seats-summary"]}>
            <div className={styles["seats-section"]}>
              <span className={styles["section-label"]}>Seats</span>
              <div className={styles["seats-list"]}>
                {selectedSeats.map((seat) => (
                  <span key={seat} className={styles["seat-tag"]}>
                    {seat}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles["price-section"]}>
              <span className={styles["section-label"]}>Tickets</span>
              <span className={styles.price}>
                {seatPrice.toLocaleString()} VND
              </span>
            </div>
          </div>
        </div>

        {/* Snacks Section */}
        <div className={styles["snacks-section"]}>
          <div className={styles["section-header"]}>
            <h3>
              <ShoppingBag />
              Snacks & Drinks
            </h3>
            <span className={styles["optional-badge"]}>Optional</span>
          </div>

          <div className={styles["snacks-list"]}>
            {SNACKS.map((snack) => {
              const qty = cart[snack.id] || 0;
              return (
                <div key={snack.id} className={styles["snack-item"]}>
                  <img
                    src={snack.image}
                    alt={snack.name}
                    className={styles["snack-image"]}
                  />
                  <div className={styles["snack-details"]}>
                    <div className={styles["snack-info"]}>
                      <h4>{snack.name}</h4>
                      <p>{snack.description}</p>
                    </div>
                    <div className={styles["snack-actions"]}>
                      <span className={styles["snack-price"]}>
                        {snack.price.toLocaleString()} ₫
                      </span>

                      <div className={styles["quantity-controls"]}>
                        <button
                          onClick={() => updateCart(snack.id, -1)}
                          className={styles.decrease}
                          disabled={qty === 0}
                        >
                          <Minus />
                        </button>
                        <span className={styles.quantity}>{qty}</span>
                        <button
                          onClick={() => updateCart(snack.id, 1)}
                          className={styles.increase}
                        >
                          <Plus />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods (Visual Only) */}
        <div className={styles["payment-section"]}>
          <h3>
            <CreditCard />
            Payment Method
          </h3>
          <div className={styles["payment-methods"]}>
            <button
              className={`${styles["payment-button"]} ${styles.selected}`}
            >
              <div className={styles["payment-icon"]}>MOMO</div>
              <span className={styles["payment-label"]}>MoMo Wallet</span>
            </button>
            <button
              className={`${styles["payment-button"]} ${styles.disabled}`}
            >
              <div className={styles["payment-icon"]}>VISA</div>
              <span className={styles["payment-label"]}>Credit Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className={styles["action-bar"]}>
        <div className={styles["action-content"]}>
          <div className={styles["total-section"]}>
            <p className={styles.label}>Total Amount</p>
            <div className={styles["total-amount"]}>
              <span className={styles.amount}>{total.toLocaleString()}</span>
              <span className={styles.currency}>VND</span>
            </div>
          </div>

          <button onClick={onConfirm} className={styles["confirm-button"]}>
            Pay Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};
