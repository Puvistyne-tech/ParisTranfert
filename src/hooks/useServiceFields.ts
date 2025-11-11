import { useQuery } from "@tanstack/react-query";
import type { ServiceField } from "@/components/models/serviceFields";
import { getServiceFields } from "@/lib/supabaseService";

/**
 * Hook to fetch service fields with TanStack Query caching
 * Service fields can change but not frequently, so we cache for 10 minutes
 */
export function useServiceFields(serviceId: string | null | undefined) {
  return useQuery<ServiceField[]>({
    queryKey: ["service-fields", serviceId],
    queryFn: async () => {
      if (!serviceId) {
        return [];
      }
      return getServiceFields(serviceId);
    },
    enabled: Boolean(serviceId),
    staleTime: 10 * 60 * 1000, // 10 minutes - service fields can change but not frequently
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
