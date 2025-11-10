import { useQuery } from "@tanstack/react-query";
import { getReservationById } from "@/lib/supabaseService";
import type { Reservation } from "@/components/models/reservations";

/**
 * Hook to fetch a single reservation by ID with TanStack Query caching
 * This prevents unnecessary refetches and deduplicates requests
 */
export function useReservation(id: string | null | undefined) {
  return useQuery<Reservation | null>({
    queryKey: ["reservation", id],
    queryFn: async () => {
      if (!id) {
        return null;
      }
      return getReservationById(id);
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000, // 5 minutes - reservation data doesn't change often
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

