"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
    Loader2,
    ChevronDown,
    ChevronRight,
    Image as ImageIcon,
} from "lucide-react";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { DraggableImageList } from "@/components/admin/DraggableImageList";
import { ImageGallery } from "@/components/admin/ImageGallery";
import { HomePagePreview } from "@/components/admin/HomePagePreview";
import {
    useAllHomePageImages,
    useCreateHomePageImage,
    useUpdateHomePageImageOrder,
    useUpdateHomePageImage,
    useDeleteHomePageImage,
} from "@/hooks/useHomePageImages";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type ImageType =
    | "carousel"
    | "hero"
    | "services"
    | "vehicles"
    | "features"
    | "testimonials";

const SECTION_CONFIG: Record<
    ImageType,
    {
        label: string;
        description: string;
        multiple: boolean;
        showReorder: boolean;
        icon: React.ReactNode;
    }
> = {
    hero: {
        label: "Hero Background",
        description: "Background image for the hero section",
        multiple: false,
        showReorder: false,
        icon: <ImageIcon className="w-5 h-5" />,
    },
    carousel: {
        label: "Carousel Images",
        description: "Multiple images that rotate on the home page",
        multiple: true,
        showReorder: true,
        icon: <ImageIcon className="w-5 h-5" />,
    },
    services: {
        label: "Services Background",
        description: "Background image for the services section",
        multiple: false,
        showReorder: false,
        icon: <ImageIcon className="w-5 h-5" />,
    },
    vehicles: {
        label: "Vehicles Background",
        description: "Background image for the vehicles section",
        multiple: false,
        showReorder: false,
        icon: <ImageIcon className="w-5 h-5" />,
    },
    features: {
        label: "Features Background",
        description: "Background image for the features section",
        multiple: false,
        showReorder: false,
        icon: <ImageIcon className="w-5 h-5" />,
    },
    testimonials: {
        label: "Testimonials Background",
        description: "Background image for the testimonials section",
        multiple: false,
        showReorder: false,
        icon: <ImageIcon className="w-5 h-5" />,
    },
};

