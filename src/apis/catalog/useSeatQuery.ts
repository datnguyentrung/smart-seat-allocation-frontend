import type { SeatResponse } from "@/types/types";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { SeatAPI } from "./SeatAPI";

export const seatQueryKeys = {
  all: ["seats"] as const,
  byRoom: (roomId: number) => [...seatQueryKeys.all, "room", roomId] as const,
};

type SeatsByRoomQueryKey = ReturnType<typeof seatQueryKeys.byRoom>;

type UseSeatsByRoomIdOptions = Omit<
  UseQueryOptions<SeatResponse[], Error, SeatResponse[], SeatsByRoomQueryKey>,
  "queryKey" | "queryFn"
>;

export function useSeatsByRoomId(
  roomId?: number,
  options?: UseSeatsByRoomIdOptions,
) {
  return useQuery({
    queryKey: seatQueryKeys.byRoom(roomId ?? 0),
    queryFn: () => SeatAPI.getSeatsByRoomId(roomId!),
    enabled:
      typeof roomId === "number" && roomId > 0 && (options?.enabled ?? true),
    ...options,
  });
}
