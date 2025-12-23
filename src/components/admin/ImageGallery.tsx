"use client";

import { Trash2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import type { HomePageImage } from "@/components/models/homePageImages";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface ImageGalleryProps {
  images: HomePageImage[];
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  isLoading?: boolean;
}

export function ImageGallery({
  images,
  onDelete,
  onToggleActive,
  isLoading = false,
}: ImageGalleryProps) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No images yet. Upload your first image to get started.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
      {images.map((image) => (
        <Card key={image.id} className="overflow-hidden">
          <CardContent className="p-0">
            {/* Image */}
            <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700">
              <Image
                src={image.imageUrl}
                alt={`Image ${image.id}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                {image.isActive ? (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Active
                  </span>
                ) : (
                  <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
                    Inactive
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleActive(image.id, !image.isActive)}
                  disabled={isLoading}
                  className="flex-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
                  title={image.isActive ? "Deactivate" : "Activate"}
                >
                  {image.isActive ? (
                    <EyeOff className="w-4 h-4 mr-1" />
                  ) : (
                    <Eye className="w-4 h-4 mr-1" />
                  )}
                  {image.isActive ? "Hide" : "Show"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(image.id)}
                  disabled={isLoading}
                  className="bg-red-500/90 hover:bg-red-600 text-white backdrop-blur-sm"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