export default function HomeImagesPage() {
    const t = useTranslations("admin");
    const [expandedSections, setExpandedSections] = useState<Set<ImageType>>(
        new Set(["carousel"])
    );
    const [uploading, setUploading] = useState<Record<ImageType, boolean>>({
        carousel: false,
        hero: false,
        services: false,
        vehicles: false,
        features: false,
        testimonials: false,
    });
    const [uploadQueue, setUploadQueue] = useState<Record<ImageType, File[]>>({
        carousel: [],
        hero: [],
        services: [],
        vehicles: [],
        features: [],
        testimonials: [],
    });

    // Fetch images for all types
    const { data: carouselImages = [], isLoading: carouselLoading } =
        useAllHomePageImages("carousel");
    const { data: heroImages = [], isLoading: heroLoading } =
        useAllHomePageImages("hero");
    const { data: servicesImages = [], isLoading: servicesLoading } =
        useAllHomePageImages("services");
    const { data: vehiclesImages = [], isLoading: vehiclesLoading } =
        useAllHomePageImages("vehicles");
    const { data: featuresImages = [], isLoading: featuresLoading } =
        useAllHomePageImages("features");
    const { data: testimonialsImages = [], isLoading: testimonialsLoading } =
        useAllHomePageImages("testimonials");

    // Mutations
    const createImage = useCreateHomePageImage();
    const updateOrder = useUpdateHomePageImageOrder();
    const updateImage = useUpdateHomePageImage();
    const deleteImage = useDeleteHomePageImage();

    const getImages = (type: ImageType) => {
        switch (type) {
            case "carousel":
                return carouselImages;
            case "hero":
                return heroImages;
            case "services":
                return servicesImages;
            case "vehicles":
                return vehiclesImages;
            case "features":
                return featuresImages;
            case "testimonials":
                return testimonialsImages;
            default:
                return [];
        }
    };

    const getIsLoading = (type: ImageType) => {
        switch (type) {
            case "carousel":
                return carouselLoading;
            case "hero":
                return heroLoading;
            case "services":
                return servicesLoading;
            case "vehicles":
                return vehiclesLoading;
            case "features":
                return featuresLoading;
            case "testimonials":
                return testimonialsLoading;
            default:
                return false;
        }
    };

    const toggleSection = (type: ImageType) => {
        setExpandedSections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(type)) {
                newSet.delete(type);
            } else {
                newSet.add(type);
            }
            return newSet;
        });
    };

    const handleFileSelect = async (files: File[], type: ImageType) => {
        if (files.length === 0) return;

        setUploading((prev) => ({ ...prev, [type]: true }));
        setUploadQueue((prev) => ({ ...prev, [type]: files }));

        try {
            // Upload files sequentially to avoid overwhelming the server
            for (const file of files) {
                await createImage.mutateAsync({
                    type,
                    file,
                });
            }
            setUploadQueue((prev) => ({ ...prev, [type]: [] }));
        } catch (error) {
            console.error("Error uploading images:", error);
            alert(
                `Failed to upload ${
                    files.length > 1 ? "some images" : "image"
                }. Please try again.`
            );
        } finally {
            setUploading((prev) => ({ ...prev, [type]: false }));
        }
    };

    const handleReorder = async (images: any[], type: ImageType) => {
        try {
            await updateOrder.mutateAsync({
                images,
                type,
            });
        } catch (error) {
            console.error("Error reordering images:", error);
            alert("Failed to reorder images. Please try again.");
        }
    };

    const handleToggleActive = async (
        id: string,
        isActive: boolean,
        type: ImageType
    ) => {
        try {
            await updateImage.mutateAsync({
                id,
                updates: { isActive },
                type,
            });
        } catch (error) {
            console.error("Error updating image:", error);
            alert("Failed to update image. Please try again.");
        }
    };

    const handleDelete = async (id: string, type: ImageType) => {
        if (!confirm("Are you sure you want to delete this image?")) {
            return;
        }

        try {
            await deleteImage.mutateAsync({
                id,
                type,
            });
        } catch (error) {
            console.error("Error deleting image:", error);
            alert("Failed to delete image. Please try again.");
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Home Page Images
                </h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                    Manage images for all sections of the home page
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Left Side - Collapsible Sections */}
                <div className="space-y-3">
                    {Object.entries(SECTION_CONFIG).map(([key, config]) => {
                        const type = key as ImageType;
                        const isExpanded = expandedSections.has(type);
                        const images = getImages(type);
                        const isLoading = getIsLoading(type);
                        const activeCount = images.filter(
                            (img) => img.isActive
                        ).length;

                        return (
                            <Card
                                key={key}
                                className="overflow-hidden transition-all"
                            >
                                {/* Section Header - Clickable */}
                                <button
                                    onClick={() => toggleSection(type)}
                                    className="w-full"
                                >
                                    <CardHeader className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="text-gray-600 dark:text-gray-400">
                                                    {config.icon}
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
                                                        {config.label}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {images.length} image
                                                        {images.length !== 1
                                                            ? "s"
                                                            : ""}{" "}
                                                        • {activeCount} active
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isExpanded ? (
                                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                </button>

                                {/* Collapsible Content */}
                                {isExpanded && (
                                    <div className="border-t border-gray-200 dark:border-gray-700">
                                        <CardContent className="p-4 md:p-6 space-y-4">
                                            {/* Description */}
                                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                                {config.description}
                                                {!config.multiple &&
                                                    " Only the first active image will be used."}
                                            </p>

                                            {/* Upload Section */}
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                                                    Upload Image
                                                </h4>
                                                <ImageUploader
                                                    onFileSelect={(files) =>
                                                        handleFileSelect(
                                                            files,
                                                            type
                                                        )
                                                    }
                                                    className="mb-2"
                                                    multiple={config.multiple}
                                                />
                                                {uploading[type] && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        {uploadQueue[type]
                                                            .length > 0 ? (
                                                            <span>
                                                                Uploading{" "}
                                                                {
                                                                    uploadQueue[
                                                                        type
                                                                    ].length
                                                                }{" "}
                                                                image
                                                                {uploadQueue[
                                                                    type
                                                                ].length > 1
                                                                    ? "s"
                                                                    : ""}
                                                                ...
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                Uploading...
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Images List/Gallery */}
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                                                    {config.label}
                                                    {config.showReorder &&
                                                        " (Drag to reorder)"}
                                                </h4>
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center py-12">
                                                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                                                    </div>
                                                ) : config.showReorder ? (
                                                    <DraggableImageList
                                                        images={images}
                                                        onReorder={(imgs) =>
                                                            handleReorder(
                                                                imgs,
                                                                type
                                                            )
                                                        }
                                                        onDelete={(id) =>
                                                            handleDelete(
                                                                id,
                                                                type
                                                            )
                                                        }
                                                        onToggleActive={(
                                                            id,
                                                            isActive
                                                        ) =>
                                                            handleToggleActive(
                                                                id,
                                                                isActive,
                                                                type
                                                            )
                                                        }
                                                        isLoading={
                                                            updateOrder.isPending ||
                                                            updateImage.isPending ||
                                                            deleteImage.isPending
                                                        }
                                                    />
                                                ) : (
                                                    <ImageGallery
                                                        images={images}
                                                        onDelete={(id) =>
                                                            handleDelete(
                                                                id,
                                                                type
                                                            )
                                                        }
                                                        onToggleActive={(
                                                            id,
                                                            isActive
                                                        ) =>
                                                            handleToggleActive(
                                                                id,
                                                                isActive,
                                                                type
                                                            )
                                                        }
                                                        isLoading={
                                                            updateImage.isPending ||
                                                            deleteImage.isPending
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </CardContent>
                                    </div>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {/* Right Side - Live Preview */}
                <div className="space-y-4 md:space-y-6">
                    <Card className="sticky top-4 flex flex-col h-[calc(100vh-120px)] max-h-[800px] overflow-hidden">
                        <CardHeader className="p-4 md:p-6 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Live Preview
                            </h3>
                            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                See how your images appear on the home page
                            </p>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
                            <HomePagePreview />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
