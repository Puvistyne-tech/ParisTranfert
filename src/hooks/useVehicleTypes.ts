import { useQuery } from "@tanstack/react-query";
import type { VehicleType } from "@/components/models/vehicleTypes";
import { getVehicleTypes } from "@/lib/supabaseService";

/**
 * Hook to fetch vehicle types with TanStack Query caching
 * Vehicle types rarely change, so we cache for 30 minutes
 */
export function useVehicleTypes() {
  return useQuery<VehicleType[]>({
    queryKey: ["vehicle-types"],
    queryFn: () => getVehicleTypes(),
    staleTime: 30 * 60 * 1000, // 30 minutes - vehicle types rarely change
    gcTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
