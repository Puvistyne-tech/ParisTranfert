import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ServiceVehiclePricing } from "@/components/models/pricing";
import {
  createPricing,
  deletePricing,
  getAllPricing,
  updatePricing,
} from "@/lib/supabaseService";

// Query keys
export const adminPricingKeys = {
  all: ["admin", "pricing"] as const,
  lists: () => [...adminPricingKeys.all, "list"] as const,
  list: (filters?: {
    search?: string;
    serviceId?: string;
    vehicleTypeId?: string;
  }) => [...adminPricingKeys.lists(), filters] as const,
  details: () => [...adminPricingKeys.all, "detail"] as const,
  detail: (id: string) => [...adminPricingKeys.details(), id] as const,
};

// Fetch all pricing
export function useAdminPricing(filters?: {
  search?: string;
  serviceId?: string;
  vehicleTypeId?: string;
}) {
  return useQuery<ServiceVehiclePricing[]>({
    queryKey: adminPricingKeys.list(filters),
    queryFn: async () => {
      const result = await getAllPricing({ limit: 1000 });
      let filtered = result.data;

      // Apply filters if provided
      if (filters?.serviceId) {
        filtered = filtered.filter((p) => p.serviceId === filters.serviceId);
      }

      if (filters?.vehicleTypeId) {
        filtered = filtered.filter((p) => p.vehicleTypeId === filters.vehicleTypeId);
      }

      return filtered;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Create pricing mutation
export function useCreatePricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Parameters<typeof createPricing>[0]) => {
      return createPricing(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPricingKeys.lists() });
    },
  });
}

// Update pricing mutation
export function useUpdatePricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Parameters<typeof updatePricing>[1];
    }) => {
      return updatePricing(id, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminPricingKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: adminPricingKeys.detail(variables.id),
      });
    },
  });
}

// Delete pricing mutation
export function useDeletePricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return deletePricing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPricingKeys.lists() });
    },
  });
}

