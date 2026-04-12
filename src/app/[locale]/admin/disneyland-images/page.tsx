"use client";

import {
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  LayoutTemplate,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { DisneylandPagePreview } from "@/components/admin/DisneylandPagePreview";
import { ImageGallery } from "@/components/admin/ImageGallery";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { HomePageImageSectionType } from "@/components/models/homePageImages";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  useAllHomePageImages,
  useCreateHomePageImage,
  useDeleteHomePageImage,
  useUpdateHomePageImage,
} from "@/hooks/useHomePageImages";

const DISNEYLAND_PAGE_SLOTS = [
  "disneyland-header",
  "disneyland-content",
  "disneyland-background",
  "disneyland-footer",
  "disneyland-booking",
] as const satisfies readonly HomePageImageSectionType[];

type DisneylandPageSlot = (typeof DISNEYLAND_PAGE_SLOTS)[number];

const SECTION_CONFIG: Record<
  DisneylandPageSlot,
  {
    label: string;
    description: string;
    icon: React.ReactNode;
  }
> = {
  "disneyland-header": {
    label: "Header (hero)",
    description:
      "Full-width background behind the hero title and booking buttons.",
    icon: <LayoutTemplate className="w-5 h-5" />,
  },
  "disneyland-content": {
    label: "Content band",
    description:
      "Optional visual for the main content area (e.g. hotels section intro).",
    icon: <ImageIcon className="w-5 h-5" />,
  },
  "disneyland-background": {
    label: "Page background",
    description:
      "Optional atmospheric layer; the page uses it subtly behind sections.",
    icon: <Sparkles className="w-5 h-5" />,
  },
  "disneyland-footer": {
    label: "Footer strip",
    description:
      "Decorative strip above the site footer. Only the first active image is used.",
    icon: <ImageIcon className="w-5 h-5" />,
  },
  "disneyland-booking": {
    label: "Booking CTA",
    description:
      "Background for the gradient booking section at the bottom of the page.",
    icon: <Sparkles className="w-5 h-5" />,
  },
};

export default function DisneylandImagesPage() {
  const [expandedSections, setExpandedSections] = useState<
    Set<DisneylandPageSlot>
  >(new Set(["disneyland-header"]));
  const emptyUploadQueue = (): Record<DisneylandPageSlot, File[]> => ({
    "disneyland-header": [],
    "disneyland-content": [],
    "disneyland-background": [],
    "disneyland-footer": [],
    "disneyland-booking": [],
  });

  const [uploading, setUploading] = useState<Record<DisneylandPageSlot, boolean>>(
    () => ({
      "disneyland-header": false,
      "disneyland-content": false,
      "disneyland-background": false,
      "disneyland-footer": false,
      "disneyland-booking": false,
    }),
  );
  const [uploadQueue, setUploadQueue] = useState<
    Record<DisneylandPageSlot, File[]>
  >(() => emptyUploadQueue());

  const headerQ = useAllHomePageImages("disneyland-header");
  const contentQ = useAllHomePageImages("disneyland-content");
  const backgroundQ = useAllHomePageImages("disneyland-background");
  const footerQ = useAllHomePageImages("disneyland-footer");
  const bookingQ = useAllHomePageImages("disneyland-booking");

  const createImage = useCreateHomePageImage();
  const updateImage = useUpdateHomePageImage();
  const deleteImage = useDeleteHomePageImage();

  const getImages = (type: DisneylandPageSlot) => {
    switch (type) {
      case "disneyland-header":
        return headerQ.data ?? [];
      case "disneyland-content":
        return contentQ.data ?? [];
      case "disneyland-background":
        return backgroundQ.data ?? [];
      case "disneyland-footer":
        return footerQ.data ?? [];
      case "disneyland-booking":
        return bookingQ.data ?? [];
      default:
        return [];
    }
  };

  const getIsLoading = (type: DisneylandPageSlot) => {
    switch (type) {
      case "disneyland-header":
        return headerQ.isLoading;
      case "disneyland-content":
        return contentQ.isLoading;
      case "disneyland-background":
        return backgroundQ.isLoading;
      case "disneyland-footer":
        return footerQ.isLoading;
      case "disneyland-booking":
        return bookingQ.isLoading;
      default:
        return false;
    }
  };

  const toggleSection = (type: DisneylandPageSlot) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleFileSelect = async (files: File[], type: DisneylandPageSlot) => {
    if (files.length === 0) return;

    setUploading((prev) => ({ ...prev, [type]: true }));
    setUploadQueue((prev) => ({ ...prev, [type]: files }));

    try {
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
        }. Please try again.`,
      );
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleToggleActive = async (
    id: string,
    isActive: boolean,
    type: DisneylandPageSlot,
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

  const handleDelete = async (id: string, type: DisneylandPageSlot) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    try {
      await deleteImage.mutateAsync({ id, type });
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image. Please try again.");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">
          Disneyland page images
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
          Manage header, content, background, footer strip, and booking section
          images for the Disneyland Paris page
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-3">
          {DISNEYLAND_PAGE_SLOTS.map((slot) => {
            const config = SECTION_CONFIG[slot];
            const isExpanded = expandedSections.has(slot);
            const images = getImages(slot);
            const isLoading = getIsLoading(slot);
            const activeCount = images.filter((img) => img.isActive).length;

            return (
              <Card key={slot} className="overflow-hidden transition-all">
                <button
                  onClick={() => toggleSection(slot)}
                  className="w-full"
                  type="button"
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
                            {images.length !== 1 ? "s" : ""} • {activeCount}{" "}
                            active
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </CardHeader>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4 md:p-6 space-y-4">
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        {config.description} Only the first active image is used
                        on the public page.
                      </p>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                          Upload image
                        </h4>
                        <ImageUploader
                          onFileSelect={(files) =>
                            handleFileSelect(files, slot)
                          }
                          className="mb-2"
                          multiple={false}
                        />
                        {uploading[slot] && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {uploadQueue[slot].length > 0 ? (
                              <span>Uploading…</span>
                            ) : (
                              <span>Uploading…</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                          Current images
                        </h4>
                        {isLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                          </div>
                        ) : (
                          <ImageGallery
                            images={images}
                            onDelete={(id) => handleDelete(id, slot)}
                            onToggleActive={(id, isActive) =>
                              handleToggleActive(id, isActive, slot)
                            }
                            isLoading={
                              updateImage.isPending || deleteImage.isPending
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

        <div className="space-y-4 md:space-y-6">
          <Card className="sticky top-4 flex flex-col h-[calc(100vh-120px)] max-h-[800px] overflow-hidden">
            <CardHeader className="p-4 md:p-6 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
                Live preview
              </h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                See how your images appear on the Disneyland page
              </p>
            </CardHeader>
            <CardContent className="p-0 flex-1 min-h-0 overflow-hidden">
              <DisneylandPagePreview />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
