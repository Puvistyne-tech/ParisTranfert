import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Service } from "@/components/models/services";
import {
  createService,
  deleteService,
  getAllServices,
  getCategories,
  updateService,
} from "@/lib/supabaseService";
import type { Category } from "@/components/models/categories";

// Query keys
export const adminServiceKeys = {
  all: ["admin", "services"] as const,
  lists: () => [...adminServiceKeys.all, "list"] as const,
  list: (filters?: {
    search?: string;
    category?: string;
    availability?: string;
    popular?: string;
  }) => [...adminServiceKeys.lists(), filters] as const,
  details: () => [...adminServiceKeys.all, "detail"] as const,
  detail: (id: string) => [...adminServiceKeys.details(), id] as const,
  categories: () => [...adminServiceKeys.all, "categories"] as const,
};

// Fetch all services
export function useAdminServices(filters?: {
  search?: string;
  category?: string;
  availability?: string;
  popular?: string;
}) {
  return useQuery<Service[]>({
    queryKey: adminServiceKeys.list(filters),
    queryFn: async () => {
      const services = await getAllServices();
      let filtered = services;

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(searchLower) ||
            s.description?.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.category) {
        filtered = filtered.filter((s) => s.categoryId === filters.category);
      }

      if (filters?.availability === "available") {
        filtered = filtered.filter((s) => s.isAvailable);
      } else if (filters?.availability === "unavailable") {
        filtered = filtered.filter((s) => !s.isAvailable);
      }

      if (filters?.popular === "popular") {
        filtered = filtered.filter((s) => s.isPopular);
      } else if (filters?.popular === "not-popular") {
        filtered = filtered.filter((s) => !s.isPopular);
      }

      return filtered;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch categories
export function useAdminCategories() {
  return useQuery<Category[]>({
    queryKey: adminServiceKeys.categories(),
    queryFn: async () => {
      return getCategories();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Create service mutation
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (serviceData: Parameters<typeof createService>[0]) => {
      return createService(serviceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminServiceKeys.lists() });
    },
  });
}

// Update service mutation
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateService>[1];
    }) => {
      return updateService(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminServiceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: adminServiceKeys.detail(variables.id),
      });
    },
  });
}

// Delete service mutation
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return deleteService(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminServiceKeys.lists() });
    },
  });
}

