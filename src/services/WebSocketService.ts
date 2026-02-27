/**
 * WebSocket Service for real-time seat updates
 * Manages WebSocket connection, reconnection, and message handling
 */

export type WebSocketMessage = {
  type: "SEAT_UPDATED" | "SEATS_UPDATED" | "BOOKING_CREATED" | "CONNECTION_ACK";
  data: {
    seatId?: number;
    seatState?: string;
    seatIds?: number[];
    [key: string]: unknown;
  };
  timestamp?: string;
};

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private baseReconnectDelay = 2000;
  private reconnectTimer: number | null = null;
  private pingInterval: number | null = null;
  private messageHandlers: Set<(message: WebSocketMessage) => void> = new Set();
  private statusHandlers: Set<(status: ConnectionStatus) => void> = new Set();
  private isManuallyDisconnected = false;

  constructor(baseUrl: string) {
    // Convert HTTP URL to WebSocket URL
    this.url = baseUrl;
  }

  /**
   * Connect to WebSocket server for a specific showtime
   */
  connect(showtimeId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log("⚡ WebSocket already connected");
      return;
    }

    // if (this.isManuallyDisconnected) {
    //   console.log(
    //     "⏸️ WebSocket is manually disconnected. Call reconnect() to enable.",
    //   );
    //   return;
    // }

    this.isManuallyDisconnected = false;

    this.notifyStatusChange("connecting");
    const wsUrl = `${this.url}/ws/showtime/${showtimeId}`;

    console.log("🔌 Connecting to WebSocket:", wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error("❌ WebSocket connection error:", error);
      this.notifyStatusChange("error");
      this.scheduleReconnect(showtimeId);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log("🔌 Disconnecting WebSocket...");
    this.isManuallyDisconnected = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.ws) {
      this.ws.close(1000, "Manual disconnect");
      this.ws = null;
    }

    this.reconnectAttempts = 0;
    this.notifyStatusChange("disconnected");
  }

  /**
   * Subscribe to WebSocket messages
   */
  onMessage(handler: (message: WebSocketMessage) => void): () => void {
    this.messageHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(handler: (status: ConnectionStatus) => void): () => void {
    this.statusHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  /**
   * Send message to WebSocket server
   */
  send(message: Record<string, unknown>): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("⚠️ WebSocket is not connected. Cannot send message.");
    }
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    if (!this.ws) return "disconnected";

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return "disconnected";
      default:
        return "error";
    }
  }

  // Private methods

  private handleOpen(): void {
    console.log("✅ WebSocket connected");
    this.reconnectAttempts = 0;
    this.isManuallyDisconnected = false;
    this.notifyStatusChange("connected");

    // Start ping/pong to keep connection alive
    this.startPing();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log("📩 WebSocket message received:", message);

      // Notify all message handlers
      this.messageHandlers.forEach((handler) => handler(message));
    } catch (error) {
      console.error("❌ Error parsing WebSocket message:", error);
    }
  }

  private handleError(event: Event): void {
    console.error("❌ WebSocket error:", event);
    this.notifyStatusChange("error");
  }

  private handleClose(event: CloseEvent): void {
    console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
    this.notifyStatusChange("disconnected");

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    // Attempt to reconnect if not a normal closure and not manually disconnected
    if (
      !this.isManuallyDisconnected &&
      event.code !== 1000 &&
      this.reconnectAttempts < this.maxReconnectAttempts
    ) {
      const showtimeId = this.extractShowtimeId();
      if (showtimeId) {
        this.scheduleReconnect(showtimeId);
      }
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("❌ Max reconnection attempts reached. WebSocket disabled.");
      this.isManuallyDisconnected = true;
    }
  }

  private scheduleReconnect(showtimeId: string): void {
    this.reconnectAttempts++;
    // Exponential backoff: 2s, 4s, 8s, 16s, 32s
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000, // Max 30 seconds
    );

    console.log(
      `🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`,
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect(showtimeId);
    }, delay) as unknown as number;
  }

  private startPing(): void {
    // Send ping every 30 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: "PING" });
      }
    }, 30000);
  }

  private extractShowtimeId(): string | null {
    // Extract showtime ID from current WebSocket URL
    const match = this.ws?.url.match(/\/showtime\/([^/]+)/);
    return match ? match[1] : null;
  }

  private notifyStatusChange(status: ConnectionStatus): void {
    this.statusHandlers.forEach((handler) => handler(status));
  }
}

// Singleton instance
const WS_URL = import.meta.env.VITE_API_WS_URL || "ws://localhost:8080";
export const webSocketService = new WebSocketService(WS_URL);
