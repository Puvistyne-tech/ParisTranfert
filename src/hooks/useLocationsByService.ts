import { useQuery } from "@tanstack/react-query";
import type { Location } from "@/components/models/locations";
import { getLocationsByService } from "@/lib/supabaseService";

/**
 * Hook to fetch locations by service with TanStack Query caching
 * Locations for a service can change but not frequently, so we cache for 10 minutes
 */
export function useLocationsByService(serviceId: string | null | undefined) {
  return useQuery<Location[]>({
    queryKey: ["locations-by-service", serviceId],
    queryFn: async () => {
      if (!serviceId) {
        return [];
      }
      return getLocationsByService(serviceId);
    },
    enabled: Boolean(serviceId),
    staleTime: 10 * 60 * 1000, // 10 minutes - locations can change but not frequently
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
