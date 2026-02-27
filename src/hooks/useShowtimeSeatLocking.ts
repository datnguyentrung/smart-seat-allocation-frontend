/**
 * Custom Hook: useShowtimeSeatLocking
 * Xử lý kết nối WebSocket cho tính năng khóa ghế real-time
 *
 * Tính năng:
 * - Kết nối WebSocket tới Spring Boot backend (Raw WebSocket, không dùng STOMP)
 * - Tự động chuyển ws/wss dựa trên protocol (http/https)
 * - Quản lý danh sách ghế đang bị khóa bởi user khác
 * - Gửi lệnh LOCK/UNLOCK ghế khi user chọn/bỏ chọn
 * - Auto reconnect khi mất kết nối (3 giây)
 * - Cleanup khi component unmount
 */

import { useCallback, useEffect, useRef, useState } from "react";

// Types
export type ConnectionStatus = "Connecting" | "Connected" | "Disconnected";

export interface SeatLockMessage {
  type: "UPDATE_SEATS" | "SEAT_LOCKED" | "SEAT_UNLOCKED" | "CONNECTION_ACK";
  lockedSeatIds?: number[];
  seatId?: number;
  userId?: string;
  timestamp?: string;
}

export interface UseSeatLockingReturn {
  /** Trạng thái kết nối hiện tại */
  connectionStatus: ConnectionStatus;
  /** Danh sách ID ghế đang bị khóa bởi người khác */
  lockedSeats: number[];
  /** Hàm gửi lệnh khóa/mở khóa ghế */
  sendSeatSelection: (seatId: number, action: "LOCK" | "UNLOCK") => void;
  /** Hàm reconnect thủ công */
  reconnect: () => void;
  /** Có đang kết nối không */
  isConnected: boolean;
}

interface UseShowtimeSeatLockingProps {
  /** ID của showtime cần theo dõi */
  showtimeId: string;
  /** Có bật WebSocket không (default: true) */
  enabled?: boolean;
  /** Base URL của API (default: từ env) */
  baseUrl?: string;
}

/**
 * Hook quản lý WebSocket cho tính năng khóa ghế real-time
 */
