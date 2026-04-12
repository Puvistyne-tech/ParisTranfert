import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  HomePageImage,
  HomePageImageSectionType,
} from "@/components/models/homePageImages";
import {
  createHomePageImage,
  deleteHomePageImage,
  deleteWebsiteImage,
  getAllHomePageImages,
  getHomePageImages,
  updateHomePageImage,
  updateHomePageImageOrder,
  uploadWebsiteImage,
} from "@/lib/supabaseService";

/**
 * Hook to fetch active home page images
 */
export function useHomePageImages(type: HomePageImageSectionType) {
  return useQuery({
    queryKey: ["homePageImages", type],
    queryFn: () => getHomePageImages(type),
  });
}

/**
 * Hook to fetch all home page images (including inactive) - for admin
 */
export function useAllHomePageImages(type: HomePageImageSectionType) {
  return useQuery({
    queryKey: ["allHomePageImages", type],
    queryFn: () => getAllHomePageImages(type),
  });
}

/**
 * Hook to create a home page image
 */
export function useCreateHomePageImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      type: HomePageImageSectionType;
      file: File;
      displayOrder?: number;
      isActive?: boolean;
    }) => {
      const imageUrl = await uploadWebsiteImage(
        data.file,
        data.type,
        data.displayOrder,
      );

      return createHomePageImage({
        type: data.type,
        imageUrl,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["homePageImages", variables.type],
      });
      queryClient.invalidateQueries({
        queryKey: ["allHomePageImages", variables.type],
      });
    },
  });
}

/**
 * Hook to update a home page image
 */
export function useUpdateHomePageImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      updates: Partial<{
        imageUrl: string;
        displayOrder: number;
        isActive: boolean;
      }>;
      type: HomePageImageSectionType;
    }) => {
      return updateHomePageImage(data.id, data.updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["homePageImages", variables.type],
      });
      queryClient.invalidateQueries({
        queryKey: ["allHomePageImages", variables.type],
      });
    },
  });
}

/**
 * Hook to update home page image order
 */
export function useUpdateHomePageImageOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      images: HomePageImage[];
      type: HomePageImageSectionType;
    }) => {
      return updateHomePageImageOrder(data.images);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["homePageImages", variables.type],
      });
      queryClient.invalidateQueries({
        queryKey: ["allHomePageImages", variables.type],
      });
    },
  });
}

/**
 * Hook to delete a home page image
 */
export function useDeleteHomePageImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      type: HomePageImageSectionType;
    }) => {
      return deleteHomePageImage(data.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["homePageImages", variables.type],
      });
      queryClient.invalidateQueries({
        queryKey: ["allHomePageImages", variables.type],
      });
    },
  });
}

export { deleteWebsiteImage, uploadWebsiteImage };
