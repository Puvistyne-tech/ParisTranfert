import { useQuery } from "@tanstack/react-query";
import { getServices } from "@/lib/supabaseService";
import type { Service } from "@/components/models";

/**
 * Hook to fetch services with TanStack Query caching
 * Services rarely change, so we cache for 30 minutes
 */
export function useServices() {
  return useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: () => getServices(),
    staleTime: 30 * 60 * 1000, // 30 minutes - services rarely change
    gcTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

