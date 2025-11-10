import { useQuery } from "@tanstack/react-query";
import { getLocations } from "@/lib/supabaseService";
import type { Location } from "@/components/models/locations";

/**
 * Hook to fetch locations with TanStack Query caching
 * Locations rarely change, so we cache for 30 minutes
 */
export function useLocations() {
  return useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: () => getLocations(),
    staleTime: 30 * 60 * 1000, // 30 minutes - locations rarely change
    gcTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

