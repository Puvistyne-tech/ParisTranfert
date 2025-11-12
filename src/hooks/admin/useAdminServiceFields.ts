import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ServiceField } from "@/components/models/serviceFields";
import {
  createServiceField,
  deleteServiceField,
  getServiceFields,
  updateServiceField,
} from "@/lib/supabaseService";

// Query keys
export const adminServiceFieldKeys = {
  all: ["admin", "service-fields"] as const,
  lists: () => [...adminServiceFieldKeys.all, "list"] as const,
  list: (serviceId: string) => [...adminServiceFieldKeys.lists(), serviceId] as const,
  details: () => [...adminServiceFieldKeys.all, "detail"] as const,
  detail: (id: string) => [...adminServiceFieldKeys.details(), id] as const,
};

// Fetch service fields for a service
export function useAdminServiceFields(serviceId: string | null) {
  return useQuery<ServiceField[]>({
    queryKey: adminServiceFieldKeys.list(serviceId || ""),
    queryFn: async () => {
      if (!serviceId) return [];
      return getServiceFields(serviceId);
    },
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Create service field mutation
export function useCreateServiceField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      fieldData,
    }: {
      serviceId: string;
      fieldData: Omit<ServiceField, "id" | "serviceId">;
    }) => {
      return createServiceField(serviceId, fieldData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminServiceFieldKeys.list(variables.serviceId),
      });
    },
  });
}

// Update service field mutation
export function useUpdateServiceField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fieldId,
      serviceId,
      updates,
    }: {
      fieldId: string;
      serviceId: string;
      updates: Partial<Omit<ServiceField, "id" | "serviceId">>;
    }) => {
      return updateServiceField(fieldId, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminServiceFieldKeys.list(variables.serviceId),
      });
      queryClient.invalidateQueries({
        queryKey: adminServiceFieldKeys.detail(variables.fieldId),
      });
    },
  });
}

// Delete service field mutation
export function useDeleteServiceField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fieldId,
      serviceId,
    }: {
      fieldId: string;
      serviceId: string;
    }) => {
      return deleteServiceField(fieldId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: adminServiceFieldKeys.list(variables.serviceId),
      });
    },
  });
}

