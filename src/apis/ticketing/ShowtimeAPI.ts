import axiosInstance from "@/apis/axiosInstance";
import type { ShowTimeWithSeatsResponse } from "@/types/types";

export const ShowtimeAPI = {
  // Fetch showtime with seats by showtime ID
  getShowtimeWithSeats: async (
    showtimeId: string,
  ): Promise<ShowTimeWithSeatsResponse> => {
    const response = await axiosInstance.get(`/showtimes/${showtimeId}`);
    return response.data;
  },
};
