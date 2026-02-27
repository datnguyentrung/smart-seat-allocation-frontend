import type {
  ConnectionStatus,
  WebSocketMessage,
} from "@/services/WebSocketService";
import { webSocketService } from "@/services/WebSocketService";
import type { SeatResponse, SeatState } from "@/types/types";
import { useCallback, useEffect, useState } from "react";

interface UseShowtimeWebSocketProps {
  showtimeId: string;
  enabled?: boolean;
  onSeatUpdate?: (seatId: number, newState: string) => void;
  onSeatsUpdate?: (seatIds: number[]) => void;
}

interface UseShowtimeWebSocketReturn {
  status: ConnectionStatus;
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  reconnect: () => void;
}

/**
 * Custom hook for WebSocket connection to showtime seat updates
 * @param showtimeId - The showtime ID to connect to
 * @param enabled - Whether to enable the connection (default: true)
 * @param onSeatUpdate - Callback when a single seat is updated
 * @param onSeatsUpdate - Callback when multiple seats are updated
 */
export function useShowtimeWebSocket({
  showtimeId,
  enabled = true,
  onSeatUpdate,
  onSeatsUpdate,
}: UseShowtimeWebSocketProps): UseShowtimeWebSocketReturn {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      setLastMessage(message);

      switch (message.type) {
        case "SEAT_UPDATED":
          // Single seat update
          if (message.data?.seatId && message.data?.seatState) {
            console.log(
              `🔄 Seat updated: ${message.data.seatId} -> ${message.data.seatState}`,
            );
            onSeatUpdate?.(message.data.seatId, message.data.seatState);
          }
          break;

        case "SEATS_UPDATED":
          // Multiple seats update
          if (message.data?.seatIds && Array.isArray(message.data.seatIds)) {
            console.log(`🔄 Seats updated:`, message.data.seatIds);
            onSeatsUpdate?.(message.data.seatIds);
          }
          break;

        case "BOOKING_CREATED":
          // Handle booking creation event
          if (message.data?.seatIds && Array.isArray(message.data.seatIds)) {
            console.log(`🎫 Booking created for seats:`, message.data.seatIds);
            onSeatsUpdate?.(message.data.seatIds);
          }
          break;

        case "CONNECTION_ACK":
          console.log("✅ Connection acknowledged by server");
          break;

        default:
          console.log("📩 Unknown message type:", message.type);
      }
    },
    [onSeatUpdate, onSeatsUpdate],
  );

  // Handle connection status changes
  const handleStatusChange = useCallback((newStatus: ConnectionStatus) => {
    console.log(`🔌 WebSocket status changed: ${newStatus}`);
    setStatus(newStatus);
  }, []);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    console.log("🔄 Manual reconnect triggered");
    webSocketService.disconnect();
    if (enabled && showtimeId) {
      webSocketService.connect(showtimeId);
    }
  }, [enabled, showtimeId]);

  // ==========================================
  // Effect 1: Xử lý KẾT NỐI (Chỉ chạy khi đổi showtimeId)
  // ==========================================
  useEffect(() => {
    if (!enabled || !showtimeId) {
      return;
    }

    console.log(`🔌 Setting up WebSocket for showtime: ${showtimeId}`);
    webSocketService.connect(showtimeId);

    // Cleanup on unmount or showtime change
    return () => {
      console.log("🧹 Cleaning up WebSocket connection");
      webSocketService.disconnect();
    };
  }, [enabled, showtimeId]); // <-- Tuyệt đối không để handleMessage ở đây

  // ==========================================
  // Effect 2: Xử lý LẮNG NGHE SỰ KIỆN (Chạy lại khi handler thay đổi)
  // ==========================================
  useEffect(() => {
    if (!enabled || !showtimeId) return;

    // Subscribe to messages and status
    const unsubscribeMessage = webSocketService.onMessage(handleMessage);
    const unsubscribeStatus =
      webSocketService.onStatusChange(handleStatusChange);

    return () => {
      unsubscribeMessage();
      unsubscribeStatus();
    };
  }, [enabled, showtimeId, handleMessage, handleStatusChange]);

  return {
    status,
    isConnected: status === "connected",
    lastMessage,
    reconnect,
  };
}

/**
 * Helper function to create seat update handler
 */
export function createSeatUpdateHandler(
  setSeats: React.Dispatch<React.SetStateAction<SeatResponse[]>>,
) {
  return (seatId: number, newState: string) => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) =>
        seat.seatId === seatId
          ? { ...seat, seatState: newState as SeatState }
          : seat,
      ),
    );
  };
}

/**
 * Helper function to create seats update handler
 */
export function createSeatsUpdateHandler(
  setSeats: React.Dispatch<React.SetStateAction<SeatResponse[]>>,
) {
  return (seatIds: number[]) => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) =>
        seatIds.includes(seat.seatId)
          ? { ...seat, seatState: "BOOKED" as SeatState }
          : seat,
      ),
    );
  };
}
