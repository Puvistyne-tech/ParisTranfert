"use client";

import { GripVertical, Trash2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { HomePageImage } from "@/components/models/homePageImages";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

interface DraggableImageListProps {
  images: HomePageImage[];
  onReorder: (images: HomePageImage[]) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  isLoading?: boolean;
}

export function DraggableImageList({
  images,
  onReorder,
  onDelete,
  onToggleActive,
  isLoading = false,
}: DraggableImageListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;

    if (draggedIndex !== index) {
      const newImages = [...images];
      const [removed] = newImages.splice(draggedIndex, 1);
      newImages.splice(index, 0, removed);

      // Update display orders
      const reorderedImages = newImages.map((img, idx) => ({
        ...img,
        displayOrder: idx,
      }));

      onReorder(reorderedImages);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No images yet. Upload your first image to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {images.map((image, index) => (
        <Card
          key={image.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`cursor-move transition-all ${
            draggedIndex === index ? "opacity-50" : ""
          }`}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-4">
              {/* Drag Handle */}
              <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
                <GripVertical className="w-6 h-6" />
              </div>

              {/* Image Preview */}
              <div className="relative w-16 h-16 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <Image
                  src={image.imageUrl}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 64px, 96px"
                />
              </div>

              {/* Image Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
                  <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100">
                    Image {index + 1}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                    Order: {image.displayOrder}
                  </span>
                  {image.isActive ? (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-0.5 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-2 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                  {image.imageUrl}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleActive(image.id, !image.isActive)}
                  disabled={isLoading}
                  title={image.isActive ? "Deactivate" : "Activate"}
                >
                  {image.isActive ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(image.id)}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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

