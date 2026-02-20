export type SeatType = "STANDARD" | "VIP" | "COUPLE";
export type SeatState = "AVAILABLE" | "BOOKED" | "SELECTED" | "UNAVAILABLE";
export type AgeRating = "P" | "C13" | "C16" | "C18";
export type RoomType = "2D" | "3D" | "IMAX";
export type ShowtimeStatus = "OPENING" | "SOLD_OUT" | "CANCELLED";

export interface SeatResponse {
  seatId: number;
  roomId: number;

  rowLabel: string;
  seatNumber: number;
  gridRow: number;
  gridCol: number;

  isActive: boolean;

  seatType: SeatType;
  seatState?: SeatState;
}

export interface MovieResponse {
  movieId: string;
  title: string;
  durationMinutes: number;
  posterUrl: string;
  description: string;
  releaseDate: Date | string;
  ageRating: AgeRating;
}

export interface RoomResponse {
  roomId: number;
  roomName: string;
  totalRows: number;
  totalCols: number;
  type: RoomType;
}

export interface ShowtimeResponse {
  showtimeId: string;
  movieResponse: MovieResponse;
  roomResponse: RoomResponse;
  startTime: Date | string;
  endTime: Date | string;

  ticketPrice: number;
  status: ShowtimeStatus;
}

export interface ShowTimeWithSeatsResponse extends ShowtimeResponse {
  selectedSeats: SeatResponse[];
}
