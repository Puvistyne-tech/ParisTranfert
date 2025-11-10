import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Reservation } from "@/components/models/reservations";


// Reservation hooks
export function useReservations(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["reservations", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set("status", params.status);
      if (params?.limit) searchParams.set("limit", params.limit.toString());
      if (params?.offset) searchParams.set("offset", params.offset.toString());

      const response = await fetch(`/api/reservations?${searchParams}`);
      if (!response.ok) throw new Error("Failed to fetch reservations");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Reservation) => {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create reservation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch("/api/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error("Failed to update reservation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}

// Contact hooks
export function useCreateContactMessage() {
  return useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; email: string; phone?: string; message: string }) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Failed to send contact message" }));
        throw new Error(error.message || "Failed to send contact message");
      }
      return response.json();
    },
  });
}

// Stats hooks
export function useReservationStats() {
  return useQuery({
    queryKey: ["reservation-stats"],
    queryFn: async () => {
      const [allReservations, pendingReservations, todayReservations] =
        await Promise.all([
          fetch("/api/reservations").then((res) => res.json()),
          fetch("/api/reservations?status=pending").then((res) => res.json()),
          fetch("/api/reservations?limit=100").then((res) => res.json()),
        ]);

      const today = new Date().toISOString().split("T")[0];
      const todayCount =
        todayReservations.reservations?.filter(
          (r: Reservation) => r.date === today,
        ).length || 0;

      return {
        total: allReservations.total || 0,
        pending: pendingReservations.total || 0,
        today: todayCount,
        confirmed: allReservations.total - pendingReservations.total || 0,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
