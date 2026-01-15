import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { HomePageImage } from "@/components/models/homePageImages";
import {
    getHomePageImages,
    getAllHomePageImages,
    createHomePageImage,
    updateHomePageImage,
    updateHomePageImageOrder,
    deleteHomePageImage,
    uploadWebsiteImage,
    deleteWebsiteImage,
} from "@/lib/supabaseService";

/**
 * Hook to fetch active home page images
 */
export function useHomePageImages(type: "carousel" | "hero" | "services" | "vehicles" | "features" | "testimonials" | "disneyland-promo" | "disneyland-page") {
    return useQuery({
        queryKey: ["homePageImages", type],
        queryFn: () => getHomePageImages(type),
    });
}

/**
 * Hook to fetch all home page images (including inactive) - for admin
 */
export function useAllHomePageImages(type: "carousel" | "hero" | "services" | "vehicles" | "features" | "testimonials" | "disneyland-promo" | "disneyland-page") {
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
            type: "carousel" | "hero" | "services" | "vehicles" | "features" | "testimonials" | "disneyland-promo" | "disneyland-page";
            file: File;
            displayOrder?: number;
            isActive?: boolean;
        }) => {
            // Upload image first
            const imageUrl = await uploadWebsiteImage(
                data.file,
                data.type,
                data.displayOrder
            );

            // Create database record
            return createHomePageImage({
                type: data.type,
                imageUrl,
                displayOrder: data.displayOrder,
                isActive: data.isActive,
            });
        },
        onSuccess: (_, variables) => {
            // Invalidate queries for the specific type
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
            type: "carousel" | "hero" | "services" | "vehicles" | "features" | "testimonials" | "disneyland-promo" | "disneyland-page";
        }) => {
            return updateHomePageImage(data.id, data.updates);
        },
        onSuccess: (_, variables) => {
            // Invalidate queries for the specific type
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
            type: "carousel" | "hero" | "services" | "vehicles" | "features" | "testimonials" | "disneyland-promo" | "disneyland-page";
        }) => {
            return updateHomePageImageOrder(data.images);
        },
        onSuccess: (_, variables) => {
            // Invalidate queries for the specific type
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
            type: "carousel" | "hero" | "services" | "vehicles" | "features" | "testimonials" | "disneyland-promo" | "disneyland-page";
        }) => {
            return deleteHomePageImage(data.id);
        },
        onSuccess: (_, variables) => {
            // Invalidate queries for the specific type
            queryClient.invalidateQueries({
                queryKey: ["homePageImages", variables.type],
            });
            queryClient.invalidateQueries({
                queryKey: ["allHomePageImages", variables.type],
            });
        },
    });
}

