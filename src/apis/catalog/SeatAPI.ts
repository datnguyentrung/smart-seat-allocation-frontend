import axiosInstance from "@/apis/axiosInstance";
import type { SeatResponse } from "@/types/types";

export const SeatAPI = {
  // Fetch seats by room ID
  getSeatsByRoomId: async (roomId: number): Promise<SeatResponse[]> => {
    const response = await axiosInstance.get(`/seats/room/${roomId}`);
    return response.data;
  },
};
