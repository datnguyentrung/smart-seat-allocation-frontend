import type { BookSeatsRequest, TicketResponse } from "@/types/types";
import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { BookingAPI } from "./BookingAPI";
import { showtimeQueryKeys } from "./useShowtimeQuery";

export const bookingMutationKeys = {
  all: ["bookings"] as const,
  create: () => [...bookingMutationKeys.all, "create"] as const,
};

type UseCreateBookingMutationOptions = UseMutationOptions<
  TicketResponse[],
  Error,
  BookSeatsRequest
>;

export function useCreateBookingMutation(
  options?: UseCreateBookingMutationOptions,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options ?? {};

  return useMutation({
    mutationKey: bookingMutationKeys.create(),
    mutationFn: (bookSeatsRequest: BookSeatsRequest) =>
      BookingAPI.createBooking(bookSeatsRequest),
    ...restOptions,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await queryClient.invalidateQueries({
        queryKey: showtimeQueryKeys.withSeats(variables.showtimeId),
      });
      await queryClient.invalidateQueries({
        queryKey: showtimeQueryKeys.all,
      });

      await onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