export function useShowtimeSeatLocking({
  showtimeId,
  enabled = true,
  baseUrl,
}: UseShowtimeSeatLockingProps): UseSeatLockingReturn {
  // States
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("Disconnected");
  const [lockedSeats, setLockedSeats] = useState<number[]>([]);

  // Refs để lưu WebSocket instance và reconnect timer
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const shouldReconnectRef = useRef<boolean>(true);

  /**
   * Tạo WebSocket URL
   * Tự động chuyển ws/wss dựa trên protocol hiện tại
   */
  const getWebSocketUrl = useCallback((): string => {
    // Lấy base URL từ props hoặc environment
    const apiUrl =
      baseUrl || import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

    // Xác định protocol: wss:// cho https, ws:// cho http
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    // Parse base URL để lấy host và port
    const url = new URL(apiUrl);
    const host = url; // Bao gồm cả port nếu có

    // Tạo WebSocket URL theo format: ws://localhost:8080/ws/showtime/{showtimeId}
    return `${protocol}//${host}/ws/showtime/${showtimeId}`;
  }, [showtimeId, baseUrl]);

  /**
   * Xử lý message nhận từ WebSocket server
   */
  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: SeatLockMessage = JSON.parse(event.data);
      console.log("📩 [WebSocket] Message received:", message);

      switch (message.type) {
        case "UPDATE_SEATS":
          // Cập nhật danh sách ghế bị khóa
          if (message.lockedSeatIds && Array.isArray(message.lockedSeatIds)) {
            setLockedSeats(message.lockedSeatIds);
            console.log(
              `🔒 Locked seats updated: [${message.lockedSeatIds.join(", ")}]`,
            );
          }
          break;

        case "SEAT_LOCKED":
          // Thêm ghế vào danh sách khóa
          if (message.seatId) {
            setLockedSeats((prev) => {
              if (!prev.includes(message.seatId!)) {
                console.log(`🔒 Seat locked: ${message.seatId}`);
                return [...prev, message.seatId!];
              }
              return prev;
            });
          }
          break;

        case "SEAT_UNLOCKED":
          // Xóa ghế khỏi danh sách khóa
          if (message.seatId) {
            setLockedSeats((prev) => {
              const filtered = prev.filter((id) => id !== message.seatId);
              if (filtered.length !== prev.length) {
                console.log(`🔓 Seat unlocked: ${message.seatId}`);
              }
              return filtered;
            });
          }
          break;

        case "CONNECTION_ACK":
          console.log("✅ [WebSocket] Connection acknowledged by server");
          break;

        default:
          console.log("⚠️ [WebSocket] Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("❌ [WebSocket] Error parsing message:", error);
    }
  }, []);

  /**
   * Xử lý khi WebSocket mở kết nối thành công
   */
  const handleOpen = useCallback(() => {
    console.log("✅ [WebSocket] Connected to:", getWebSocketUrl());
    setConnectionStatus("Connected");
    reconnectAttemptsRef.current = 0; // Reset reconnect counter
  }, [getWebSocketUrl]);

  /**
   * Xử lý lỗi WebSocket
   */
  const handleError = useCallback((event: Event) => {
    console.error("❌ [WebSocket] Connection error:", event);
    setConnectionStatus("Disconnected");
  }, []);

  /**
   * Xử lý khi WebSocket đóng kết nối
   */
  const handleClose = useCallback(
    (event: CloseEvent) => {
      console.log(
        `🔌 [WebSocket] Connection closed: ${event.code} - ${event.reason}`,
      );
      setConnectionStatus("Disconnected");

      // Clear WebSocket reference
      wsRef.current = null;

      // Attempt to reconnect if not manually closed
      if (shouldReconnectRef.current && event.code !== 1000) {
        reconnectAttemptsRef.current += 1;
        const delay = 3000; // 3 giây như yêu cầu

        console.log(
          `🔄 [WebSocket] Will attempt to reconnect in ${delay}ms (attempt ${reconnectAttemptsRef.current})`,
        );

        reconnectTimerRef.current = window.setTimeout(() => {
          if (shouldReconnectRef.current && wsRef.current === null) {
            // Tạo kết nối mới trực tiếp thay vì gọi connectWebSocket()
            const wsUrl = getWebSocketUrl();
            console.log("🔌 [WebSocket] Reconnecting to:", wsUrl);
            setConnectionStatus("Connecting");

            try {
              const ws = new WebSocket(wsUrl);
              ws.onopen = handleOpen;
              ws.onmessage = handleMessage;
              ws.onerror = handleError;
              ws.onclose = handleClose;
              wsRef.current = ws;
            } catch (error) {
              console.error("❌ [WebSocket] Reconnect failed:", error);
              setConnectionStatus("Disconnected");
            }
          }
        }, delay);
      }
    },
    [getWebSocketUrl, handleOpen, handleMessage, handleError],
  );

  /**
   * Kết nối tới WebSocket server
   */
  const connectWebSocket = useCallback(() => {
    // Nếu đã có kết nối đang mở, không tạo kết nối mới
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("⚡ [WebSocket] Already connected");
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      console.log("🔌 [WebSocket] Connecting to:", wsUrl);
      setConnectionStatus("Connecting");

      const ws = new WebSocket(wsUrl);

      // Gắn event handlers
      ws.onopen = handleOpen;
      ws.onmessage = handleMessage;
      ws.onerror = handleError;
      ws.onclose = handleClose;

      wsRef.current = ws;
    } catch (error) {
      console.error("❌ [WebSocket] Failed to create connection:", error);
      setConnectionStatus("Disconnected");
    }
  }, [getWebSocketUrl, handleOpen, handleMessage, handleError, handleClose]);

  /**
   * Ngắt kết nối WebSocket
   */
  const disconnectWebSocket = useCallback(() => {
    shouldReconnectRef.current = false;

    // Clear reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    // Close WebSocket connection
    if (wsRef.current) {
      console.log("🔌 [WebSocket] Disconnecting...");
      wsRef.current.close(1000, "Component unmount");
      wsRef.current = null;
    }

    setConnectionStatus("Disconnected");
    setLockedSeats([]);
  }, []);

  /**
   * Gửi lệnh LOCK/UNLOCK ghế tới server
   */
  const sendSeatSelection = useCallback(
    (seatId: number, action: "LOCK" | "UNLOCK") => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.warn("⚠️ [WebSocket] Cannot send message: Not connected");
        return;
      }

      const message = {
        type: action,
        seatId,
        timestamp: new Date().toISOString(),
      };

      try {
        wsRef.current.send(JSON.stringify(message));
        console.log(`📤 [WebSocket] Sent ${action} request for seat ${seatId}`);
      } catch (error) {
        console.error("❌ [WebSocket] Failed to send message:", error);
      }
    },
    [],
  );

  /**
   * Reconnect thủ công
   */
  const reconnect = useCallback(() => {
    console.log("🔄 [WebSocket] Manual reconnect triggered");
    disconnectWebSocket();
    shouldReconnectRef.current = true;
    reconnectAttemptsRef.current = 0;
    connectWebSocket();
  }, [disconnectWebSocket, connectWebSocket]);

  /**
   * Effect: Khởi tạo kết nối khi component mount
   */
  useEffect(() => {
    if (!enabled || !showtimeId) {
      console.log("⏸️ [WebSocket] Connection disabled or no showtimeId");
      return;
    }

    shouldReconnectRef.current = true;
    connectWebSocket();

    // Cleanup khi component unmount
    return () => {
      console.log("🧹 [WebSocket] Cleaning up connection");
      disconnectWebSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, showtimeId]);

  return {
    connectionStatus,
    lockedSeats,
    sendSeatSelection,
    reconnect,
    isConnected: connectionStatus === "Connected",
  };
}
