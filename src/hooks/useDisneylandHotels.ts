import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DisneylandHotel,
  DisneylandHotelDescriptionI18n,
  DisneylandHotelPriceCurrency,
} from "@/components/models/disneylandHotels";
import {
  createDisneylandHotel,
  deleteDisneylandHotel,
  getDisneylandHotels,
  updateDisneylandHotel,
  updateDisneylandHotelOrder,
  uploadWebsiteImage,
} from "@/lib/supabaseService";

export function useDisneylandHotels(enabled = true) {
  return useQuery({
    queryKey: ["disneylandHotels"],
    queryFn: () => getDisneylandHotels(),
    enabled,
  });
}

export function useCreateDisneylandHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      descriptionI18n?: DisneylandHotelDescriptionI18n | null;
      imageFile: File;
      googleMapsUrl?: string | null;
      address?: string | null;
      starRating?: number | null;
      tags?: string[];
      hotelWebsiteUrl?: string | null;
      priceRange?: number | null;
      priceCurrency?: DisneylandHotelPriceCurrency;
      displayOrder?: number;
      isActive?: boolean;
    }) => {
      const imageUrl = await uploadWebsiteImage(
        input.imageFile,
        "disneyland-hotel",
      );
      return createDisneylandHotel({
        name: input.name,
        descriptionI18n: input.descriptionI18n,
        imageUrl,
        googleMapsUrl: input.googleMapsUrl,
        address: input.address,
        starRating: input.starRating,
        tags: input.tags,
        hotelWebsiteUrl: input.hotelWebsiteUrl,
        priceRange: input.priceRange,
        priceCurrency: input.priceCurrency,
        displayOrder: input.displayOrder,
        isActive: input.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disneylandHotels"] });
    },
  });
}

export function useUpdateDisneylandHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      name?: string;
      descriptionI18n?: DisneylandHotelDescriptionI18n | null;
      imageFile?: File;
      googleMapsUrl?: string | null;
      address?: string | null;
      starRating?: number | null;
      tags?: string[];
      hotelWebsiteUrl?: string | null;
      priceRange?: number | null;
      priceCurrency?: DisneylandHotelPriceCurrency;
      displayOrder?: number;
      isActive?: boolean;
    }) => {
      let imageUrl: string | undefined;
      if (input.imageFile) {
        imageUrl = await uploadWebsiteImage(
          input.imageFile,
          "disneyland-hotel",
        );
      }
      return updateDisneylandHotel(input.id, {
        name: input.name,
        descriptionI18n: input.descriptionI18n,
        imageUrl,
        googleMapsUrl: input.googleMapsUrl,
        address: input.address,
        starRating: input.starRating,
        tags: input.tags,
        hotelWebsiteUrl: input.hotelWebsiteUrl,
        priceRange: input.priceRange,
        priceCurrency: input.priceCurrency,
        displayOrder: input.displayOrder,
        isActive: input.isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disneylandHotels"] });
    },
  });
}

export function useDeleteDisneylandHotel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDisneylandHotel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disneylandHotels"] });
    },
  });
}

export function useUpdateDisneylandHotelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hotels: DisneylandHotel[]) =>
      updateDisneylandHotelOrder(hotels),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disneylandHotels"] });
    },
  });
}
