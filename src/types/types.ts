export type SeatType = "STANDARD" | "VIP" | "COUPLE";
export type SeatState = "AVAILABLE" | "BOOKED" | "SELECTED";

export interface SeatResponse {
  seatId: number;
  roomId: number;

  rowLabel: string;
  seatNumber: number;
  gridRow: number;
  gridCol: number;

  seatType: SeatType;
  seatState?: SeatState;
}
