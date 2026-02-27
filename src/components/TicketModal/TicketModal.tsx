import type { SeatResponse, TicketResponse } from "@/types/types";
import { Check, Clock, MapPin, X } from "lucide-react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import styles from "./TicketModal.module.scss";

interface TicketModalProps {
  ticket: TicketResponse;
  seat: SeatResponse | null;
  movieTitle: string;
  showtime: string;
  cinemaName: string;
  currentIndex: number;
  totalTickets: number;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function TicketModal({
  ticket,
  seat,
  movieTitle,
  showtime,
  cinemaName,
  currentIndex,
  totalTickets,
  onClose,
  onNext,
  onPrevious,
}: TicketModalProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      HOLD: { label: "Đang giữ", color: "#fbbf24" },
      PAID: { label: "Đã thanh toán", color: "#10b981" },
      USED: { label: "Đã sử dụng", color: "#6b7280" },
      CANCELLED: { label: "Đã hủy", color: "#ef4444" },
    };
    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        color: "#9ca3af",
      }
    );
  };

  const statusInfo = getStatusBadge(ticket.status);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.overlay}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.successIcon}>
              <Check size={24} />
            </div>
            <h2>Đặt vé thành công!</h2>
            <p className={styles.ticketCounter}>
              Vé {currentIndex + 1}/{totalTickets}
            </p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Ticket Content */}
        <div className={styles.content}>
          {/* Movie Info */}
          <div className={styles.movieInfo}>
            <h3>{movieTitle}</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <MapPin size={16} />
                <span>{cinemaName}</span>
              </div>
              <div className={styles.infoItem}>
                <Clock size={16} />
                <span>{showtime}</span>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className={styles.ticketDetails}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Mã vé:</span>
              <span className={styles.value}>{ticket.ticketCode}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Ghế:</span>
              <span className={styles.value}>
                {seat ? `${seat.rowLabel}${seat.seatNumber}` : "N/A"}
                {seat && seat.seatType !== "STANDARD" && (
                  <span className={styles.seatType}> ({seat.seatType})</span>
                )}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Giá vé:</span>
              <span className={styles.value}>{formatPrice(ticket.price)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Ngày đặt:</span>
              <span className={styles.value}>
                {new Date(ticket.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Trạng thái:</span>
              <span
                className={styles.statusBadge}
                style={{ backgroundColor: statusInfo.color }}
              >
                {statusInfo.label}
              </span>
            </div>
          </div>

          {/* QR Code */}
          <div className={styles.qrSection}>
            <div className={styles.qrCode}>
              <QRCodeSVG
                value={ticket.ticketCode}
                size={180}
                level="H"
                includeMargin
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <p className={styles.qrNote}>Quét mã QR này tại cổng vào rạp</p>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {totalTickets > 1 ? (
            <>
              <button
                className={styles.secondaryButton}
                onClick={onPrevious}
                disabled={currentIndex === 0}
              >
                ← Vé trước
              </button>
              <button className={styles.tertiaryButton} onClick={onClose}>
                Đóng
              </button>
              <button
                className={styles.primaryButton}
                onClick={onNext}
                disabled={currentIndex === totalTickets - 1}
              >
                Vé sau →
              </button>
            </>
          ) : (
            <button className={styles.primaryButton} onClick={onClose}>
              Hoàn tất
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
