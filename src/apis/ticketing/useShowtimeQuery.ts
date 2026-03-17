import type {
  ShowtimeResponse,
  ShowTimeWithSeatsResponse,
} from "@/types/types";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { ShowtimeAPI } from "./ShowtimeAPI";

function filterEndedShowtimes(items: ShowtimeResponse[]): ShowtimeResponse[] {
  const now = Date.now();
  return items.filter((item) => new Date(item.endTime).getTime() >= now);
}

export const showtimeQueryKeys = {
  all: ["showtimes"] as const,
  withSeats: (showtimeId: string) =>
    [...showtimeQueryKeys.all, "with-seats", showtimeId] as const,
  byDate: (date: string) => [...showtimeQueryKeys.all, "filter", date] as const,
};

type ShowtimeWithSeatsQueryKey = ReturnType<typeof showtimeQueryKeys.withSeats>;
type ShowtimesByDateQueryKey = ReturnType<typeof showtimeQueryKeys.byDate>;

type UseShowtimeWithSeatsOptions = Omit<
  UseQueryOptions<
    ShowTimeWithSeatsResponse,
    Error,
    ShowTimeWithSeatsResponse,
    ShowtimeWithSeatsQueryKey
  >,
  "queryKey" | "queryFn"
>;

type UseShowtimesByDateOptions = Omit<
  UseQueryOptions<
    ShowtimeResponse[],
    Error,
    ShowtimeResponse[],
    ShowtimesByDateQueryKey
  >,
  "queryKey" | "queryFn"
>;

export function useShowtimeWithSeats(
  showtimeId?: string,
  options?: UseShowtimeWithSeatsOptions,
) {
  return useQuery({
    queryKey: showtimeQueryKeys.withSeats(showtimeId ?? ""),
    queryFn: () => ShowtimeAPI.getShowtimeWithSeats(showtimeId!),
    enabled: Boolean(showtimeId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useShowtimesByDate(
  date?: string,
  options?: UseShowtimesByDateOptions,
) {
  return useQuery({
    queryKey: showtimeQueryKeys.byDate(date ?? ""),
    queryFn: async () => {
      const showtimes = await ShowtimeAPI.getShowtimeByFilter(date!);
      return filterEndedShowtimes(showtimes);
    },
    enabled: Boolean(date) && (options?.enabled ?? true),
    ...options,
  });
}
