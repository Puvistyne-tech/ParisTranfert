import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Reservation, ReservationStatus } from "@/components/models/reservations";
import { getReservations, getReservationById } from "@/lib/supabaseService";

// Query keys
export const adminReservationKeys = {
  all: ["admin", "reservations"] as const,
  lists: () => [...adminReservationKeys.all, "list"] as const,
  list: (filters?: {
    search?: string;
    status?: ReservationStatus;
    dateFrom?: string;
    dateTo?: string;
    serviceId?: string;
    vehicleTypeId?: string;
    page?: number;
    pageSize?: number;
  }) => [...adminReservationKeys.lists(), filters] as const,
  details: () => [...adminReservationKeys.all, "detail"] as const,
  detail: (id: string) => [...adminReservationKeys.details(), id] as const,
};

// Fetch reservations with filters
export function useAdminReservations(filters?: {
  search?: string;
  status?: ReservationStatus;
  dateFrom?: string;
  dateTo?: string;
  serviceId?: string;
  vehicleTypeId?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery<{ data: Reservation[]; total: number }>({
    queryKey: adminReservationKeys.list(filters),
    queryFn: async () => {
      const statusFilter = filters?.status;
      const pageSize = filters?.pageSize || 20;
      const page = filters?.page || 1;

      const result = await getReservations({
        status: statusFilter,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });

      let filtered = result.data;

      // Apply additional filters
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase().trim();
        const isUUIDFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          filters.search.trim()
        );
        const isPartialUUID = /^[0-9a-f-]{8,}$/i.test(filters.search.trim());

        if (isUUIDFormat) {
          const exactMatch = filtered.find((r) => r.id.toLowerCase() === searchLower);
          filtered = exactMatch ? [exactMatch] : [];
        } else if (isPartialUUID) {
          const idMatches = filtered.filter((r) => r.id.toLowerCase().includes(searchLower));
          const otherMatches = filtered.filter(
            (r) =>
              !r.id.toLowerCase().includes(searchLower) &&
              (r.pickupLocation.toLowerCase().includes(searchLower) ||
                r.destinationLocation?.toLowerCase().includes(searchLower))
          );
          filtered = [...idMatches, ...otherMatches];
        } else {
          filtered = filtered.filter(
            (r) =>
              r.id.toLowerCase().includes(searchLower) ||
              r.pickupLocation.toLowerCase().includes(searchLower) ||
              r.destinationLocation?.toLowerCase().includes(searchLower)
          );
        }
      }

      if (filters?.serviceId) {
        filtered = filtered.filter((r) => r.serviceId === filters.serviceId);
      }

      if (filters?.vehicleTypeId) {
        filtered = filtered.filter((r) => r.vehicleTypeId === filters.vehicleTypeId);
      }

      if (filters?.dateFrom) {
        filtered = filtered.filter((r) => r.date >= filters.dateFrom!);
      }

      if (filters?.dateTo) {
        filtered = filtered.filter((r) => r.date <= filters.dateTo!);
      }

      return { data: filtered, total: filtered.length };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch single reservation
export function useAdminReservation(id: string | null) {
  return useQuery<Reservation | null>({
    queryKey: adminReservationKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      return getReservationById(id);
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Invalidate reservations (for use after mutations)
export function useInvalidateReservations() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: adminReservationKeys.lists() });
  };
}

