import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/supabaseService";
import type { Category } from "@/components/models/categories";

/**
 * Hook to fetch categories with TanStack Query caching
 * Categories rarely change, so we cache for 30 minutes
 */
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes - categories rarely change
    gcTime: 60 * 60 * 1000, // 1 hour - keep in cache longer
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

