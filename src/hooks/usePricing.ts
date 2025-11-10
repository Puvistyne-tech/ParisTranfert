import { useQuery } from "@tanstack/react-query";
import { getPricing } from "@/lib/supabaseService";
import type { ServiceVehiclePricing } from "@/components/models/pricing";

/**
 * Hook to fetch pricing with TanStack Query caching
 * This prevents unnecessary refetches and deduplicates requests
 */
export function usePricing(
  serviceId: string | null | undefined,
  vehicleTypeId: string | null | undefined,
  pickupLocation: string | null | undefined,
  destinationLocation: string | null | undefined,
  enabled: boolean = true
) {
  return useQuery<ServiceVehiclePricing | null>({
    queryKey: ["pricing", serviceId, vehicleTypeId, pickupLocation, destinationLocation],
    queryFn: async () => {
      if (!serviceId || !vehicleTypeId || !pickupLocation || !destinationLocation) {
        return null;
      }
      return getPricing(serviceId, vehicleTypeId, pickupLocation, destinationLocation);
    },
    enabled: enabled && Boolean(serviceId && vehicleTypeId && pickupLocation && destinationLocation),
    staleTime: 10 * 60 * 1000, // 10 minutes - pricing doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

