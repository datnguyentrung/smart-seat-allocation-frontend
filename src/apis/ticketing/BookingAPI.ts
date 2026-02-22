import axiosInstance from "@/apis/axiosInstance";
import type { BookSeatsRequest, TicketResponse } from "../../types/types";

export const BookingAPI = {
  // Create a booking for a showtime
  createBooking: async (
    bookSeatsRequest: BookSeatsRequest,
  ): Promise<TicketResponse[]> => {
    console.log("BookingAPI.createBooking called with:", bookSeatsRequest);
    const response = await axiosInstance.post(`/bookings`, bookSeatsRequest);
    return response.data;
  },
};
